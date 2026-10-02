import pytest

def test_valid_complaint_submission(client, passenger_token):
    res = client.post("/api/v1/complaints", json={
        "category": "Cleanliness",
        "subject": "Bus interior unhygienic on route to Vizag",
        "description": "The seats on bus ELR-VSKP-0820 had trash underneath and dusty cushions.",
        "service_number": "ELR-VSKP-0820"
    }, headers={"Authorization": f"Bearer {passenger_token}"})
    assert res.status_code == 201
    data = res.get_json()["data"]
    assert data["reference_id"].startswith("APSRTC-CMP-")
    assert data["current_status"] == "Submitted"

def test_missing_required_fields(client, passenger_token):
    res = client.post("/api/v1/complaints", json={
        "category": "",
        "subject": "Short"
    }, headers={"Authorization": f"Bearer {passenger_token}"})
    assert res.status_code == 400

def test_complaint_tracking(client, passenger_token):
    # First submit
    sub_res = client.post("/api/v1/complaints", json={
        "category": "Bus delay",
        "subject": "Delay at Hanuman Junction stop",
        "description": "Bus arrived 40 minutes after scheduled timetable departure time.",
        "service_number": "ELR-BZA-0500"
    }, headers={"Authorization": f"Bearer {passenger_token}"})
    ref_id = sub_res.get_json()["data"]["reference_id"]

    # Public tracking by reference ID
    track_res = client.get(f"/api/v1/complaints/track/{ref_id}")
    assert track_res.status_code == 200
    assert track_res.get_json()["data"]["reference_id"] == ref_id
    assert track_res.get_json()["data"]["current_status"] == "Submitted"

def test_admin_status_update(client, admin_token, passenger_token):
    # Submit complaint
    sub_res = client.post("/api/v1/complaints", json={
        "category": "Staff behaviour",
        "subject": "Rude conductor behavior at bus stand counter",
        "description": "Conductor refused to provide change for ticket fare at Platform 1.",
        "service_number": "ELR-CPD-0600"
    }, headers={"Authorization": f"Bearer {passenger_token}"})
    comp_id = sub_res.get_json()["data"]["id"]

    # Admin updates status
    update_res = client.put(f"/api/v1/admin/complaints/{comp_id}/status", json={
        "status": "In Progress",
        "internal_note": "Conductor summoned for depot inquiry",
        "passenger_message": "An inquiry has been initiated by the Depot Manager."
    }, headers={"Authorization": f"Bearer {admin_token}"})
    assert update_res.status_code == 200
    data = update_res.get_json()["data"]
    assert data["current_status"] == "In Progress"
    assert data["admin_response"] == "An inquiry has been initiated by the Depot Manager."
