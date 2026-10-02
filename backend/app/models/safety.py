import uuid
from datetime import datetime, timedelta
from app.extensions import db

class TrustedContact(db.Model):
    __tablename__ = "trusted_contacts"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    mobile_number = db.Column(db.String(15), nullable=False)
    relationship = db.Column(db.String(50), nullable=True)  # Parent, Sibling, Friend, Guardian
    is_primary = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "mobile_number": self.mobile_number,
            "relationship": self.relationship,
            "is_primary": self.is_primary,
            "created_at": self.created_at.isoformat()
        }

class LocationSharingSession(db.Model):
    __tablename__ = "location_sharing_sessions"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    sharing_token = db.Column(db.String(64), unique=True, nullable=False, index=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    last_latitude = db.Column(db.Float, nullable=True)
    last_longitude = db.Column(db.Float, nullable=True)
    last_accuracy_meters = db.Column(db.Float, nullable=True)
    expires_at = db.Column(db.DateTime, default=lambda: datetime.utcnow() + timedelta(hours=4), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "session_id": self.id,
            "sharing_token": self.sharing_token,
            "is_active": self.is_active and (self.expires_at > datetime.utcnow()),
            "last_latitude": self.last_latitude,
            "last_longitude": self.last_longitude,
            "last_accuracy_meters": self.last_accuracy_meters,
            "expires_at": self.expires_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
