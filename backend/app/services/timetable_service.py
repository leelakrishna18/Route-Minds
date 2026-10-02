from datetime import datetime, date
from sqlalchemy import and_
from app.models.timetable import Stop, Route, RouteStop, BusService, TimetableEntry
from app.extensions import db

WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]

def is_service_operating_on_date(service: BusService, target_date: date) -> bool:
    """
    Checks if a service operates on target_date:
    1. Active status check
    2. Date within [validity_start_date, validity_end_date]
    3. Operating days contains target_date's weekday or 'DAILY'
    """
    if not service.is_active:
        return False

    if target_date < service.validity_start_date or target_date > service.validity_end_date:
        return False

    op_days = service.operating_days.upper().replace(" ", "")
    if "DAILY" in op_days:
        return True

    # Check weekday (0 = Monday in python)
    weekday_code = WEEKDAYS[target_date.weekday()]
    allowed_days = [d.strip() for d in op_days.split(",") if d.strip()]
    return weekday_code in allowed_days

def find_stop(identifier: str):
    if not identifier:
        return None
    st = db.session.get(Stop, identifier) if hasattr(db.session, "get") else Stop.query.get(identifier)
    if st:
        return st
    clean = identifier.replace("-def", "").strip()
    return Stop.query.filter(
        (Stop.code.ilike(clean)) |
        (Stop.name.ilike(clean)) |
        (Stop.name.ilike(f"%{clean}%"))
    ).first()

def search_buses(source_stop_id: str, destination_stop_id: str, travel_date_obj: date, bus_type_filter: str = None) -> list[dict]:
    """
    Implements APSRTC directional search:
    - Source must exist in route stops at seq S
    - Destination must exist in route stops at seq D
    - S < D (Source precedes Destination in the route)
    - Service must be active and valid on travel_date_obj
    - Departure time comes from source stop entry
    - Arrival time comes from destination stop entry (if recorded)
    """
    if source_stop_id == destination_stop_id:
        return []

    # Get source & destination stop records flexibly by ID, code, or name
    source_stop = find_stop(source_stop_id)
    dest_stop = find_stop(destination_stop_id)
    if not source_stop or not dest_stop or source_stop.id == dest_stop.id:
        return []

    real_source_id = source_stop.id
    real_dest_id = dest_stop.id

    # Find routes containing both stops where sequence_order(source) < sequence_order(dest)
    # Using alias or join
    rs1 = db.aliased(RouteStop)
    rs2 = db.aliased(RouteStop)

    matching_routes_query = db.session.query(
        Route,
        rs1.sequence_order.label("source_seq"),
        rs2.sequence_order.label("dest_seq")
    ).join(
        rs1, rs1.route_id == Route.id
    ).join(
        rs2, rs2.route_id == Route.id
    ).filter(
        Route.is_active == True,
        rs1.stop_id == real_source_id,
        rs2.stop_id == real_dest_id,
        rs1.sequence_order < rs2.sequence_order
    )

    matching_routes = matching_routes_query.all()
    if not matching_routes:
        return []

    results = []

    for route, src_seq, dst_seq in matching_routes:
        # Get active services for this route
        services_query = BusService.query.filter(
            BusService.route_id == route.id,
            BusService.is_active == True
        )
        if bus_type_filter:
            services_query = services_query.filter(BusService.bus_type.ilike(f"%{bus_type_filter}%"))

        services = services_query.all()

        # Get all stops in this route ordered by sequence
        all_route_stops = RouteStop.query.filter_by(route_id=route.id).order_by(RouteStop.sequence_order.asc()).all()
        # Slice between src_seq and dst_seq for intermediate stops
        route_stop_chain = [rs.stop.name for rs in all_route_stops if src_seq <= rs.sequence_order <= dst_seq]

        for srv in services:
            # Check date-based rules
            if not is_service_operating_on_date(srv, travel_date_obj):
                continue

            # Fetch timetable entries for this service
            entries = {e.stop_id: e for e in srv.timetable_entries}

            # Must have source entry with a scheduled departure time (or starting time)
            source_entry = entries.get(real_source_id)
            dest_entry = entries.get(real_dest_id)

            boarding_time = None
            platform_num = None
            remarks = None

            if source_entry:
                boarding_time = source_entry.scheduled_departure_time or source_entry.scheduled_arrival_time
                platform_num = source_entry.platform_number
                remarks = source_entry.remarks
            
            # If the service doesn't have an explicit source entry, see if it starts at source
            if not boarding_time:
                continue

            arrival_time = None
            if dest_entry:
                arrival_time = dest_entry.scheduled_arrival_time or dest_entry.scheduled_departure_time

            results.append({
                "service_id": srv.id,
                "service_number": srv.service_number,
                "bus_number": srv.bus_number,
                "bus_type": srv.bus_type,
                "route_id": route.id,
                "route_name": route.route_name,
                "source_stop_id": source_stop.id,
                "source_stop_name": source_stop.name,
                "source_stop_name_te": source_stop.name_te,
                "destination_stop_id": dest_stop.id,
                "destination_stop_name": dest_stop.name,
                "destination_stop_name_te": dest_stop.name_te,
                "boarding_time": boarding_time,
                "arrival_time": arrival_time, # Honest: None if not recorded in station board
                "has_verified_arrival_time": bool(arrival_time),
                "platform_number": platform_num or "Platform Board",
                "remarks": remarks,
                "intermediate_stops": route_stop_chain,
                "travel_date": travel_date_obj.isoformat(),
                "operating_days": srv.operating_days,
                "verification_status": srv.verification_status,
                "source_of_information": srv.source_of_information,
                "date_last_verified": srv.date_last_verified.isoformat()
            })

    # Sort strictly by boarding time (HH:MM)
    results.sort(key=lambda item: item["boarding_time"] or "99:99")
    return results
