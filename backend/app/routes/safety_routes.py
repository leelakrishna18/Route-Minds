import secrets
from datetime import datetime, timedelta
from flask import Blueprint, request, g
from app.extensions import db
from app.models.safety import TrustedContact, LocationSharingSession
from app.utils.responses import success_response, error_response
from app.utils.decorators import jwt_required
from app.utils.validators import validate_mobile, sanitize_mobile

safety_bp = Blueprint("safety", __name__, url_prefix="/api/v1/safety")

# 1. Trusted Contacts
@safety_bp.route("/contacts", methods=["GET"])
@jwt_required
def get_contacts():
    contacts = TrustedContact.query.filter_by(user_id=g.current_user.id).order_by(TrustedContact.is_primary.desc(), TrustedContact.created_at.asc()).all()
    return success_response([c.to_dict() for c in contacts])

@safety_bp.route("/contacts", methods=["POST"])
@jwt_required
def add_contact():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    mobile = data.get("mobile_number", "").strip()
    relationship = data.get("relationship", "").strip()
    is_primary = data.get("is_primary", False)

    if not name:
        return error_response("Contact name is required.", "MISSING_NAME", status_code=400)
    
    if not validate_mobile(mobile):
        return error_response("Please provide a valid 10-digit mobile number.", "INVALID_MOBILE", status_code=400)

    clean_mobile = sanitize_mobile(mobile)

    # Check maximum 5 contacts
    current_count = TrustedContact.query.filter_by(user_id=g.current_user.id).count()
    if current_count >= 5:
        return error_response("You can register a maximum of 5 trusted emergency contacts.", "LIMIT_EXCEEDED", status_code=400)

    # If setting as primary, unset other primaries
    if is_primary:
        TrustedContact.query.filter_by(user_id=g.current_user.id).update({"is_primary": False})

    contact = TrustedContact(
        user_id=g.current_user.id,
        name=name,
        mobile_number=clean_mobile,
        relationship=relationship or "Emergency Contact",
        is_primary=is_primary or (current_count == 0)
    )
    db.session.add(contact)
    db.session.commit()

    return success_response(contact.to_dict(), message="Trusted contact saved successfully.", status_code=201)

@safety_bp.route("/contacts/<contact_id>", methods=["PUT"])
@jwt_required
def update_contact(contact_id):
    contact = TrustedContact.query.filter_by(id=contact_id, user_id=g.current_user.id).first()
    if not contact:
        return error_response("Contact not found.", "NOT_FOUND", status_code=404)

    data = request.get_json() or {}
    if "name" in data and data["name"].strip():
        contact.name = data["name"].strip()
    if "mobile_number" in data:
        if not validate_mobile(data["mobile_number"]):
            return error_response("Invalid mobile number format.", "INVALID_MOBILE", status_code=400)
        contact.mobile_number = sanitize_mobile(data["mobile_number"])
    if "relationship" in data:
        contact.relationship = data["relationship"]
    if "is_primary" in data and data["is_primary"]:
        TrustedContact.query.filter_by(user_id=g.current_user.id).update({"is_primary": False})
        contact.is_primary = True

    db.session.commit()
    return success_response(contact.to_dict(), message="Contact updated successfully.")

@safety_bp.route("/contacts/<contact_id>", methods=["DELETE"])
@jwt_required
def delete_contact(contact_id):
    contact = TrustedContact.query.filter_by(id=contact_id, user_id=g.current_user.id).first()
    if not contact:
        return error_response("Contact not found.", "NOT_FOUND", status_code=404)

    db.session.delete(contact)
    db.session.commit()
    return success_response(None, message="Contact deleted successfully.")

# 2. Location Sharing Sessions
@safety_bp.route("/location/start", methods=["POST"])
@jwt_required
def start_location_sharing():
    data = request.get_json() or {}
    lat = data.get("latitude")
    lng = data.get("longitude")
    accuracy = data.get("accuracy_meters")

    # Deactivate existing active sessions
    LocationSharingSession.query.filter_by(user_id=g.current_user.id, is_active=True).update({"is_active": False})

    token = secrets.token_urlsafe(32)
    session = LocationSharingSession(
        user_id=g.current_user.id,
        sharing_token=token,
        last_latitude=lat,
        last_longitude=lng,
        last_accuracy_meters=accuracy,
        is_active=True,
        expires_at=datetime.utcnow() + timedelta(hours=4)
    )
    db.session.add(session)
    db.session.commit()

    return success_response({
        "session": session.to_dict(),
        "share_url": f"/safety/live/{token}",
        "instructions": "Location sharing is now active. You may share this secure link with your trusted contact."
    }, message="Location sharing started.")

@safety_bp.route("/location/update", methods=["POST"])
@jwt_required
def update_location():
    data = request.get_json() or {}
    lat = data.get("latitude")
    lng = data.get("longitude")
    accuracy = data.get("accuracy_meters")

    session = LocationSharingSession.query.filter_by(user_id=g.current_user.id, is_active=True).first()
    if not session:
        return error_response("No active location sharing session found.", "NO_ACTIVE_SESSION", status_code=404)

    if session.expires_at <= datetime.utcnow():
        session.is_active = False
        db.session.commit()
        return error_response("Location sharing session has expired.", "SESSION_EXPIRED", status_code=400)

    session.last_latitude = lat
    session.last_longitude = lng
    session.last_accuracy_meters = accuracy
    session.updated_at = datetime.utcnow()
    db.session.commit()

    return success_response(session.to_dict(), message="Location updated.")

@safety_bp.route("/location/stop", methods=["POST"])
@jwt_required
def stop_location_sharing():
    LocationSharingSession.query.filter_by(user_id=g.current_user.id, is_active=True).update({"is_active": False})
    db.session.commit()
    return success_response(None, message="Location sharing stopped. No further location data will be transmitted.")

@safety_bp.route("/location/view/<token>", methods=["GET"])
def view_shared_location(token):
    session = LocationSharingSession.query.filter_by(sharing_token=token, is_active=True).first()
    if not session or session.expires_at <= datetime.utcnow():
        return error_response("This location link is inactive or has expired.", "LINK_EXPIRED", status_code=404)

    return success_response({
        "passenger_name": session.passenger.profile.full_name if session.passenger and session.passenger.profile else "APSRTC Passenger",
        "latitude": session.last_latitude,
        "longitude": session.last_longitude,
        "accuracy_meters": session.last_accuracy_meters,
        "updated_at": session.updated_at.isoformat(),
        "expires_at": session.expires_at.isoformat()
    })
