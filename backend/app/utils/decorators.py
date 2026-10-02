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

def jwt_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = get_auth_token()
        if not token:
            return error_response("Authentication token is missing. Please log in.", "UNAUTHORIZED", status_code=401)
        try:
            payload = decode_token(token)
            user = User.query.get(payload["sub"])
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
                user = User.query.get(payload["sub"])
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
                user = User.query.get(payload["sub"])
                if user and user.is_active:
                    g.current_user = user
            except Exception:
                pass
        return f(*args, **kwargs)
    return decorated_function
