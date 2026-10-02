import uuid
from datetime import datetime
from app.extensions import db

class AdminAuditLog(db.Model):
    __tablename__ = "admin_audit_logs"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    admin_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)
    action = db.Column(db.String(100), nullable=False) # e.g. "UPDATE_COMPLAINT_STATUS", "IMPORT_TIMETABLE_CSV", "DEACTIVATE_SERVICE"
    entity_type = db.Column(db.String(50), nullable=False) # e.g. "Complaint", "BusService", "SmsRouteCode"
    entity_id = db.Column(db.String(50), nullable=True)
    details = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    admin = db.relationship("User")

    def to_dict(self):
        return {
            "id": self.id,
            "admin_name": self.admin.profile.full_name if self.admin and self.admin.profile else (self.admin.email if self.admin else "Admin"),
            "action": self.action,
            "entity_type": self.entity_type,
            "entity_id": self.entity_id,
            "details": self.details,
            "ip_address": self.ip_address,
            "created_at": self.created_at.isoformat()
        }
