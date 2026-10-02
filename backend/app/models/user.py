import uuid
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

# Will be initialized in app/__init__.py
from app.extensions import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    mobile_number = db.Column(db.String(15), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="passenger")  # 'passenger' or 'admin'
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    profile = db.relationship("PassengerProfile", backref="user", uselist=False, cascade="all, delete-orphan")
    trusted_contacts = db.relationship("TrustedContact", backref="user", lazy="dynamic", cascade="all, delete-orphan")
    complaints = db.relationship("Complaint", backref="passenger", lazy="dynamic", cascade="all, delete-orphan")
    location_sessions = db.relationship("LocationSharingSession", backref="passenger", lazy="dynamic", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "mobile_number": self.mobile_number,
            "role": self.role,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
            "profile": self.profile.to_dict() if self.profile else None
        }

class PassengerProfile(db.Model):
    __tablename__ = "passenger_profiles"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    full_name = db.Column(db.String(100), nullable=False)
    preferred_language = db.Column(db.String(10), default="en", nullable=False)  # 'en' or 'te'
    emergency_blood_group = db.Column(db.String(10), nullable=True)
    medical_notes = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "preferred_language": self.preferred_language,
            "emergency_blood_group": self.emergency_blood_group,
            "medical_notes": self.medical_notes
        }
