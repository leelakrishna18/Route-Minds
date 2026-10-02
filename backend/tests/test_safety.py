import pytest

def test_add_and_list_trusted_contacts(client, passenger_token):
    # Add contact
    res = client.post("/api/v1/safety/contacts", json={
        "name": "Kavitha (Sister)",
        "mobile_number": "9848022334",
        "relationship": "Sister",
        "is_primary": False
    }, headers={"Authorization": f"Bearer {passenger_token}"})
    assert res.status_code == 201

    # List contacts
    list_res = client.get("/api/v1/safety/contacts", headers={"Authorization": f"Bearer {passenger_token}"})
    assert list_res.status_code == 200
    contacts = list_res.get_json()["data"]
    assert any(c["name"] == "Kavitha (Sister)" for c in contacts)

def test_start_and_stop_location_sharing(client, passenger_token):
    # Start sharing
    start_res = client.post("/api/v1/safety/location/start", json={
        "latitude": 16.7107,
        "longitude": 81.0952,
        "accuracy_meters": 12.5
    }, headers={"Authorization": f"Bearer {passenger_token}"})
    assert start_res.status_code == 200
    token = start_res.get_json()["data"]["session"]["sharing_token"]

    # Public view link works
    view_res = client.get(f"/api/v1/safety/location/view/{token}")
    assert view_res.status_code == 200
    assert view_res.get_json()["data"]["latitude"] == 16.7107

    # Stop sharing
    stop_res = client.post("/api/v1/safety/location/stop", headers={"Authorization": f"Bearer {passenger_token}"})
    assert stop_res.status_code == 200

    # Public view link is now expired/inactive
    view_after_stop = client.get(f"/api/v1/safety/location/view/{token}")
    assert view_after_stop.status_code == 404
