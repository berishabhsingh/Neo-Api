from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from .schemas import OrderRequest, ModifyOrderRequest, CancelOrderRequest
from .kotak_client import get_client
from .database import get_db
from .models import OrderLog
from .risk import validate_trade_against_risk

router = APIRouter(prefix="/api/orders", tags=["orders"])

@router.post("/place")
async def place_order(order: OrderRequest, db: Session = Depends(get_db)):
    try:
        validate_trade_against_risk(db, user_id=1, quantity=int(order.quantity), price=float(order.price or 0.0))
        client = get_client()
        result = client.place_order(**order.model_dump(exclude_none=True))

        log = OrderLog(
            user_id=1,
            order_id=result.get("order_id", "UNKNOWN"),
            instrument_token=order.trading_symbol,
            transaction_type=order.transaction_type,
            quantity=int(order.quantity),
            price=float(order.price or 0.0),
            status="PLACED",
            message="User initiated order"
        )
        db.add(log)
        db.commit()
        return result
    except Exception as e:
        log = OrderLog(
            user_id=1,
            instrument_token=order.trading_symbol,
            transaction_type=order.transaction_type,
            quantity=int(order.quantity),
            price=float(order.price or 0.0),
            status="REJECTED",
            message=str(e)
        )
        db.add(log)
        db.commit()
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/modify")
async def modify_order(order: ModifyOrderRequest):
    try:
        client = get_client()
        return client.modify_order(**order.model_dump(exclude_none=True))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/cancel")
async def cancel_order(order: CancelOrderRequest):
    try:
        client = get_client()
        return client.cancel_order(**order.model_dump(exclude_none=True))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/")
async def get_orders():
    try:
        client = get_client()
        return client.order_report()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/positions")
async def get_positions():
    try:
        client = get_client()
        return client.positions()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/holdings")
async def get_holdings():
    try:
        client = get_client()
        return client.holdings()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/limits")
async def get_limits(segment: str = "ALL", exchange: str = "ALL", product: str = "ALL"):
    try:
        client = get_client()
        return client.limits(segment=segment, exchange=exchange, product=product)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/logs")
async def get_order_logs(db: Session = Depends(get_db)):
    return db.query(OrderLog).order_by(OrderLog.timestamp.desc()).limit(100).all()
