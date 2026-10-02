import uuid
from datetime import datetime
from app.extensions import db

class SmsRouteCode(db.Model):
    __tablename__ = "sms_route_codes"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    route_code = db.Column(db.String(20), unique=True, nullable=False, index=True) # e.g. "VJY", "HYD", "TPG", "RJY"
    route_id = db.Column(db.String(36), db.ForeignKey("routes.id", ondelete="CASCADE"), nullable=False)
    description = db.Column(db.String(200), nullable=False) # e.g. "Eluru to Vijayawada Non-Stop"
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    route = db.relationship("Route")

    def to_dict(self):
        return {
            "id": self.id,
            "route_code": self.route_code,
            "route_id": self.route_id,
            "route_name": self.route.route_name if self.route else None,
            "description": self.description,
            "is_active": self.is_active
        }

class SmsRegistration(db.Model):
    __tablename__ = "sms_registrations"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    mobile_number = db.Column(db.String(15), unique=True, nullable=False, index=True)
    is_verified = db.Column(db.Boolean, default=True, nullable=False)
    verification_code = db.Column(db.String(10), nullable=True)
    registered_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    last_query_at = db.Column(db.DateTime, nullable=True)
    query_count = db.Column(db.Integer, default=0, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "mobile_number": self.mobile_number,
            "is_verified": self.is_verified,
            "registered_at": self.registered_at.isoformat(),
            "query_count": self.query_count
        }

class SmsLog(db.Model):
    __tablename__ = "sms_logs"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sender_mobile = db.Column(db.String(15), nullable=False, index=True)
    incoming_text = db.Column(db.String(160), nullable=False)
    response_text = db.Column(db.Text, nullable=False)
    route_code_matched = db.Column(db.String(20), nullable=True)
    status = db.Column(db.String(30), default="SENT", nullable=False) # "SENT", "FAILED", "INVALID_CODE", "UNREGISTERED"
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "sender_mobile": self.sender_mobile[:4] + "****" + self.sender_mobile[-2:] if len(self.sender_mobile) >= 6 else self.sender_mobile,
            "incoming_text": self.incoming_text,
            "response_text": self.response_text,
            "route_code_matched": self.route_code_matched,
            "status": self.status,
            "created_at": self.created_at.isoformat()
        }

class KeypadUser(db.Model):
    __tablename__ = "keypad_users"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    registered_by_user_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    name = db.Column(db.String(100), nullable=False)
    mobile_number = db.Column(db.String(15), nullable=False, index=True)
    preferred_route_code = db.Column(db.String(20), nullable=True) # e.g. "VJY"
    relationship = db.Column(db.String(50), nullable=True) # "Parent", "Grandparent", "Neighbor", "Elderly Relative"
    alert_frequency = db.Column(db.String(50), default="ON_DEMAND", nullable=False)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "registered_by_user_id": self.registered_by_user_id,
            "name": self.name,
            "mobile_number": self.mobile_number,
            "preferred_route_code": self.preferred_route_code,
            "relationship": self.relationship,
            "alert_frequency": self.alert_frequency,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat()
        }

