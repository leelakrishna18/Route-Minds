from flask import Blueprint, request, current_app
from app.extensions import db
from app.models.sms import SmsRouteCode, SmsRegistration, SmsLog, KeypadUser
from app.services.sms_service import process_incoming_sms
from app.utils.responses import success_response, error_response
from app.utils.validators import validate_mobile, sanitize_mobile
from app.utils.decorators import get_auth_token
from app.services.auth_service import decode_token

sms_bp = Blueprint("sms", __name__, url_prefix="/api/v1/sms")

def get_optional_user_id():
    token = get_auth_token()
    if token:
        try:
            payload = decode_token(token)
            return payload.get("sub")
        except Exception:
            return None
    return None

@sms_bp.route("/codes", methods=["GET"])
def get_route_codes():
    """Public list of active SMS route codes and descriptions"""
    codes = SmsRouteCode.query.filter_by(is_active=True).all()
    return success_response({
        "sms_number": "56070 (or +91-8812-APSRTC)",
        "instructions": "Send the route code (e.g. VJY) via SMS to receive immediate scheduled departure times on your phone.",
        "codes": [c.to_dict() for c in codes]
    })

@sms_bp.route("/keypad-users", methods=["GET"])
def list_keypad_users():
    """List keypad users registered by smartphone passengers"""
    user_id = get_optional_user_id()

    if user_id:
        users = KeypadUser.query.filter_by(registered_by_user_id=user_id, is_active=True).all()
    else:
        users = KeypadUser.query.filter_by(is_active=True).limit(20).all()

    return success_response([u.to_dict() for u in users])

@sms_bp.route("/keypad-users", methods=["POST"])
def register_keypad_user():
    """Smartphone user registers a keypad/feature phone user for SMS schedules"""
    user_id = get_optional_user_id()

    data = request.get_json() or {}
    name = data.get("name", "").strip()
    mobile = data.get("mobile_number", "").strip()
    route_code = data.get("preferred_route_code", "VJY").strip().upper()
    relationship = data.get("relationship", "Family Member").strip()

    if not name:
        return error_response("Keypad user name is required.", "MISSING_NAME", status_code=400)
    if not validate_mobile(mobile):
        return error_response("Please enter a valid 10-digit Indian mobile number.", "INVALID_MOBILE", status_code=400)

    clean_mobile = sanitize_mobile(mobile)

    # Ensure mobile exists in SmsRegistration
    reg = SmsRegistration.query.filter_by(mobile_number=clean_mobile).first()
    if not reg:
        reg = SmsRegistration(mobile_number=clean_mobile, is_verified=True, query_count=0)
        db.session.add(reg)

    keypad_user = KeypadUser(
        registered_by_user_id=user_id,
        name=name,
        mobile_number=clean_mobile,
        preferred_route_code=route_code,
        relationship=relationship,
        is_active=True
    )
    db.session.add(keypad_user)
    db.session.commit()

    return success_response(keypad_user.to_dict(), message=f"Keypad user {name} (+91-{clean_mobile}) registered successfully.", status_code=201)

@sms_bp.route("/keypad-users/<user_id>", methods=["DELETE"])
def delete_keypad_user(user_id):
    k_user = KeypadUser.query.get(user_id)
    if not k_user:
        return error_response("Keypad user not found.", "NOT_FOUND", status_code=404)
    k_user.is_active = False
    db.session.commit()
    return success_response(None, message="Keypad user removed.")

@sms_bp.route("/send-schedule", methods=["POST"])
def dispatch_schedule_sms():
    """Directly send bus timetable SMS to any keypad or mobile number"""
    data = request.get_json() or {}
    recipient_mobile = data.get("recipient_mobile") or data.get("mobile_number") or ""
    route_code = (data.get("route_code") or "VJY").strip().upper()

    recipient_mobile = recipient_mobile.strip()
    if not validate_mobile(recipient_mobile):
        return error_response("Please provide a valid 10-digit mobile number.", "INVALID_MOBILE", status_code=400)

    clean_mobile = sanitize_mobile(recipient_mobile)
    result = process_incoming_sms(clean_mobile, route_code)

    return success_response(result, message=f"SMS dispatched to +91-{clean_mobile} with route '{route_code}' schedule.")

@sms_bp.route("/register", methods=["POST"])
def register_mobile():
    data = request.get_json() or {}
    mobile = data.get("mobile_number", "").strip()

    if not validate_mobile(mobile):
        return error_response("Please enter a valid 10-digit Indian mobile number.", "INVALID_MOBILE", status_code=400)

    clean_mobile = sanitize_mobile(mobile)
    reg = SmsRegistration.query.filter_by(mobile_number=clean_mobile).first()
    if not reg:
        reg = SmsRegistration(
            mobile_number=clean_mobile,
            is_verified=True,
            query_count=0
        )
        db.session.add(reg)
        db.session.commit()

    return success_response({
        "mobile_number": clean_mobile,
        "is_verified": True,
        "sms_gateway_status": "Ready",
        "instructions": "Your mobile number has been registered for APSRTC SMS Route Enquiry. You may text any code to receive timings."
    }, message="Mobile registration successful.", status_code=201)

@sms_bp.route("/webhook", methods=["POST"])
def sms_webhook():
    secret = request.headers.get("X-SMS-Webhook-Secret") or request.args.get("secret")
    expected_secret = current_app.config.get("SMS_WEBHOOK_SECRET")

    if expected_secret and current_app.config.get("SMS_PROVIDER") != "mock":
        if secret != expected_secret:
            return error_response("Unauthorized SMS webhook signature.", "UNAUTHORIZED_WEBHOOK", status_code=401)

    sender = None
    message = None

    if request.is_json:
        data = request.get_json() or {}
        sender = data.get("sender") or data.get("From") or data.get("mobile_number")
        message = data.get("message") or data.get("Body") or data.get("text")
    else:
        sender = request.form.get("From") or request.form.get("sender")
        message = request.form.get("Body") or request.form.get("message")

    if not sender or not message:
        return error_response("Both sender phone number and message body are required.", "INVALID_PAYLOAD", status_code=400)

    result = process_incoming_sms(sender, message)
    return success_response(result, message="SMS processed successfully.")

@sms_bp.route("/simulator/history", methods=["GET"])
def get_sms_history():
    logs = SmsLog.query.order_by(SmsLog.created_at.desc()).limit(20).all()
    return success_response([log.to_dict() for log in logs])

