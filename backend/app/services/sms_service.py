import os
from datetime import datetime, date
from app.extensions import db
from app.models.sms import SmsRouteCode, SmsRegistration, SmsLog
from app.models.timetable import BusService, RouteStop, Stop
from app.services.timetable_service import is_service_operating_on_date

def process_incoming_sms(sender_mobile: str, message_text: str) -> dict:
    """
    Core SMS Webhook processor:
    - Normalizes sender_mobile and route code
    - Checks registered user / auto-registers
    - Finds matching route code
    - Fetches today's upcoming scheduled departures
    - Formats concise APSRTC SMS response
    - Logs transaction
    """
    cleaned_text = (message_text or "").strip().upper()
    
    # Check registration or auto-register in development
    registration = SmsRegistration.query.filter_by(mobile_number=sender_mobile).first()
    if not registration:
        registration = SmsRegistration(
            mobile_number=sender_mobile,
            is_verified=True,
            registered_at=datetime.utcnow(),
            query_count=1,
            last_query_at=datetime.utcnow()
        )
        db.session.add(registration)
    else:
        registration.query_count += 1
        registration.last_query_at = datetime.utcnow()

    # Route Code Lookup
    route_code_record = SmsRouteCode.query.filter_by(route_code=cleaned_text, is_active=True).first()

    now_time = datetime.now().strftime("%H:%M")
    today = date.today()

    if not route_code_record:
        # Provide helpful error with available route codes
        available_codes = [rc.route_code for rc in SmsRouteCode.query.filter_by(is_active=True).limit(6).all()]
        codes_str = ", ".join(available_codes)
        response_msg = (
            f"APSRTC: Unknown route code '{cleaned_text}'. "
            f"Available codes: {codes_str}. "
            "Reply with code (e.g. VJY) to receive bus timings."
        )
        status = "INVALID_CODE"
    else:
        route = route_code_record.route
        services = BusService.query.filter_by(route_id=route.id, is_active=True).all()

        # Find departures for today
        departures = []
        for srv in services:
            if is_service_operating_on_date(srv, today):
                for entry in srv.timetable_entries:
                    # Check origin/source stop entry
                    if entry.stop_id == route.source_stop_id and entry.scheduled_departure_time:
                        departures.append((entry.scheduled_departure_time, srv.bus_type))

        # Sort departures by time
        departures.sort(key=lambda x: x[0])

        if not departures:
            response_msg = (
                f"APSRTC: No scheduled services currently on record for route {route.route_name} on {today.strftime('%d-%b')}. "
                "Contact station enquiry (08812-230303)."
            )
            status = "NO_SCHEDULES"
        else:
            # Upcoming from now if available, otherwise first 5 of day
            upcoming = [f"{t} ({b[:4]})" for t, b in departures if t >= now_time][:4]
            if not upcoming:
                upcoming = [f"{t} ({b[:4]})" for t, b in departures[:4]]
            
            times_str = ", ".join(upcoming)
            response_msg = (
                f"APSRTC Schedule for {route.route_name}: {times_str}. "
                "Note: These are scheduled timetable timings, not live GPS arrival. Safe travels!"
            )
            status = "SENT"

    # Save log
    sms_log = SmsLog(
        sender_mobile=sender_mobile,
        incoming_text=message_text,
        response_text=response_msg,
        route_code_matched=route_code_record.route_code if route_code_record else None,
        status=status
    )
    db.session.add(sms_log)
    db.session.commit()

    return {
        "status": status,
        "recipient": sender_mobile,
        "message": response_msg,
        "route_code": route_code_record.route_code if route_code_record else None
    }
