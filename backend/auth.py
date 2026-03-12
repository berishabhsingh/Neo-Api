from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from .schemas import LoginRequest, VerifyRequest
from .kotak_client import get_client
from .database import get_db
from .models import User, RiskConfig
import os

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/login")
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    try:
        # Look up user by mobile number or create them
        user = db.query(User).filter(User.mobile_number == request.mobile_number).first()
        if not user:
            user = User(mobile_number=request.mobile_number, ucc=request.ucc)
            db.add(user)
            db.commit()
            db.refresh(user)

        risk_config = db.query(RiskConfig).filter(RiskConfig.user_id == user.id).first()
        if not risk_config:
            risk_config = RiskConfig(user_id=user.id)
            db.add(risk_config)
            db.commit()

        client = get_client()
        env_key = os.getenv("KOTAK_CONSUMER_KEY")
        if env_key and not os.getenv("MOCK_MODE", "True").lower() == "true":
            if client.client:
                client.client.consumer_key = env_key

        result = client.totp_login(
            mobile_number=request.mobile_number,
            ucc=request.ucc,
            totp=request.totp
        )
        return {"status": "success", "message": "TOTP login successful", "data": result, "user_id": user.id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/verify")
async def verify(request: VerifyRequest):
    try:
        client = get_client()
        result = client.totp_validate(mpin=request.mpin)
        return {"status": "success", "message": "Login verified successfully", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/logout")
async def logout():
    try:
        client = get_client()
        result = client.logout()
        return {"status": "success", "message": "Logout successful", "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
