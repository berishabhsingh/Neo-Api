import os
import logging
from typing import List, Dict, Any

try:
    from neo_api_client import NeoAPI
except ImportError:
    NeoAPI = None

MOCK_MODE = os.getenv("MOCK_MODE", "True").lower() == "true"

class NeoService:
    def __init__(self):
        self.client = None
        self.is_logged_in = False
        self.consumer_key = os.getenv("KOTAK_CONSUMER_KEY", "mock_key")
        self.consumer_secret = os.getenv("KOTAK_CONSUMER_SECRET", "mock_secret")

    def _get_client(self):
        if not self.client and not MOCK_MODE and NeoAPI:
            self.client = NeoAPI(
                environment="prod",
                consumer_key=self.consumer_key,
                consumer_secret=self.consumer_secret
            )
        return self.client

    def login(self, mobile_number: str, ucc: str, totp: str) -> Dict[str, Any]:
        if MOCK_MODE:
            return {"status": "success", "message": "Mock TOTP login successful"}

        client = self._get_client()
        if not client:
            raise Exception("Kotak Neo client not initialized")

        return client.totp_login(mobile_number=mobile_number, ucc=ucc, totp=totp)

    def verify_mpin(self, mpin: str) -> Dict[str, Any]:
        if MOCK_MODE:
            self.is_logged_in = True
            return {"status": "success", "message": "Mock MPIN verification successful"}

        client = self._get_client()
        if not client:
            raise Exception("Kotak Neo client not initialized")

        result = client.totp_validate(mpin=mpin)
        self.is_logged_in = True
        return result

    def get_positions(self) -> List[Dict[str, Any]]:
        if MOCK_MODE:
            return [
                {"trading_symbol": "NIFTY24OCT25000CE", "quantity": 50, "avg_price": 120.5, "net_value": 6025.0},
                {"trading_symbol": "RELIANCE-EQ", "quantity": 10, "avg_price": 2500.0, "net_value": 25000.0}
            ]

        if not self.is_logged_in:
            raise Exception("Not authenticated")

        client = self._get_client()
        return client.positions().get("data", [])

    def get_orders(self) -> List[Dict[str, Any]]:
        if MOCK_MODE:
            return [
                {"order_id": "ORD001", "trading_symbol": "NIFTY-EQ", "transaction_type": "B", "quantity": 100, "price": 18500.0, "status": "COMPLETED"},
                {"order_id": "ORD002", "trading_symbol": "SBIN-EQ", "transaction_type": "S", "quantity": 50, "price": 600.0, "status": "REJECTED"}
            ]

        if not self.is_logged_in:
            raise Exception("Not authenticated")

        client = self._get_client()
        return client.order_report().get("data", [])

    def get_holdings(self) -> List[Dict[str, Any]]:
        if MOCK_MODE:
            return [
                {"trading_symbol": "HDFCBANK-EQ", "quantity": 100, "avg_price": 1500.0, "current_price": 1550.0},
                {"trading_symbol": "INFY-EQ", "quantity": 50, "avg_price": 1400.0, "current_price": 1380.0}
            ]

        if not self.is_logged_in:
            raise Exception("Not authenticated")

        client = self._get_client()
        return client.holdings().get("data", [])

    def place_order(self, symbol: str, quantity: int, transaction_type: str, order_type: str = "L", price: float = 0.0) -> Dict[str, Any]:
        if MOCK_MODE:
            return {"status": "success", "order_id": f"MOCK_ORD_{os.urandom(4).hex()}"}

        if not self.is_logged_in:
            raise Exception("Not authenticated")

        client = self._get_client()
        return client.place_order(
            exchange="NSE",
            trading_symbol=symbol,
            transaction_type=transaction_type,
            quantity=str(quantity),
            price=str(price),
            order_type=order_type,
            product="NRML"
        )

    def get_ltp(self, symbol: str) -> float:
        """Get Last Traded Price"""
        if MOCK_MODE:
            import random
            # Simple mock price movement
            base_prices = {"NIFTY-EQ": 25000.0, "RELIANCE-EQ": 2500.0, "SBIN-EQ": 600.0}
            base = base_prices.get(symbol, 100.0)
            return base + random.uniform(-10, 10)

        if not self.is_logged_in:
            return 0.0

        client = self._get_client()
        # Note: SDK specific method for quotes
        try:
            quote = client.quotes(symbols=[{"exchange": "NSE", "trading_symbol": symbol}])
            return float(quote.get("data", [{}])[0].get("ltp", 0.0))
        except:
            return 0.0

neo_service = NeoService()
