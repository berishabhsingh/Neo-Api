from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_read_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_risk_config():
    response = client.get("/api/risk/")
    assert response.status_code == 200
    data = response.json()
    assert "global_kill_switch" in data
    assert data["global_kill_switch"] is False

def test_kill_switch():
    response = client.post("/api/risk/kill_switch?state=true")
    assert response.status_code == 200

    response = client.get("/api/risk/")
    data = response.json()
    assert data["global_kill_switch"] is True

def test_strategy_creation():
    strategy_payload = {
        "user_id": 1,
        "name": "Moving Average Cross",
        "instrument_token": "1234",
        "exchange_segment": "nse_cm",
        "quantity": 100,
        "product_type": "MIS",
        "order_type": "MKT"
    }

    response = client.post("/api/strategies/", json=strategy_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Moving Average Cross"
    assert data["is_active"] is False # Default is DISABLED

def test_start_strategy_blocked_by_kill_switch():
    # Make sure kill switch is ON
    client.post("/api/risk/kill_switch?state=true")

    # Try to start strategy 1
    response = client.post("/api/strategies/1/start")
    assert response.status_code == 403
    assert "Kill Switch is active" in response.json()["detail"]

    # Turn OFF kill switch
    client.post("/api/risk/kill_switch?state=false")

    # Try again
    response = client.post("/api/strategies/1/start")
    assert response.status_code == 403
    assert "Trade exceeds maximum daily loss limits" in response.json()["detail"]
