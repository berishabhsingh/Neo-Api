from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from .schemas import StrategyCreate, Strategy as StrategySchema, StrategyUpdate
from .models import Strategy
from .database import get_db
from .risk import validate_trade_against_risk

router = APIRouter(prefix="/api/strategies", tags=["strategies"])

@router.post("/", response_model=StrategySchema)
async def create_strategy(strategy: StrategyCreate, db: Session = Depends(get_db)):
    db_strategy = Strategy(**strategy.model_dump())
    db.add(db_strategy)
    db.commit()
    db.refresh(db_strategy)
    return db_strategy

@router.get("/", response_model=list[StrategySchema])
async def list_strategies(db: Session = Depends(get_db)):
    return db.query(Strategy).all()

@router.get("/{strategy_id}", response_model=StrategySchema)
async def get_strategy(strategy_id: int, db: Session = Depends(get_db)):
    strategy = db.query(Strategy).filter(Strategy.id == strategy_id).first()
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return strategy

@router.patch("/{strategy_id}", response_model=StrategySchema)
async def update_strategy(strategy_id: int, updates: StrategyUpdate, db: Session = Depends(get_db)):
    strategy = db.query(Strategy).filter(Strategy.id == strategy_id).first()
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")

    update_data = updates.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(strategy, key, value)

    db.commit()
    db.refresh(strategy)
    return strategy

@router.post("/{strategy_id}/start")
async def start_strategy(strategy_id: int, db: Session = Depends(get_db)):
    strategy = db.query(Strategy).filter(Strategy.id == strategy_id).first()
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")

    try:
        # Check risk limits. Use a dummy price if unknown
        validate_trade_against_risk(db, user_id=strategy.user_id, quantity=strategy.quantity, price=100.0)
    except HTTPException as e:
        raise e

    strategy.is_active = True
    db.commit()
    db.refresh(strategy)
    return {"status": "success", "message": f"Strategy {strategy.name} started.", "strategy": strategy}

@router.post("/{strategy_id}/stop")
async def stop_strategy(strategy_id: int, db: Session = Depends(get_db)):
    strategy = db.query(Strategy).filter(Strategy.id == strategy_id).first()
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")

    strategy.is_active = False
    db.commit()
    db.refresh(strategy)
    return {"status": "success", "message": f"Strategy {strategy.name} stopped.", "strategy": strategy}
