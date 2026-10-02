import os
from datetime import datetime, date
from flask import Blueprint, request, g, send_file
from app.extensions import db
from app.models.complaint import Complaint, ComplaintAttachment, ComplaintStatusHistory
from app.services.storage_service import save_uploaded_file
from app.utils.responses import success_response, error_response
from app.utils.decorators import jwt_required

complaint_bp = Blueprint("complaints", __name__, url_prefix="/api/v1/complaints")

VALID_CATEGORIES = [
    "Bus delay",
    "Staff behaviour",
    "Cleanliness",
    "Bus condition",
    "Route-related issue",
    "Other"
]

@complaint_bp.route("", methods=["POST"])
@jwt_required
def submit_complaint():
    # Handle multipart form data or json
    category = request.form.get("category", "").strip()
    subject = request.form.get("subject", "").strip()
    description = request.form.get("description", "").strip()
    service_number = request.form.get("service_number", "").strip()
    travel_date_str = request.form.get("travel_date")

    # If JSON was sent instead
    if not category and request.is_json:
        data = request.get_json()
        category = data.get("category", "").strip()
        subject = data.get("subject", "").strip()
        description = data.get("description", "").strip()
        service_number = data.get("service_number", "").strip()
        travel_date_str = data.get("travel_date")

    if not category or category not in VALID_CATEGORIES:
        return error_response(f"Category must be one of: {', '.join(VALID_CATEGORIES)}", "INVALID_CATEGORY", status_code=400)

    if not subject or len(subject) < 5:
        return error_response("Subject must be at least 5 characters long.", "INVALID_SUBJECT", status_code=400)

    if not description or len(description) < 15:
        return error_response("Please describe the incident in at least 15 characters.", "INVALID_DESCRIPTION", status_code=400)

    travel_date_val = None
    if travel_date_str:
        try:
            travel_date_val = datetime.strptime(travel_date_str, "%Y-%m-%d").date()
        except ValueError:
            return error_response("Invalid travel date format. Expected YYYY-MM-DD.", "INVALID_DATE", status_code=400)

    # Create Complaint record
    complaint = Complaint(
        passenger_id=g.current_user.id,
        category=category,
        subject=subject,
        description=description,
        service_number=service_number or None,
        travel_date=travel_date_val,
        current_status="Submitted"
    )
    db.session.add(complaint)
    db.session.flush()

    # Initial status history record
    initial_history = ComplaintStatusHistory(
        complaint_id=complaint.id,
        previous_status="None",
        new_status="Submitted",
        passenger_message="Your complaint has been registered with APSRTC. An officer will review it shortly."
    )
    db.session.add(initial_history)

    # Process file upload if provided
    file = request.files.get("attachment")
    if file and file.filename != "":
        try:
            file_meta = save_uploaded_file(file)
            attachment = ComplaintAttachment(
                complaint_id=complaint.id,
                file_name=file_meta["file_name"],
                file_path=file_meta["file_path"],
                mime_type=file_meta["mime_type"],
                file_size_bytes=file_meta["file_size_bytes"]
            )
            db.session.add(attachment)
        except ValueError as e:
            db.session.rollback()
            return error_response(str(e), "FILE_UPLOAD_ERROR", status_code=400)

    db.session.commit()
    return success_response(
        complaint.to_dict(),
        message="Your complaint has been submitted successfully. Please save your reference ID for tracking.",
        status_code=201
    )

@complaint_bp.route("/my", methods=["GET"])
@jwt_required
def get_my_complaints():
    complaints = Complaint.query.filter_by(passenger_id=g.current_user.id).order_by(Complaint.created_at.desc()).all()
    return success_response([c.to_dict() for c in complaints])

@complaint_bp.route("/track/<reference_id>", methods=["GET"])
def track_complaint(reference_id):
    clean_ref = reference_id.strip()
    complaint = Complaint.query.filter_by(reference_id=clean_ref).first()
    if not complaint:
        return error_response("Complaint with this Reference ID was not found.", "NOT_FOUND", status_code=404)

    return success_response(complaint.to_dict(include_internal=False))

@complaint_bp.route("/attachments/<attachment_id>", methods=["GET"])
def get_attachment(attachment_id):
    attachment = ComplaintAttachment.query.get(attachment_id)
    if not attachment or not os.path.exists(attachment.file_path):
        return error_response("Attachment file not found.", "NOT_FOUND", status_code=404)

    return send_file(attachment.file_path, mimetype=attachment.mime_type)
