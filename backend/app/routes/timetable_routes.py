from datetime import datetime, date
from flask import Blueprint, request
from app.models.timetable import Stop, Route, BusService, RouteStop
from app.services.timetable_service import search_buses
from app.utils.responses import success_response, error_response

timetable_bp = Blueprint("timetable", __name__, url_prefix="/api/v1/schedules")

@timetable_bp.route("/stops", methods=["GET"])
def get_stops():
    """Returns active stops/stations in alphabetical order for searchable dropdowns"""
    query = request.args.get("q", "").strip()
    stops_query = Stop.query.filter_by(is_active=True)
    if query:
        stops_query = stops_query.filter(
            (Stop.name.ilike(f"%{query}%")) | 
            (Stop.name_te.ilike(f"%{query}%")) |
            (Stop.code.ilike(f"%{query}%"))
        )
    stops = stops_query.order_by(Stop.name.asc()).all()
    return success_response([s.to_dict() for s in stops])

@timetable_bp.route("/search", methods=["GET"])
def search_schedule():
    """
    Search buses by source, destination, and travel_date.
    Validates directional sequence, operating days, and validity dates.
    """
    source_id = request.args.get("source_stop_id")
    dest_id = request.args.get("destination_stop_id")
    date_str = request.args.get("travel_date")
    bus_type = request.args.get("bus_type")

    if not source_id or not dest_id:
        return error_response("Both source and destination stops must be selected.", "MISSING_STOPS", status_code=400)

    if source_id == dest_id:
        return error_response("Source and destination cannot be the same bus stop.", "IDENTICAL_STOPS", status_code=400)

    # Date validation
    if not date_str:
        travel_date_obj = date.today()
    else:
        try:
            travel_date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return error_response("Invalid date format. Expected YYYY-MM-DD.", "INVALID_DATE", status_code=400)

    results = search_buses(source_id, dest_id, travel_date_obj, bus_type_filter=bus_type)

    return success_response({
        "search_parameters": {
            "source_stop_id": source_id,
            "destination_stop_id": dest_id,
            "travel_date": travel_date_obj.isoformat(),
            "bus_type_filter": bus_type
        },
        "total_results": len(results),
        "results": results
    })

@timetable_bp.route("/services/<service_id>", methods=["GET"])
def get_service_details(service_id):
    service = BusService.query.get(service_id)
    if not service:
        return error_response("Bus service not found in available timetable records.", "NOT_FOUND", status_code=404)
    return success_response(service.to_dict())

@timetable_bp.route("/routes", methods=["GET"])
def get_routes():
    routes = Route.query.filter_by(is_active=True).all()
    return success_response([r.to_dict() for r in routes])
