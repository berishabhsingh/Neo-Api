import asyncio
import logging
from sqlalchemy.orm import Session
from .database import SessionLocal
from .models import Strategy, OrderLog, RiskConfig
from .kotak_client import get_client

logger = logging.getLogger(__name__)

async def background_strategy_worker():
    logger.info("Starting background strategy worker...")
    while True:
        try:
            db = SessionLocal()
            try:
                active_strategies = db.query(Strategy).filter(Strategy.is_active == True).all()
                if not active_strategies:
                    await asyncio.sleep(5)
                    continue

                client = get_client()

                for strategy in active_strategies:
                    config = db.query(RiskConfig).filter(RiskConfig.user_id == strategy.user_id).first()
                    if config and config.global_kill_switch:
                        strategy.is_active = False
                        logger.warning(f"Strategy {strategy.name} stopped due to global kill switch.")
                        continue

                    if not client.is_logged_in and not getattr(client, "mock_mode", True):
                        continue

                    if strategy.buy_above:
                        log = OrderLog(
                            user_id=strategy.user_id,
                            strategy_id=strategy.id,
                            instrument_token=strategy.instrument_token,
                            transaction_type="B",
                            quantity=strategy.quantity,
                            price=strategy.buy_above,
                            status="SIGNAL_GENERATED",
                            message=f"Strategy {strategy.name} evaluated. Buy above {strategy.buy_above} triggered."
                        )
                        db.add(log)
                        strategy.is_active = False

                db.commit()
            finally:
                db.close()
            await asyncio.sleep(5)
        except Exception as e:
            logger.error(f"Worker Error: {e}")
            await asyncio.sleep(5)
