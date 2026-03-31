from fastapi.testclient import TestClient
from app.main import app
import sys
from pathlib import Path

# Add the backend directory to the Python path
sys.path.append(str(Path(__file__).resolve().parent.parent / 'backend'))

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.text == "OK"

def test_create_lot():
    payload = {
        "crop_type": "Mango",
        "quantity": "1000 kg",
        "harvest_date": "2026-03-01",
        "location": "Pune",
    }
    response = client.post("/api/v1/lots", json=payload)
    assert response.status_code == 200
    assert "Lot_ID" in response.json()

def test_get_lots():
    response = client.get("/api/v1/lots")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
