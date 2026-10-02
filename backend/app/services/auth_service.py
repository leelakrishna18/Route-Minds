import jwt
import bcrypt
from datetime import datetime, timezone
from flask import current_app
from app.models.user import User

def hash_password(plain_password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(plain_password.encode("utf-8"), salt).decode("utf-8")

def check_password(plain_password: str, hashed_password: str) -> bool:
    if not plain_password or not hashed_password:
        return False
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def generate_tokens(user: User) -> dict:
    now = datetime.now(timezone.utc)
    expiration = now + current_app.config["JWT_EXPIRATION_DELTA"]
    
    payload = {
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "name": user.profile.full_name if user.profile else user.email,
        "mobile": user.mobile_number,
        "pw_hash": user.password_hash,
        "iat": int(now.timestamp()),
        "exp": int(expiration.timestamp())
    }
    
    token = jwt.encode(payload, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")
    return {
        "access_token": token,
        "expires_in": int(current_app.config["JWT_EXPIRATION_DELTA"].total_seconds()),
        "token_type": "Bearer",
        "user": user.to_dict()
    }

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired. Please log in again.")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid authentication token.")
