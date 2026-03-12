from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import asyncio

from backend.database import engine, Base
from backend.auth import router as auth_router
from backend.orders import router as orders_router
from backend.strategies import router as strategies_router
from backend.risk import router as risk_router
from backend.worker import background_strategy_worker

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Kotak Neo Trading API",
    description="Backend service for automated trading using the Kotak Neo API SDK.",
    version="1.0.0"
)

# Allow CORS for Next.js frontend
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    os.getenv("FRONTEND_URL", "*")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(auth_router)
app.include_router(orders_router)
app.include_router(strategies_router)
app.include_router(risk_router)

@app.on_event("startup")
async def startup_event():
    # Start the background worker process evaluating rules and tracking risk
    asyncio.create_task(background_strategy_worker())

@app.get("/api/health")
def health_check():
    """Returns the API health status"""
    return {"status": "ok", "mock_mode": os.getenv("MOCK_MODE", "True").lower() == "true"}
