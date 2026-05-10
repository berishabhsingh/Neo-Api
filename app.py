from fastapi import FastAPI, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import os
import logging
import uvicorn
from fastapi.responses import HTMLResponse

try:
    from neo_api_client import NeoAPI
except ImportError:
    NeoAPI = None
    print("WARNING: neo_api_client not installed")

app = FastAPI(title="Simple Kotak Neo Trader")

# Mock mode for testing without real credentials
MOCK_MODE = os.getenv("MOCK_MODE", "True").lower() == "true"

class ClientManager:
    def __init__(self):
        self.client = None
        self.is_logged_in = False

    def get_client(self):
        if self.client is None and not MOCK_MODE and NeoAPI:
            consumer_key = os.getenv("KOTAK_CONSUMER_KEY", "")
            self.client = NeoAPI(environment="prod", consumer_key=consumer_key)
        return self.client

manager = ClientManager()

# Create static directory
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_root():
    with open("static/index.html", "r") as f:
        return f.read()

class LoginRequest(BaseModel):
    mobile_number: str
    ucc: str
    totp: str

class VerifyRequest(BaseModel):
    mpin: str

@app.post("/api/login")
def login(request: LoginRequest):
    try:
        if MOCK_MODE:
            return {"status": "success", "message": "Mock login successful", "data": {"token": "mock_token"}}

        client = manager.get_client()
        if not client:
            raise HTTPException(status_code=500, detail="Kotak Neo client not initialized")

        result = client.totp_login(
            mobile_number=request.mobile_number,
            ucc=request.ucc,
            totp=request.totp
        )
        return {"status": "success", "message": "TOTP login successful", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/verify")
def verify(request: VerifyRequest):
    try:
        if MOCK_MODE:
            manager.is_logged_in = True
            return {"status": "success", "message": "Mock MPIN validation successful"}

        client = manager.get_client()
        if not client:
            raise HTTPException(status_code=500, detail="Kotak Neo client not initialized")

        result = client.totp_validate(mpin=request.mpin)
        manager.is_logged_in = True
        return {"status": "success", "message": "Login verified successfully", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/positions")
def get_positions():
    try:
        if MOCK_MODE:
            return {"status": "success", "data": [
                {"trading_symbol": "NIFTY-EQ", "quantity": 10, "avg_price": 100.5, "net_value": 1005.0}
            ]}

        if not manager.is_logged_in:
            raise HTTPException(status_code=401, detail="Not logged in")

        client = manager.get_client()
        return client.positions()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/orders")
def get_orders():
    try:
        if MOCK_MODE:
             return {"status": "success", "data": [
                {"order_id": "12345", "trading_symbol": "NIFTY-EQ", "transaction_type": "B", "quantity": 10, "price": 100.5, "status": "COMPLETED"}
            ]}

        if not manager.is_logged_in:
            raise HTTPException(status_code=401, detail="Not logged in")

        client = manager.get_client()
        return client.order_report()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/api/health")
def health_check():
    return {"status": "ok", "mock_mode": MOCK_MODE}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
