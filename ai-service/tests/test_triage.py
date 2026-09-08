"""
Pytest Test Suite - SIH25018 Nabha Telemedicine AI Triage Engine
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_triage_low_risk():
    payload = {
        "symptoms": "Mild headache and runny nose",
        "age": 28,
        "gender": "Female",
        "vitals": {
            "temperature": 36.8,
            "spo2": 98,
            "heartRate": 72
        }
    }
    response = client.post("/api/ai/triage", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["riskLevel"] == "LOW"
    assert "disclaimer" in data

def test_triage_moderate_risk():
    payload = {
        "symptoms": "Persistent cough, mild fever, body ache",
        "age": 45,
        "gender": "Male",
        "vitals": {
            "temperature": 38.1,
            "spo2": 94,
            "heartRate": 85
        }
    }
    response = client.post("/api/ai/triage", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["riskLevel"] == "MODERATE"

def test_triage_high_risk():
    payload = {
        "symptoms": "Difficulty breathing and high fever",
        "age": 62,
        "gender": "Male",
        "vitals": {
            "temperature": 39.2,
            "spo2": 90,
            "heartRate": 115
        }
    }
    response = client.post("/api/ai/triage", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["riskLevel"] == "HIGH"

def test_triage_emergency():
    payload = {
        "symptoms": "Chest pain and unconsciousness",
        "age": 58,
        "gender": "Male",
        "vitals": {
            "spo2": 84,
            "systolicBp": 190
        }
    }
    response = client.post("/api/ai/triage", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["riskLevel"] == "EMERGENCY"
    assert len(data["warningFlags"]) > 0
