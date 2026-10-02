import csv
import io
from datetime import datetime, date
from flask import Blueprint, request, g, Response
from app.extensions import db
from app.models.user import User
from app.models.timetable import Stop, Route, RouteStop, BusService, TimetableEntry
from app.models.complaint import Complaint, ComplaintStatusHistory
from app.models.sms import SmsRouteCode, SmsLog, SmsRegistration
from app.models.audit import AdminAuditLog
from app.utils.responses import success_response, error_response
from app.utils.decorators import roles_required

admin_bp = Blueprint("admin", __name__, url_prefix="/api/v1/admin")

def log_admin_action(action: str, entity_type: str, entity_id: str = None, details: str = None):
    log = AdminAuditLog(
        admin_id=g.current_user.id,
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id) if entity_id else None,
        details=details,
        ip_address=request.remote_addr
    )
    db.session.add(log)

# 1. Admin Dashboard Stats
@admin_bp.route("/stats", methods=["GET"])
@roles_required(["admin"])
def get_admin_stats():
    total_stops = Stop.query.count()
    total_routes = Route.query.count()
    total_services = BusService.query.count()
    verified_services = BusService.query.filter_by(verification_status="VERIFIED").count()
    active_services = BusService.query.filter_by(is_active=True).count()

    total_complaints = Complaint.query.count()
    pending_complaints = Complaint.query.filter(Complaint.current_status.in_(["Submitted", "Under Review", "In Progress"])).count()
    resolved_complaints = Complaint.query.filter_by(current_status="Resolved").count()

    total_sms_queries = SmsLog.query.count()
    sms_registered_users = SmsRegistration.query.count()

    recent_complaints = Complaint.query.order_by(Complaint.created_at.desc()).limit(5).all()
    recent_audit_logs = AdminAuditLog.query.order_by(AdminAuditLog.created_at.desc()).limit(10).all()

    return success_response({
        "metrics": {
            "total_stops": total_stops,
            "total_routes": total_routes,
            "total_services": total_services,
            "verified_services": verified_services,
            "active_services": active_services,
            "total_complaints": total_complaints,
            "pending_complaints": pending_complaints,
            "resolved_complaints": resolved_complaints,
            "total_sms_queries": total_sms_queries,
            "sms_registered_users": sms_registered_users
        },
        "recent_complaints": [c.to_dict() for c in recent_complaints],
        "recent_audit_logs": [l.to_dict() for l in recent_audit_logs]
    })

# 2. Timetable Management
@admin_bp.route("/services", methods=["GET"])
@roles_required(["admin"])
def list_admin_services():
    status = request.args.get("status")
    route_id = request.args.get("route_id")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))

    query = BusService.query
    if status:
        query = query.filter_by(verification_status=status)
    if route_id:
        query = query.filter_by(route_id=route_id)

    services_paged = query.order_by(BusService.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    
    return success_response({
        "items": [s.to_dict() for s in services_paged.items],
        "page": services_paged.page,
        "total_pages": services_paged.pages,
        "total_items": services_paged.total
    })

@admin_bp.route("/services", methods=["POST"])
@roles_required(["admin"])
def create_service():
    data = request.get_json() or {}
    service_number = data.get("service_number", "").strip()
    bus_type = data.get("bus_type", "").strip()
    route_id = data.get("route_id")
    operating_days = data.get("operating_days", "DAILY").strip()
    source_of_information = data.get("source_of_information", "Station Master Log").strip()
    verification_status = data.get("verification_status", "VERIFIED")
    stops_schedule = data.get("schedule", []) # list of {stop_id, scheduled_departure_time, scheduled_arrival_time, platform_number}

    if not service_number or not bus_type or not route_id:
        return error_response("Service number, bus type, and route are required.", "VALIDATION_ERROR", status_code=400)

    route = Route.query.get(route_id)
    if not route:
        return error_response("Selected route does not exist.", "ROUTE_NOT_FOUND", status_code=404)

    # Check duplicate service number
    if BusService.query.filter_by(service_number=service_number).first():
        return error_response("A service with this number already exists.", "DUPLICATE_SERVICE", status_code=409)

    service = BusService(
        service_number=service_number,
        bus_number=data.get("bus_number"),
        bus_type=bus_type,
        route_id=route_id,
        operating_days=operating_days,
        source_of_information=source_of_information,
        verification_status=verification_status,
        date_last_verified=date.today(),
        is_active=True
    )
    db.session.add(service)
    db.session.flush()

    for item in stops_schedule:
        st_id = item.get("stop_id")
        if not st_id:
            continue
        entry = TimetableEntry(
            service_id=service.id,
            stop_id=st_id,
            scheduled_departure_time=item.get("scheduled_departure_time"),
            scheduled_arrival_time=item.get("scheduled_arrival_time"),
            platform_number=item.get("platform_number"),
            remarks=item.get("remarks")
        )
        db.session.add(entry)

    log_admin_action("CREATE_SERVICE", "BusService", service.id, f"Created service {service.service_number}")
    db.session.commit()

    return success_response(service.to_dict(), message="Bus service created successfully.", status_code=201)

@admin_bp.route("/services/<service_id>", methods=["PUT"])
@roles_required(["admin"])
def update_service(service_id):
    service = BusService.query.get(service_id)
    if not service:
        return error_response("Service not found.", "NOT_FOUND", status_code=404)

    data = request.get_json() or {}
    if "bus_type" in data:
        service.bus_type = data["bus_type"]
    if "bus_number" in data:
        service.bus_number = data["bus_number"]
    if "operating_days" in data:
        service.operating_days = data["operating_days"]
    if "source_of_information" in data:
        service.source_of_information = data["source_of_information"]
    if "verification_status" in data:
        service.verification_status = data["verification_status"]
    if "is_active" in data:
        service.is_active = data["is_active"]
    service.date_last_verified = date.today()

    # If updating schedule
    if "schedule" in data:
        TimetableEntry.query.filter_by(service_id=service.id).delete()
        for item in data["schedule"]:
            st_id = item.get("stop_id")
            if not st_id:
                continue
            entry = TimetableEntry(
                service_id=service.id,
                stop_id=st_id,
                scheduled_departure_time=item.get("scheduled_departure_time"),
                scheduled_arrival_time=item.get("scheduled_arrival_time"),
                platform_number=item.get("platform_number"),
                remarks=item.get("remarks")
            )
            db.session.add(entry)

    log_admin_action("UPDATE_SERVICE", "BusService", service.id, f"Updated service {service.service_number}")
    db.session.commit()
    return success_response(service.to_dict(), message="Service updated successfully.")

@admin_bp.route("/services/<service_id>", methods=["DELETE"])
@roles_required(["admin"])
def deactivate_service(service_id):
    service = BusService.query.get(service_id)
    if not service:
        return error_response("Service not found.", "NOT_FOUND", status_code=404)

    service.is_active = False
    log_admin_action("DEACTIVATE_SERVICE", "BusService", service.id, f"Deactivated service {service.service_number}")
    db.session.commit()
    return success_response(None, message="Service deactivated safely.")

# 3. CSV Export and Import
@admin_bp.route("/services/export-csv", methods=["GET"])
@roles_required(["admin"])
def export_services_csv():
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Service Number", "Bus Type", "Route", "Operating Days",
        "Source of Info", "Verification Status", "Is Active", "Timetable Departures"
    ])

    services = BusService.query.all()
    for s in services:
        deps = [f"{e.stop.name}: {e.scheduled_departure_time}" for e in s.timetable_entries if e.scheduled_departure_time]
        writer.writerow([
            s.service_number,
            s.bus_type,
            s.route.route_name if s.route else "",
            s.operating_days,
            s.source_of_information,
            s.verification_status,
            "Yes" if s.is_active else "No",
            "; ".join(deps)
        ])

    log_admin_action("EXPORT_TIMETABLE_CSV", "BusService", details="Exported all timetable services to CSV")
    db.session.commit()

    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition": f"attachment;filename=apsrtc_timetables_{datetime.now().strftime('%Y%m%d')}.csv"}
    )

# 4. Complaints Management
@admin_bp.route("/complaints", methods=["GET"])
@roles_required(["admin"])
def list_admin_complaints():
    status = request.args.get("status")
    category = request.args.get("category")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))

    query = Complaint.query
    if status:
        query = query.filter_by(current_status=status)
    if category:
        query = query.filter_by(category=category)

    complaints_paged = query.order_by(Complaint.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    return success_response({
        "items": [c.to_dict(include_internal=True) for c in complaints_paged.items],
        "page": complaints_paged.page,
        "total_pages": complaints_paged.pages,
        "total_items": complaints_paged.total
    })

@admin_bp.route("/complaints/<complaint_id>/status", methods=["PUT"])
@roles_required(["admin"])
def update_complaint_status(complaint_id):
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return error_response("Complaint not found.", "NOT_FOUND", status_code=404)

    data = request.get_json() or {}
    new_status = data.get("status")
    note = data.get("internal_note", "")
    passenger_message = data.get("passenger_message", "")

    valid_statuses = ["Submitted", "Under Review", "In Progress", "Resolved", "Rejected"]
    if new_status not in valid_statuses:
        return error_response(f"Status must be one of: {', '.join(valid_statuses)}", "INVALID_STATUS", status_code=400)

    previous_status = complaint.current_status
    complaint.current_status = new_status
    if passenger_message:
        complaint.admin_response = passenger_message
    if note:
        complaint.internal_note = note

    history = ComplaintStatusHistory(
        complaint_id=complaint.id,
        previous_status=previous_status,
        new_status=new_status,
        changed_by_user_id=g.current_user.id,
        note=note,
        passenger_message=passenger_message
    )
    db.session.add(history)

    log_admin_action("UPDATE_COMPLAINT_STATUS", "Complaint", complaint.id, f"Changed status from {previous_status} to {new_status}")
    db.session.commit()

    return success_response(complaint.to_dict(include_internal=True), message="Complaint status updated.")

# 5. SMS Route Codes Management
@admin_bp.route("/sms-codes", methods=["GET"])
@roles_required(["admin"])
def list_sms_codes():
    codes = SmsRouteCode.query.order_by(SmsRouteCode.route_code.asc()).all()
    return success_response([c.to_dict() for c in codes])

@admin_bp.route("/sms-codes", methods=["POST"])
@roles_required(["admin"])
def create_sms_code():
    data = request.get_json() or {}
    route_code = data.get("route_code", "").strip().upper()
    route_id = data.get("route_id")
    desc = data.get("description", "").strip()

    if not route_code or not route_id:
        return error_response("Route code and route selection are required.", "VALIDATION_ERROR", status_code=400)

    if SmsRouteCode.query.filter_by(route_code=route_code).first():
        return error_response("Route code already exists.", "DUPLICATE_CODE", status_code=409)

    code_record = SmsRouteCode(
        route_code=route_code,
        route_id=route_id,
        description=desc or f"Route code for {route_code}",
        is_active=True
    )
    db.session.add(code_record)
    log_admin_action("CREATE_SMS_CODE", "SmsRouteCode", route_code, f"Created SMS route code {route_code}")
    db.session.commit()

    return success_response(code_record.to_dict(), message="SMS route code registered.", status_code=201)

# 6. Admin User Management & Passenger Grievances
@admin_bp.route("/users", methods=["GET"])
@roles_required(["admin"])
def list_users():
    search = request.args.get("search", "").strip()
    role_filter = request.args.get("role", "").strip()

    query = User.query
    if role_filter:
        query = query.filter_by(role=role_filter)

    users = query.order_by(User.created_at.desc()).all()

    result = []
    for u in users:
        u_dict = u.to_dict()
        complaints_count = Complaint.query.filter_by(passenger_id=u.id).count()
        u_dict["complaints_count"] = complaints_count

        if search:
            search_lower = search.lower()
            name = (u_dict.get("full_name") or "").lower()
            email = (u.email or "").lower()
            phone = (u.mobile_number or "").lower()
            if search_lower not in name and search_lower not in email and search_lower not in phone:
                continue

        result.append(u_dict)

    return success_response(result)

@admin_bp.route("/users/<user_id>/complaints", methods=["GET"])
@roles_required(["admin"])
def get_user_complaints(user_id):
    user = User.query.get(user_id)
    if not user:
        return error_response("User not found.", "NOT_FOUND", status_code=404)

    complaints = Complaint.query.filter_by(passenger_id=user.id).order_by(Complaint.created_at.desc()).all()
    return success_response({
        "user": user.to_dict(),
        "complaints": [c.to_dict(include_internal=True) for c in complaints]
    })
