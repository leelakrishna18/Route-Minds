import pytest

def test_sms_valid_route_code(client):
    res = client.post("/api/v1/sms/webhook", json={
        "sender": "9848011223",
        "message": "VJY"
    })
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert data["status"] == "SENT"
    assert "APSRTC" in data["message"]
    assert "Vijayawada" in data["message"]

def test_sms_invalid_route_code(client):
    res = client.post("/api/v1/sms/webhook", json={
        "sender": "9848011223",
        "message": "UNKNOWN_CODE"
    })
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert data["status"] == "INVALID_CODE"
    assert "Unknown route code" in data["message"]

def test_assistant_english_query(client):
    res = client.post("/api/v1/assistant/query", json={
        "message": "What buses are available from Eluru to Vijayawada?",
        "language": "en"
    })
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert data["intent"] == "BUS_SCHEDULE"
    assert "Vijayawada" in data["response"]

def test_assistant_telugu_query(client):
    res = client.post("/api/v1/assistant/query", json={
        "message": "ఏలూరు నుండి విజయవాడ బస్సులు ఎప్పుడు ఉన్నాయి?",
        "language": "te"
    })
    assert res.status_code == 200
    data = res.get_json()["data"]
    assert data["intent"] == "BUS_SCHEDULE"
    assert "విజయవాడ" in data["response"]

def test_assistant_safety_info(client):
    res = client.post("/api/v1/assistant/query", json={
        "message": "How do I use the women safety feature?",
        "language": "en"
    })
    assert res.status_code == 200
    assert "112" in res.get_json()["data"]["response"]
