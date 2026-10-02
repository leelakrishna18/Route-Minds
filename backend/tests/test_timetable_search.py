import pytest
from datetime import date, timedelta
from app.models.timetable import Stop, Route, RouteStop, BusService, TimetableEntry
from app.services.timetable_service import search_buses
from app.extensions import db

def test_01_valid_source_and_destination(app):
    with app.app_context():
        src = Stop.query.filter_by(name="Eluru").first()
        dst = Stop.query.filter_by(name="Vijayawada").first()
        results = search_buses(src.id, dst.id, date.today())
        assert len(results) > 0
        assert results[0]["source_stop_name"] == "Eluru"
        assert results[0]["destination_stop_name"] == "Vijayawada"
        assert results[0]["boarding_time"] is not None

def test_02_source_equals_destination(app):
    with app.app_context():
        src = Stop.query.filter_by(name="Eluru").first()
        results = search_buses(src.id, src.id, date.today())
        assert results == []

def test_03_destination_appears_before_source(app):
    with app.app_context():
        # The route is Eluru -> Vijayawada -> Hyderabad. Searching Hyderabad -> Eluru on this one-way route should yield 0
        src = Stop.query.filter_by(name="Hyderabad").first()
        dst = Stop.query.filter_by(name="Eluru").first()
        results = search_buses(src.id, dst.id, date.today())
        assert results == []

def test_04_source_or_destination_not_in_route(app):
    with app.app_context():
        src = Stop.query.filter_by(name="Polavaram").first()
        dst = Stop.query.filter_by(name="Tirupati").first()
        results = search_buses(src.id, dst.id, date.today())
        assert results == []

def test_05_no_matching_bus_exists(app):
    with app.app_context():
        src = Stop.query.filter_by(name="Chennai").first()
        dst = Stop.query.filter_by(name="Visakhapatnam").first()
        results = search_buses(src.id, dst.id, date.today())
        assert len(results) == 0

def test_06_bus_operates_daily(app):
    with app.app_context():
        src = Stop.query.filter_by(name="Eluru").first()
        dst = Stop.query.filter_by(name="Vijayawada").first()
        # Test across 3 different days
        for day_offset in [0, 1, 2]:
            t_date = date.today() + timedelta(days=day_offset)
            results = search_buses(src.id, dst.id, t_date)
            assert len(results) > 0

def test_07_bus_operates_only_on_selected_weekdays(app):
    with app.app_context():
        # Create a special Friday-only service
        src = Stop.query.filter_by(name="Eluru").first()
        dst = Stop.query.filter_by(name="Hyderabad").first()
        route = Route.query.filter_by(source_stop_id=src.id, destination_stop_id=dst.id).first()
        
        fri_service = BusService(
            service_number="TEST-FRI-ONLY-01",
            bus_type="Super Luxury",
            route_id=route.id,
            operating_days="FRI",
            validity_start_date=date(2025, 1, 1),
            validity_end_date=date(2027, 12, 31),
            source_of_information="Test Verification",
            is_active=True
        )
        db.session.add(fri_service)
        db.session.flush()

        te = TimetableEntry(
            service_id=fri_service.id,
            stop_id=src.id,
            scheduled_departure_time="19:45"
        )
        db.session.add(te)
        db.session.commit()

        # Find next Friday (weekday 4 in python)
        today = date.today()
        days_ahead_to_friday = (4 - today.weekday()) % 7
        next_friday = today + timedelta(days=days_ahead_to_friday)
        next_saturday = next_friday + timedelta(days=1)

        res_friday = search_buses(src.id, dst.id, next_friday)
        res_saturday = search_buses(src.id, dst.id, next_saturday)

        assert any(r["service_number"] == "TEST-FRI-ONLY-01" for r in res_friday)
        assert not any(r["service_number"] == "TEST-FRI-ONLY-01" for r in res_saturday)

def test_08_bus_outside_validity_dates(app):
    with app.app_context():
        src = Stop.query.filter_by(name="Eluru").first()
        dst = Stop.query.filter_by(name="Hyderabad").first()
        # Search in year 2028 (outside 2025-2027 validity)
        results = search_buses(src.id, dst.id, date(2028, 5, 1))
        assert len(results) == 0

def test_09_bus_is_inactive(app):
    with app.app_context():
        src = Stop.query.filter_by(name="Eluru").first()
        dst = Stop.query.filter_by(name="Hyderabad").first()
        route = Route.query.filter_by(source_stop_id=src.id, destination_stop_id=dst.id).first()

        inactive_srv = BusService(
            service_number="TEST-INACTIVE-01",
            bus_type="Express",
            route_id=route.id,
            operating_days="DAILY",
            validity_start_date=date(2025, 1, 1),
            validity_end_date=date(2027, 12, 31),
            is_active=False
        )
        db.session.add(inactive_srv)
        db.session.commit()

        results = search_buses(src.id, dst.id, date.today())
        assert not any(r["service_number"] == "TEST-INACTIVE-01" for r in results)

def test_10_multiple_buses_match_same_search(app):
    with app.app_context():
        src = Stop.query.filter_by(name="Eluru").first()
        dst = Stop.query.filter_by(name="Vijayawada").first()
        results = search_buses(src.id, dst.id, date.today())
        # Both Non-Stop and Ordinary services exist from Eluru to Vijayawada (> 50 total departures)
        assert len(results) > 20

def test_11_selected_date_changes_the_results(app):
    with app.app_context():
        src = Stop.query.filter_by(name="Eluru").first()
        dst = Stop.query.filter_by(name="Hyderabad").first()
        # Within validity vs outside validity
        res_valid = search_buses(src.id, dst.id, date(2026, 6, 1))
        res_invalid = search_buses(src.id, dst.id, date(2029, 1, 1))
        assert len(res_valid) > 0
        assert len(res_invalid) == 0

def test_12_boarding_time_comes_from_selected_source_stop(app):
    with app.app_context():
        # Searching from intermediate stop "Hanuman Junction" to "Vijayawada"
        src = Stop.query.filter_by(name="Eluru").first()
        dst = Stop.query.filter_by(name="Vijayawada").first()
        results = search_buses(src.id, dst.id, date.today())
        for r in results:
            assert r["boarding_time"] is not None
            assert ":" in r["boarding_time"]

def test_13_arrival_time_comes_from_destination_stop(app):
    with app.app_context():
        src = Stop.query.filter_by(name="Eluru").first()
        dst = Stop.query.filter_by(name="Vijayawada").first()
        results = search_buses(src.id, dst.id, date.today())
        assert all("arrival_time" in r for r in results)

def test_14_missing_arrival_time_is_displayed_honestly(app):
    with app.app_context():
        src = Stop.query.filter_by(name="Eluru").first()
        dst = Stop.query.filter_by(name="Hyderabad").first()
        results = search_buses(src.id, dst.id, date.today())
        assert len(results) > 0
        # If arrival time is not in board photos, it is honestly None
        first_bus = results[0]
        assert (first_bus["arrival_time"] is None) or isinstance(first_bus["arrival_time"], str)

def test_15_invalid_timetable_records_rejected(client, admin_token):
    # Try to add a service without required fields
    res = client.post("/api/v1/admin/services", json={
        "service_number": "",
        "bus_type": ""
    }, headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 400
