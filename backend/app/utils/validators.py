import re

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
MOBILE_REGEX = re.compile(r"^[6-9]\d{9}$")  # Standard Indian 10-digit mobile number starting with 6,7,8,9

def validate_email(email: str) -> bool:
    if not email or not isinstance(email, str):
        return False
    return bool(EMAIL_REGEX.match(email.strip()))

def validate_mobile(mobile: str) -> bool:
    if not mobile or not isinstance(mobile, str):
        return False
    # Strip +91, 0, or spaces/dashes if present
    cleaned = re.sub(r"[\s\-\+]", "", mobile.strip())
    if cleaned.startswith("91") and len(cleaned) == 12:
        cleaned = cleaned[2:]
    elif cleaned.startswith("0") and len(cleaned) == 11:
        cleaned = cleaned[1:]
    return bool(MOBILE_REGEX.match(cleaned))

def sanitize_mobile(mobile: str) -> str:
    cleaned = re.sub(r"[\s\-\+]", "", mobile.strip())
    if cleaned.startswith("91") and len(cleaned) == 12:
        return cleaned[2:]
    if cleaned.startswith("0") and len(cleaned) == 11:
        return cleaned[1:]
    return cleaned

def validate_password_strength(password: str) -> tuple[bool, list[str]]:
    """
    Requirements:
    - At least 8 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character
    """
    errors = []
    if not password or len(password) < 8:
        errors.append("Password must be at least 8 characters long.")
    if not re.search(r"[A-Z]", password):
        errors.append("Password must contain at least one uppercase letter.")
    if not re.search(r"[a-z]", password):
        errors.append("Password must contain at least one lowercase letter.")
    if not re.search(r"\d", password):
        errors.append("Password must contain at least one number.")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        errors.append("Password must contain at least one special character.")
    
    return len(errors) == 0, errors

def validate_time_format(time_str: str) -> bool:
    """Validate HH:MM 24-hour time format"""
    if not time_str or not isinstance(time_str, str):
        return False
    match = re.match(r"^([01]\d|2[0-3]):([0-5]\d)$", time_str.strip())
    return bool(match)
