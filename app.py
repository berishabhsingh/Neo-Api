from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
import asyncio
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
import os
import uvicorn
import logging
import datetime
from typing import List, Optional

import models
from database import engine, get_db
from services.neo_service import neo_service, MOCK_MODE

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Kotak Neo Algorithmic Trading Platform")

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Models
class LoginRequest(BaseModel):
    mobile_number: str
    ucc: str
    totp: str

class VerifyRequest(BaseModel):
    mpin: str

class StrategyCreate(BaseModel):
    name: str
    symbol: str
    entry_condition: str
    exit_condition: str
    stop_loss: float
    take_profit: float

class RiskSettingsUpdate(BaseModel):
    max_daily_loss: Optional[float]
    max_open_positions: Optional[int]
    kill_switch_enabled: Optional[bool]

# Middleware/Utils
def log_audit(db: Session, level: str, message: str, details: str = None):
    audit_log = models.AuditLog(level=level, message=message, details=details)
    db.add(audit_log)
    db.commit()

async def strategy_engine():
    """Background task to evaluate strategies"""
    logger.info("Strategy Engine started")
    while True:
        try:
            db = next(get_db())
            active_strategies = db.query(models.Strategy).filter(models.Strategy.is_active == True).all()
            risk_settings = db.query(models.RiskSettings).first()

            if risk_settings and risk_settings.kill_switch_enabled:
                logger.warning("Kill switch is active. Skipping strategy evaluation.")
            else:
                for strat in active_strategies:
                    ltp = neo_service.get_ltp(strat.symbol)
                    logger.info(f"Evaluating {strat.name}: {strat.symbol} @ {ltp}")

                    # Very basic mock logic for demo
                    # In real app, we'd parse strat.entry_condition
                    if "RSI < 30" in strat.entry_condition and ltp > 0:
                        order = neo_service.place_order(strat.symbol, 1, "B", "M")
                        log_audit(db, "INFO", f"Strategy {strat.name} triggered BUY", str(order))
                        # Deactivate after one trigger for demo safety
                        strat.is_active = False
                        db.commit()

            db.close()
        except Exception as e:
            logger.error(f"Strategy Engine error: {e}")

        await asyncio.sleep(10) # Run every 10 seconds

# --- API Routes ---

@app.get("/api/health")
def health():
    return {"status": "ok", "mock_mode": MOCK_MODE, "authenticated": neo_service.is_logged_in}

@app.post("/api/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    try:
        result = neo_service.login(request.mobile_number, request.ucc, request.totp)
        log_audit(db, "INFO", f"Login attempt for UCC: {request.ucc}")
        return result
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=400, detail="Authentication failed")

@app.post("/api/verify")
def verify(request: VerifyRequest, db: Session = Depends(get_db)):
    try:
        result = neo_service.verify_mpin(request.mpin)
        log_audit(db, "INFO", "MPIN verified successfully")
        return result
    except Exception as e:
        logger.error(f"Verification error: {str(e)}")
        raise HTTPException(status_code=400, detail="MPIN verification failed")

@app.get("/api/positions")
def get_positions(db: Session = Depends(get_db)):
    try:
        return {"data": neo_service.get_positions()}
    except Exception as e:
        logger.error(f"Error fetching positions: {str(e)}")
        raise HTTPException(status_code=401, detail="Could not fetch positions")

@app.get("/api/orders")
def get_orders(db: Session = Depends(get_db)):
    try:
        return {"data": neo_service.get_orders()}
    except Exception as e:
        logger.error(f"Error fetching orders: {str(e)}")
        raise HTTPException(status_code=401, detail="Could not fetch orders")

# Strategy Management
@app.post("/api/strategies")
def create_strategy(strategy: StrategyCreate, db: Session = Depends(get_db)):
    db_strategy = models.Strategy(**strategy.dict())
    db.add(db_strategy)
    db.commit()
    db.refresh(db_strategy)
    log_audit(db, "INFO", f"Created strategy: {strategy.name}")
    return db_strategy

@app.get("/api/strategies")
def list_strategies(db: Session = Depends(get_db)):
    return db.query(models.Strategy).all()

@app.post("/api/strategies/{strategy_id}/toggle")
def toggle_strategy(strategy_id: int, db: Session = Depends(get_db)):
    strategy = db.query(models.Strategy).filter(models.Strategy.id == strategy_id).first()
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    strategy.is_active = not strategy.is_active
    db.commit()
    log_audit(db, "INFO", f"Toggled strategy {strategy.name} to {strategy.is_active}")
    return strategy

# Risk Management
@app.get("/api/risk")
def get_risk(db: Session = Depends(get_db)):
    settings = db.query(models.RiskSettings).first()
    if not settings:
        settings = models.RiskSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@app.post("/api/risk")
def update_risk(settings: RiskSettingsUpdate, db: Session = Depends(get_db)):
    db_settings = db.query(models.RiskSettings).first()
    if not db_settings:
        db_settings = models.RiskSettings()
        db.add(db_settings)

    for var, value in settings.dict().items():
        if value is not None:
            setattr(db_settings, var, value)

    db.commit()
    log_audit(db, "WARNING", "Risk settings updated")
    return db_settings

# Audit Logs
@app.get("/api/logs")
def get_logs(db: Session = Depends(get_db)):
    return db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).limit(100).all()

# Serve Frontend
os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def read_root():
    return FileResponse("static/index.html")

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(strategy_engine())

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
