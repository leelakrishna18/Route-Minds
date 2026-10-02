from flask import Blueprint, request, current_app
from app.extensions import db
from app.models.sms import SmsRouteCode, SmsRegistration, SmsLog
from app.services.sms_service import process_incoming_sms
from app.utils.responses import success_response, error_response
from app.utils.validators import validate_mobile, sanitize_mobile

sms_bp = Blueprint("sms", __name__, url_prefix="/api/v1/sms")

@sms_bp.route("/codes", methods=["GET"])
def get_route_codes():
    """Public list of active SMS route codes and descriptions"""
    codes = SmsRouteCode.query.filter_by(is_active=True).all()
    return success_response({
        "sms_number": "56070 (or +91-8812-APSRTC)",
        "instructions": "Send the route code (e.g. VJY) via SMS to receive immediate scheduled departure times on your phone.",
        "codes": [c.to_dict() for c in codes]
    })

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
    """
    Inbound SMS webhook.
    Accepts Twilio standard format (From, Body) or generic JSON {sender, message, secret}.
    """
    secret = request.headers.get("X-SMS-Webhook-Secret") or request.args.get("secret")
    expected_secret = current_app.config.get("SMS_WEBHOOK_SECRET")

    # If secret is configured and not in dev mock mode, check it
    if expected_secret and current_app.config.get("SMS_PROVIDER") != "mock":
        if secret != expected_secret:
            return error_response("Unauthorized SMS webhook signature.", "UNAUTHORIZED_WEBHOOK", status_code=401)

    # Detect payload format
    sender = None
    message = None

    if request.is_json:
        data = request.get_json() or {}
        sender = data.get("sender") or data.get("From") or data.get("mobile_number")
        message = data.get("message") or data.get("Body") or data.get("text")
    else:
        # Form-urlencoded (Twilio / Fast2SMS default)
        sender = request.form.get("From") or request.form.get("sender")
        message = request.form.get("Body") or request.form.get("message")

    if not sender or not message:
        return error_response("Both sender phone number and message body are required.", "INVALID_PAYLOAD", status_code=400)

    result = process_incoming_sms(sender, message)
    return success_response(result, message="SMS processed successfully.")

@sms_bp.route("/simulator/history", methods=["GET"])
def get_sms_history():
    """Allows testing and viewing SMS transaction logs"""
    logs = SmsLog.query.order_by(SmsLog.created_at.desc()).limit(20).all()
    return success_response([log.to_dict() for log in logs])
