from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    mobile_number = Column(String, unique=True, index=True)
    ucc = Column(String, index=True)
    is_active = Column(Boolean, default=True)

class Strategy(Base):
    __tablename__ = "strategies"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    is_active = Column(Boolean, default=False)
    instrument_token = Column(String, index=True)
    exchange_segment = Column(String)
    quantity = Column(Integer)
    product_type = Column(String) # NRML, CNC, MIS
    order_type = Column(String) # L, MKT, SL, SL-M
    buy_above = Column(Float, nullable=True)
    sell_below = Column(Float, nullable=True)
    stop_loss_pct = Column(Float, nullable=True)
    take_profit_pct = Column(Float, nullable=True)
    trailing_stop_pct = Column(Float, nullable=True)
    time_square_off = Column(String, nullable=True) # HH:MM format
    max_trades_per_day = Column(Integer, nullable=True)
    max_daily_loss = Column(Float, nullable=True)

class OrderLog(Base):
    __tablename__ = "order_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    strategy_id = Column(Integer, ForeignKey("strategies.id"), nullable=True)
    order_id = Column(String, index=True, nullable=True)
    instrument_token = Column(String)
    transaction_type = Column(String) # B, S
    quantity = Column(Integer)
    price = Column(Float)
    status = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    message = Column(Text, nullable=True)

class RiskConfig(Base):
    __tablename__ = "risk_configs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    global_kill_switch = Column(Boolean, default=False)
    max_daily_loss = Column(Float, nullable=True)
    paper_trading_mode = Column(Boolean, default=True)
