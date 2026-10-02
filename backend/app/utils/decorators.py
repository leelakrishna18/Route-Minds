from functools import wraps
from flask import request, g
from app.services.auth_service import decode_token
from app.models.user import User
from app.utils.responses import error_response

def get_auth_token():
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        # Also check cookie if used
        token = request.cookies.get("access_token")
        return token
    parts = auth_header.split()
    if len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    return None

def get_or_restore_user(payload: dict):
    user_id = payload.get("sub")
    if not user_id:
        return None
    user = User.query.get(user_id)
    if not user and payload.get("email"):
        from app.models.user import PassengerProfile
        from app.extensions import db
        user = User.query.filter_by(email=payload["email"]).first()
        if not user:
            try:
                user = User(
                    id=user_id,
                    email=payload["email"],
                    mobile_number=payload.get("mobile", "9999999999"),
                    password_hash=payload.get("pw_hash", ""),
                    role=payload.get("role", "passenger"),
                    is_active=True
                )
                db.session.add(user)
                db.session.flush()
                profile = PassengerProfile(
                    user_id=user.id,
                    full_name=payload.get("name", "Passenger"),
                    preferred_language="en"
                )
                db.session.add(profile)
                db.session.commit()
            except Exception:
                db.session.rollback()
                user = User.query.filter_by(email=payload["email"]).first()
    return user

def jwt_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = get_auth_token()
        if not token:
            return error_response("Authentication token is missing. Please log in.", "UNAUTHORIZED", status_code=401)
        try:
            payload = decode_token(token)
            user = get_or_restore_user(payload)
            if not user or not user.is_active:
                return error_response("Account inactive or not found.", "UNAUTHORIZED", status_code=401)
            g.current_user = user
        except ValueError as e:
            return error_response(str(e), "INVALID_TOKEN", status_code=401)
        except Exception:
            return error_response("Token verification failed.", "AUTH_ERROR", status_code=401)
        return f(*args, **kwargs)
    return decorated_function

def roles_required(allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            token = get_auth_token()
            if not token:
                return error_response("Authentication token is missing.", "UNAUTHORIZED", status_code=401)
            try:
                payload = decode_token(token)
                user = get_or_restore_user(payload)
                if not user or not user.is_active:
                    return error_response("Account inactive or not found.", "UNAUTHORIZED", status_code=401)
                if user.role not in allowed_roles:
                    return error_response("Forbidden: You do not have permission to access this resource.", "FORBIDDEN", status_code=403)
                g.current_user = user
            except ValueError as e:
                return error_response(str(e), "INVALID_TOKEN", status_code=401)
            except Exception:
                return error_response("Token verification failed.", "AUTH_ERROR", status_code=401)
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def optional_jwt(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = get_auth_token()
        g.current_user = None
        if token:
            try:
                payload = decode_token(token)
                user = get_or_restore_user(payload)
                if user and user.is_active:
                    g.current_user = user
            except Exception:
                pass
        return f(*args, **kwargs)
    return decorated_function
