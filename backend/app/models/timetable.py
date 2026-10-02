import uuid
from datetime import datetime, date
from app.extensions import db

class Stop(db.Model):
    __tablename__ = "stops"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), unique=True, nullable=False, index=True)
    name_te = db.Column(db.String(100), nullable=True)  # Telugu name as transcribed from board
    code = db.Column(db.String(20), unique=True, nullable=True, index=True)
    district = db.Column(db.String(50), nullable=True)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "name_te": self.name_te,
            "code": self.code,
            "district": self.district,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "is_active": self.is_active
        }

class Route(db.Model):
    __tablename__ = "routes"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    route_name = db.Column(db.String(150), nullable=False)
    source_stop_id = db.Column(db.String(36), db.ForeignKey("stops.id"), nullable=False)
    destination_stop_id = db.Column(db.String(36), db.ForeignKey("stops.id"), nullable=False)
    via_summary = db.Column(db.String(255), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    source_stop = db.relationship("Stop", foreign_keys=[source_stop_id])
    destination_stop = db.relationship("Stop", foreign_keys=[destination_stop_id])
    route_stops = db.relationship("RouteStop", backref="route", order_by="RouteStop.sequence_order", cascade="all, delete-orphan")
    bus_services = db.relationship("BusService", backref="route", lazy="dynamic", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "route_name": self.route_name,
            "source_stop": self.source_stop.to_dict() if self.source_stop else None,
            "destination_stop": self.destination_stop.to_dict() if self.destination_stop else None,
            "via_summary": self.via_summary,
            "stops": [rs.to_dict() for rs in self.route_stops],
            "is_active": self.is_active
        }

class RouteStop(db.Model):
    __tablename__ = "route_stops"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    route_id = db.Column(db.String(36), db.ForeignKey("routes.id", ondelete="CASCADE"), nullable=False, index=True)
    stop_id = db.Column(db.String(36), db.ForeignKey("stops.id"), nullable=False, index=True)
    sequence_order = db.Column(db.Integer, nullable=False)  # 1 for origin, 2 for next, etc.
    distance_km = db.Column(db.Float, nullable=True)

    # Relationship
    stop = db.relationship("Stop")

    __table_args__ = (
        db.UniqueConstraint("route_id", "sequence_order", name="uq_route_sequence"),
        db.UniqueConstraint("route_id", "stop_id", name="uq_route_stop"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "stop_id": self.stop_id,
            "sequence_order": self.sequence_order,
            "stop_name": self.stop.name if self.stop else None,
            "stop_name_te": self.stop.name_te if self.stop else None,
            "distance_km": self.distance_km
        }

class BusService(db.Model):
    __tablename__ = "bus_services"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    service_number = db.Column(db.String(50), nullable=False, index=True)  # e.g. "ELR-HYD-AMARAVATHI-2200"
    bus_number = db.Column(db.String(50), nullable=True)                  # Vehicle registration number if assigned
    bus_type = db.Column(db.String(50), nullable=False, index=True)       # "Amaravathi", "Indra", "Express", "Palle Velugu", etc.
    route_id = db.Column(db.String(36), db.ForeignKey("routes.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Operating conditions
    operating_days = db.Column(db.String(100), default="DAILY", nullable=False) # "DAILY" or "MON,TUE,WED,THU,FRI,SAT,SUN"
    validity_start_date = db.Column(db.Date, default=date(2025, 1, 1), nullable=False)
    validity_end_date = db.Column(db.Date, default=date(2027, 12, 31), nullable=False)
    
    # Verification & Source Integrity
    source_of_information = db.Column(db.String(255), nullable=False, default="APSRTC Eluru Depot Timetable Board")
    date_last_verified = db.Column(db.Date, default=date.today, nullable=False)
    verification_status = db.Column(db.String(30), default="VERIFIED", nullable=False) # "VERIFIED", "PENDING_REVIEW", "INCOMPLETE"
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Additional Fleet / Commercial Details
    fare = db.Column(db.String(50), nullable=True, default="Standard Fare")
    seating_capacity = db.Column(db.Integer, nullable=True, default=49)
    depot_name = db.Column(db.String(100), nullable=True, default="Eluru Depot")

    # Schedule entries per stop
    timetable_entries = db.relationship("TimetableEntry", backref="service", cascade="all, delete-orphan", lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "service_number": self.service_number,
            "bus_number": self.bus_number,
            "bus_type": self.bus_type,
            "fare": self.fare,
            "seating_capacity": self.seating_capacity,
            "depot_name": self.depot_name,
            "route_id": self.route_id,
            "route_name": self.route.route_name if self.route else None,
            "origin": self.route.source_stop.name if self.route and self.route.source_stop else None,
            "destination": self.route.destination_stop.name if self.route and self.route.destination_stop else None,
            "operating_days": self.operating_days,
            "validity_start_date": self.validity_start_date.isoformat(),
            "validity_end_date": self.validity_end_date.isoformat(),
            "source_of_information": self.source_of_information,
            "date_last_verified": self.date_last_verified.isoformat(),
            "verification_status": self.verification_status,
            "is_active": self.is_active,
            "schedule": [entry.to_dict() for entry in sorted(self.timetable_entries, key=lambda e: e.scheduled_departure_time or e.scheduled_arrival_time or "00:00")]
        }

class TimetableEntry(db.Model):
    __tablename__ = "timetable_entries"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    service_id = db.Column(db.String(36), db.ForeignKey("bus_services.id", ondelete="CASCADE"), nullable=False, index=True)
    stop_id = db.Column(db.String(36), db.ForeignKey("stops.id"), nullable=False, index=True)
    scheduled_arrival_time = db.Column(db.String(10), nullable=True)    # "HH:MM" 24h format, None if not listed
    scheduled_departure_time = db.Column(db.String(10), nullable=True)  # "HH:MM" 24h format
    platform_number = db.Column(db.String(20), nullable=True)           # e.g. "Platform 1", "Platform 4"
    remarks = db.Column(db.String(150), nullable=True)                  # e.g. "(RGIA)", "(SPL)", "(BHEL)"

    stop = db.relationship("Stop")

    def to_dict(self):
        return {
            "id": self.id,
            "stop_id": self.stop_id,
            "stop_name": self.stop.name if self.stop else None,
            "stop_name_te": self.stop.name_te if self.stop else None,
            "scheduled_arrival_time": self.scheduled_arrival_time,
            "scheduled_departure_time": self.scheduled_departure_time,
            "platform_number": self.platform_number,
            "remarks": self.remarks
        }
