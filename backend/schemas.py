from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    mobile_number: str
    ucc: str
    is_active: bool = True

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    class Config:
        orm_mode = True
        from_attributes = True

class StrategyBase(BaseModel):
    name: str
    instrument_token: str
    exchange_segment: str = "nse_cm"
    quantity: int
    product_type: str = "MIS"
    order_type: str = "MKT"
    buy_above: Optional[float] = None
    sell_below: Optional[float] = None
    stop_loss_pct: Optional[float] = None
    take_profit_pct: Optional[float] = None
    trailing_stop_pct: Optional[float] = None
    time_square_off: Optional[str] = None
    max_trades_per_day: Optional[int] = None
    max_daily_loss: Optional[float] = None

class StrategyCreate(StrategyBase):
    user_id: int

class StrategyUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None
    quantity: Optional[int] = None

class Strategy(StrategyBase):
    id: int
    user_id: int
    is_active: bool
    class Config:
        orm_mode = True
        from_attributes = True

class OrderLogBase(BaseModel):
    user_id: int
    strategy_id: Optional[int] = None
    order_id: Optional[str] = None
    instrument_token: str
    transaction_type: str
    quantity: int
    price: float
    status: str
    message: Optional[str] = None

class OrderLogCreate(OrderLogBase):
    pass

class OrderLog(OrderLogBase):
    id: int
    timestamp: datetime
    class Config:
        orm_mode = True
        from_attributes = True

class RiskConfigBase(BaseModel):
    global_kill_switch: bool = False
    max_daily_loss: Optional[float] = None
    paper_trading_mode: bool = True

class RiskConfigUpdate(RiskConfigBase):
    pass

class RiskConfig(RiskConfigBase):
    id: int
    user_id: int
    class Config:
        orm_mode = True
        from_attributes = True

# API Request/Response schemas
class LoginRequest(BaseModel):
    mobile_number: str
    ucc: str
    totp: str

class VerifyRequest(BaseModel):
    mpin: str

class OrderRequest(BaseModel):
    exchange_segment: str
    product: str
    price: str
    order_type: str
    quantity: str
    validity: str
    trading_symbol: str
    transaction_type: str
    amo: str = "NO"
    disclosed_quantity: str = "0"
    market_protection: str = "0"
    pf: str = "N"
    trigger_price: str = "0"
    tag: Optional[str] = None

class ModifyOrderRequest(BaseModel):
    order_id: str
    price: str
    quantity: str
    order_type: str
    validity: str
    disclosed_quantity: str = "0"
    trigger_price: str = "0"

class CancelOrderRequest(BaseModel):
    order_id: str
    amo: str = "NO"
    isVerify: bool = False
