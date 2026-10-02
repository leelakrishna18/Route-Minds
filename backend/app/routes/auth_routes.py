from flask import Blueprint, request, g
from app.extensions import db
from app.models.user import User, PassengerProfile
from app.services.auth_service import hash_password, check_password, generate_tokens
from app.utils.validators import validate_email, validate_mobile, sanitize_mobile, validate_password_strength
from app.utils.responses import success_response, error_response
from app.utils.decorators import jwt_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/v1/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    
    email = data.get("email", "").strip().lower()
    mobile = data.get("mobile_number", "").strip()
    full_name = data.get("full_name", "").strip()
    password = data.get("password", "")
    confirm_password = data.get("confirm_password", "")
    terms_accepted = data.get("terms_accepted", False)

    # Validations
    if not terms_accepted:
        return error_response("You must accept the Terms of Service and Privacy Policy.", "TERMS_REQUIRED", status_code=400)

    if not full_name:
        return error_response("Full name is required.", "VALIDATION_ERROR", status_code=400)

    if not validate_email(email):
        return error_response("Please provide a valid email address.", "INVALID_EMAIL", status_code=400)

    if not validate_mobile(mobile):
        return error_response("Please provide a valid 10-digit Indian mobile number.", "INVALID_MOBILE", status_code=400)
    
    clean_mobile = sanitize_mobile(mobile)

    if password != confirm_password:
        return error_response("Passwords do not match.", "PASSWORD_MISMATCH", status_code=400)

    is_strong, password_errors = validate_password_strength(password)
    if not is_strong:
        return error_response(password_errors[0], "WEAK_PASSWORD", errors=password_errors, status_code=400)

    # Prevent duplicate accounts
    if User.query.filter_by(email=email).first():
        return error_response("An account with this email address already exists.", "DUPLICATE_EMAIL", status_code=409)

    if User.query.filter_by(mobile_number=clean_mobile).first():
        return error_response("An account with this mobile number already exists.", "DUPLICATE_MOBILE", status_code=409)

    # Create User
    new_user = User(
        email=email,
        mobile_number=clean_mobile,
        password_hash=hash_password(password),
        role="passenger",
        is_active=True
    )
    db.session.add(new_user)
    db.session.flush()

    # Create Profile
    new_profile = PassengerProfile(
        user_id=new_user.id,
        full_name=full_name,
        preferred_language=data.get("preferred_language", "en")
    )
    db.session.add(new_profile)
    db.session.commit()

    token_data = generate_tokens(new_user)
    return success_response(token_data, message="Registration successful. Welcome to APSRTC!", status_code=201)

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    identifier = data.get("identifier", "").strip() # can be email or mobile
    password = data.get("password", "")

    if not identifier or not password:
        return error_response("Please enter your email/mobile and password.", "MISSING_CREDENTIALS", status_code=400)

    # Lookup by email or mobile
    user = None
    if "@" in identifier:
        user = User.query.filter_by(email=identifier.lower()).first()
    else:
        clean_mob = sanitize_mobile(identifier)
        user = User.query.filter_by(mobile_number=clean_mob).first()

    if not user or not check_password(password, user.password_hash):
        return error_response("Invalid credentials. Please verify your details and try again.", "INVALID_CREDENTIALS", status_code=401)

    if not user.is_active:
        return error_response("Your account has been deactivated. Please contact APSRTC Helpdesk.", "ACCOUNT_DISABLED", status_code=403)

    token_data = generate_tokens(user)
    return success_response(token_data, message=f"Welcome back, {user.profile.full_name if user.profile else 'Passenger'}!")

@auth_bp.route("/me", methods=["GET"])
@jwt_required
def get_current_user():
    return success_response(g.current_user.to_dict())

@auth_bp.route("/profile", methods=["PUT"])
@jwt_required
def update_profile():
    data = request.get_json() or {}
    profile = g.current_user.profile
    if not profile:
        profile = PassengerProfile(user_id=g.current_user.id, full_name="Passenger")
        db.session.add(profile)

    if "full_name" in data and data["full_name"].strip():
        profile.full_name = data["full_name"].strip()
    if "preferred_language" in data:
        profile.preferred_language = data["preferred_language"]
    if "emergency_blood_group" in data:
        profile.emergency_blood_group = data["emergency_blood_group"]
    if "medical_notes" in data:
        profile.medical_notes = data["medical_notes"]

    db.session.commit()
    return success_response(g.current_user.to_dict(), message="Profile updated successfully.")

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json() or {}
    email = data.get("email", "").strip().lower()
    if not email:
        return error_response("Email is required.", "MISSING_EMAIL", status_code=400)

    user = User.query.filter_by(email=email).first()
    # Always return success message to prevent user enumeration attacks
    return success_response(
        {"reset_requested": True},
        message="If an account with that email exists, password reset instructions have been dispatched."
    )
