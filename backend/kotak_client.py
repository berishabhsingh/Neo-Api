import os
import logging
from typing import Optional, Dict, Any, List, Callable

logger = logging.getLogger(__name__)

MOCK_MODE = os.getenv("MOCK_MODE", "True").lower() == "true"

try:
    from neo_api_client import NeoAPI
except ImportError:
    logger.warning("neo_api_client could not be imported. Running in MOCK_MODE only.")
    MOCK_MODE = True

class KotakClientWrapper:
    def __init__(self, consumer_key: str = "", environment: str = "prod"):
        self.client = None
        self.is_logged_in = False
        self.environment = environment

        if not MOCK_MODE:
            try:
                self.client = NeoAPI(environment=self.environment, consumer_key=consumer_key)
            except Exception as e:
                logger.error(f"Failed to initialize NeoAPI: {e}")

    def totp_login(self, mobile_number: str, ucc: str, totp: str) -> Dict[str, Any]:
        if MOCK_MODE:
            return {"status": "success", "message": "Mock login successful"}
        try:
            return self.client.totp_login(mobile_number=mobile_number, ucc=ucc, totp=totp)
        except Exception as e:
            raise Exception(f"TOTP login failed: {str(e)}")

    def totp_validate(self, mpin: str) -> Dict[str, Any]:
        if MOCK_MODE:
            self.is_logged_in = True
            return {"status": "success", "message": "Mock MPIN validation successful"}
        try:
            result = self.client.totp_validate(mpin=mpin)
            self.is_logged_in = True
            return result
        except Exception as e:
            raise Exception(f"MPIN validation failed: {str(e)}")

    def logout(self) -> Dict[str, Any]:
        if MOCK_MODE:
            self.is_logged_in = False
            return {"status": "success", "message": "Mock logout successful"}
        try:
            if self.is_logged_in:
                result = self.client.logout()
                self.is_logged_in = False
                return result
            return {"status": "success"}
        except Exception as e:
            raise Exception(f"Logout failed: {str(e)}")

    def search_scrip(self, exchange_segment: str, symbol: str) -> Dict[str, Any]:
        if MOCK_MODE:
            return {
                "status": "success",
                "data": [{"instrument_token": "1234", "exchange_segment": exchange_segment, "trading_symbol": f"{symbol}-EQ", "name": f"{symbol} Limited"}]
            }
        try:
            return self.client.search_scrip(exchange_segment=exchange_segment, symbol=symbol)
        except Exception as e:
            raise Exception(f"Scrip search failed: {str(e)}")

    def quotes(self, instrument_tokens: List[Dict[str, str]], quote_type: str = "all") -> Dict[str, Any]:
        if MOCK_MODE:
            return {
                "status": "success",
                "data": [
                    {
                        "instrument_token": t["instrument_token"],
                        "exchange_segment": t["exchange_segment"],
                        "ltp": 100.5,
                        "ohlc": {"open": 100.0, "high": 101.0, "low": 99.0, "close": 100.5}
                    } for t in instrument_tokens
                ]
            }
        try:
            return self.client.quotes(instrument_tokens=instrument_tokens, quote_type=quote_type)
        except Exception as e:
            raise Exception(f"Quotes fetch failed: {str(e)}")

    def place_order(self, **kwargs) -> Dict[str, Any]:
        if MOCK_MODE:
            return {"status": "success", "order_id": "MOCK_ORDER_12345", "message": "Mock order placed successfully"}
        try:
            return self.client.place_order(**kwargs)
        except Exception as e:
            raise Exception(f"Place order failed: {str(e)}")

    def modify_order(self, **kwargs) -> Dict[str, Any]:
        if MOCK_MODE:
             return {"status": "success", "order_id": kwargs.get("order_id"), "message": "Mock order modified successfully"}
        try:
            return self.client.modify_order(**kwargs)
        except Exception as e:
            raise Exception(f"Modify order failed: {str(e)}")

    def cancel_order(self, order_id: str, amo: str = "NO", isVerify: bool = False) -> Dict[str, Any]:
        if MOCK_MODE:
            return {"status": "success", "order_id": order_id, "message": "Mock order cancelled successfully"}
        try:
            return self.client.cancel_order(order_id=order_id, amo=amo, isVerify=isVerify)
        except Exception as e:
            raise Exception(f"Cancel order failed: {str(e)}")

    def positions(self) -> Dict[str, Any]:
        if MOCK_MODE: return {"status": "success", "data": []}
        try: return self.client.positions()
        except Exception as e: raise Exception(f"Fetch positions failed: {str(e)}")

    def holdings(self) -> Dict[str, Any]:
        if MOCK_MODE: return {"status": "success", "data": []}
        try: return self.client.holdings()
        except Exception as e: raise Exception(f"Fetch holdings failed: {str(e)}")

    def limits(self, segment: str = "ALL", exchange: str = "ALL", product: str = "ALL") -> Dict[str, Any]:
        if MOCK_MODE:
            return {"status": "success", "data": {"available_margin": 100000.0, "used_margin": 0.0}}
        try: return self.client.limits(segment=segment, exchange=exchange, product=product)
        except Exception as e: raise Exception(f"Fetch limits failed: {str(e)}")

    def order_report(self) -> Dict[str, Any]:
        if MOCK_MODE: return {"status": "success", "data": []}
        try: return self.client.order_report()
        except Exception as e: raise Exception(f"Fetch order report failed: {str(e)}")

    def trade_report(self, order_id: Optional[str] = None) -> Dict[str, Any]:
        if MOCK_MODE: return {"status": "success", "data": []}
        try:
            if order_id: return self.client.trade_report(order_id=order_id)
            return self.client.trade_report()
        except Exception as e: raise Exception(f"Fetch trade report failed: {str(e)}")

    def setup_callbacks(self, on_message: Callable, on_error: Callable, on_close: Callable, on_open: Callable):
        if MOCK_MODE: return
        try:
            self.client.on_message = on_message
            self.client.on_error = on_error
            self.client.on_close = on_close
            self.client.on_open = on_open
        except Exception as e: logger.error(f"Setup callbacks failed: {e}")

    def subscribe(self, instrument_tokens: List[Dict[str, str]], isIndex: bool = False, isDepth: bool = False):
        if MOCK_MODE: return
        try: self.client.subscribe(instrument_tokens=instrument_tokens, isIndex=isIndex, isDepth=isDepth)
        except Exception as e: logger.error(f"Subscribe failed: {e}")

    def un_subscribe(self, instrument_tokens: List[Dict[str, str]], isIndex: bool = False, isDepth: bool = False):
        if MOCK_MODE: return
        try: self.client.un_subscribe(instrument_tokens=instrument_tokens, isIndex=isIndex, isDepth=isDepth)
        except Exception as e: logger.error(f"Unsubscribe failed: {e}")

    def subscribe_to_orderfeed(self):
        if MOCK_MODE: return
        try: self.client.subscribe_to_orderfeed()
        except Exception as e: logger.error(f"Subscribe to order feed failed: {e}")

client_instance = None

def get_client() -> KotakClientWrapper:
    global client_instance
    if client_instance is None:
        client_instance = KotakClientWrapper(consumer_key=os.getenv("KOTAK_CONSUMER_KEY", "MOCK_KEY"))
    return client_instance
