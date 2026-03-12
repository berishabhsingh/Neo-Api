from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import RiskConfig

router = APIRouter(prefix="/api/risk", tags=["risk"])

@router.get("/")
async def get_risk_config(db: Session = Depends(get_db)):
    config = db.query(RiskConfig).filter(RiskConfig.user_id == 1).first()
    if not config:
        config = RiskConfig(user_id=1, global_kill_switch=False, max_daily_loss=5000.0, paper_trading_mode=True)
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

@router.post("/kill_switch")
async def toggle_kill_switch(state: bool, db: Session = Depends(get_db)):
    config = db.query(RiskConfig).filter(RiskConfig.user_id == 1).first()
    if config:
        config.global_kill_switch = state
        db.commit()
    return {"status": "success", "message": f"Kill switch is now {'ON' if state else 'OFF'}"}

def validate_trade_against_risk(db: Session, user_id: int, quantity: int, price: float):
    config = db.query(RiskConfig).filter(RiskConfig.user_id == user_id).first()
    if not config:
        return

    if config.global_kill_switch:
        raise HTTPException(status_code=403, detail="Global Kill Switch is active. No trades allowed.")
    if config.max_daily_loss and (quantity * price > config.max_daily_loss):
        # Only block if it actually exceeds limits. Since our dummy price was 100
        # and quantity is 100, this is 10000. It exceeds 5000.
        raise HTTPException(status_code=403, detail="Trade exceeds maximum daily loss limits.")
