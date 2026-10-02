import pytest

def test_successful_registration(client):
    res = client.post("/api/v1/auth/register", json={
        "email": "newpassenger@example.com",
        "mobile_number": "9123456780",
        "full_name": "Satyanarayana Murthy",
        "password": "Password@2026",
        "confirm_password": "Password@2026",
        "terms_accepted": True
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data["success"] is True
    assert "access_token" in data["data"]

def test_duplicate_registration(client):
    res = client.post("/api/v1/auth/register", json={
        "email": "newpassenger@example.com",
        "mobile_number": "9123456780",
        "full_name": "Duplicate User",
        "password": "Password@2026",
        "confirm_password": "Password@2026",
        "terms_accepted": True
    })
    assert res.status_code == 409

def test_invalid_email(client):
    res = client.post("/api/v1/auth/register", json={
        "email": "not-an-email",
        "mobile_number": "9123456781",
        "full_name": "Test User",
        "password": "Password@2026",
        "confirm_password": "Password@2026",
        "terms_accepted": True
    })
    assert res.status_code == 400

def test_weak_password(client):
    res = client.post("/api/v1/auth/register", json={
        "email": "weak@example.com",
        "mobile_number": "9123456782",
        "full_name": "Weak Pass User",
        "password": "123",
        "confirm_password": "123",
        "terms_accepted": True
    })
    assert res.status_code == 400
    assert "Password must be at least 8 characters" in res.get_json()["message"]

def test_successful_login(client):
    res = client.post("/api/v1/auth/login", json={
        "identifier": "newpassenger@example.com",
        "password": "Password@2026"
    })
    assert res.status_code == 200
    assert "access_token" in res.get_json()["data"]

def test_incorrect_password(client):
    res = client.post("/api/v1/auth/login", json={
        "identifier": "newpassenger@example.com",
        "password": "WrongPassword!99"
    })
    assert res.status_code == 401

def test_protected_page_access(client):
    res = client.get("/api/v1/complaints/my")
    assert res.status_code == 401

def test_passenger_attempting_admin_access(client, passenger_token):
    res = client.get("/api/v1/admin/stats", headers={"Authorization": f"Bearer {passenger_token}"})
    assert res.status_code == 403
