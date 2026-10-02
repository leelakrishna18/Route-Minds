import uuid
import random
from datetime import datetime, date
from app.extensions import db

def generate_complaint_reference():
    timestamp = datetime.utcnow().strftime("%Y%m%d")
    random_digits = "".join([str(random.randint(0, 9)) for _ in range(5)])
    return f"APSRTC-CMP-{timestamp}-{random_digits}"

class Complaint(db.Model):
    __tablename__ = "complaints"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reference_id = db.Column(db.String(50), unique=True, nullable=False, default=generate_complaint_reference, index=True)
    passenger_id = db.Column(db.String(36), db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    category = db.Column(db.String(50), nullable=False) # "Bus delay", "Staff behaviour", "Cleanliness", "Bus condition", "Route-related issue", "Other"
    subject = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    service_number = db.Column(db.String(50), nullable=True) # e.g. "ELR-HYD-AMARAVATHI-2200" or bus plate
    travel_date = db.Column(db.Date, nullable=True)
    
    current_status = db.Column(db.String(30), default="Submitted", nullable=False, index=True) # "Submitted", "Under Review", "In Progress", "Resolved", "Rejected"
    admin_response = db.Column(db.Text, nullable=True) # Publicly visible response to passenger
    internal_note = db.Column(db.Text, nullable=True)  # Admin-only note
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    attachments = db.relationship("ComplaintAttachment", backref="complaint", cascade="all, delete-orphan")
    status_history = db.relationship("ComplaintStatusHistory", backref="complaint", order_by="ComplaintStatusHistory.created_at.desc()", cascade="all, delete-orphan")

    def to_dict(self, include_internal=False):
        return {
            "id": self.id,
            "reference_id": self.reference_id,
            "passenger_id": self.passenger_id,
            "passenger_name": self.passenger.profile.full_name if self.passenger and self.passenger.profile else "Passenger",
            "passenger_mobile": self.passenger.mobile_number if self.passenger else None,
            "category": self.category,
            "subject": self.subject,
            "description": self.description,
            "service_number": self.service_number,
            "travel_date": self.travel_date.isoformat() if self.travel_date else None,
            "current_status": self.current_status,
            "admin_response": self.admin_response,
            "internal_note": self.internal_note if include_internal else None,
            "attachments": [att.to_dict() for att in self.attachments],
            "status_history": [hist.to_dict(include_internal=include_internal) for hist in self.status_history],
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

class ComplaintAttachment(db.Model):
    __tablename__ = "complaint_attachments"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    complaint_id = db.Column(db.String(36), db.ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    file_name = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    mime_type = db.Column(db.String(100), nullable=False)
    file_size_bytes = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "file_name": self.file_name,
            "file_url": f"/api/v1/complaints/attachments/{self.id}",
            "mime_type": self.mime_type,
            "file_size_bytes": self.file_size_bytes,
            "created_at": self.created_at.isoformat()
        }

class ComplaintStatusHistory(db.Model):
    __tablename__ = "complaint_status_history"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    complaint_id = db.Column(db.String(36), db.ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    previous_status = db.Column(db.String(30), nullable=False)
    new_status = db.Column(db.String(30), nullable=False)
    changed_by_user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True)
    note = db.Column(db.Text, nullable=True)
    passenger_message = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    changed_by = db.relationship("User")

    def to_dict(self, include_internal=False):
        return {
            "id": self.id,
            "previous_status": self.previous_status,
            "new_status": self.new_status,
            "changed_by": self.changed_by.profile.full_name if self.changed_by and self.changed_by.profile else (self.changed_by.email if self.changed_by else "System"),
            "note": self.note if include_internal else None,
            "passenger_message": self.passenger_message,
            "created_at": self.created_at.isoformat()
        }
