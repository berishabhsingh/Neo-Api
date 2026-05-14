from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text
from database import Base
from datetime import datetime, timezone

def utc_now():
    return datetime.now(timezone.utc)

class Strategy(Base):
    __tablename__ = "strategies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    symbol = Column(String)
    entry_condition = Column(String)
    exit_condition = Column(String)
    stop_loss = Column(Float)
    take_profit = Column(Float)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=utc_now)
    level = Column(String)
    message = Column(Text)
    details = Column(Text, nullable=True)

class RiskSettings(Base):
    __tablename__ = "risk_settings"
    id = Column(Integer, primary_key=True, index=True)
    max_daily_loss = Column(Float, default=1000.0)
    max_open_positions = Column(Integer, default=5)
    kill_switch_enabled = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
