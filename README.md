# Kotak Neo Algorithmic Trading Platform

A production-ready, full-stack trading web app built with Next.js 14+ (App Router) and TypeScript for the frontend, and a Python FastAPI backend integrating the official [Kotak Neo Python SDK v2](https://github.com/Kotak-Neo/Kotak-neo-api-v2).

## Features
- **Secure Authentication**: TOTP and MPIN login flow via Kotak API.
- **Live Market Data**: WebSocket auto-reconnecting integration for real-time `lightweight-charts`.
- **Strategy Builder**: Custom automated trading rules with entry, exit, stop loss, and take profit.
- **Risk Management**: Global emergency Kill Switch, max daily loss limits, and simulation mode.
- **Account Dashboard**: Live view of positions, holdings, limits, and orders.
- **Audit Logs**: Database-backed trail of all signal generations, order responses, and risk blocks.
- **Mock Mode**: Fully testable locally without live Kotak credentials.

## Architecture & Limitations
The application is strictly separated into a Next.js static frontend (suitable for Vercel) and a persistent Python FastAPI backend.
> **Known Limitation:** The Python backend maintains persistent WebSocket connections to the Kotak exchange and evaluates trading strategies via an asyncio loop in real-time. Therefore, **the backend must be hosted on a persistent server** (e.g., Railway, Render, Fly.io, or Docker/VPS) and cannot be deployed to serverless environments like Vercel Functions or AWS Lambda, as serverless functions time out and will drop live subscriptions and background trading loops.

## Deployment Steps

### 1. Frontend (Vercel)
1. Navigate to the `frontend/` directory.
2. Ensure you have copied `.env.example` to `.env` and set `NEXT_PUBLIC_API_URL` to your live backend URL (e.g., `https://api.mytradingapp.com`).
3. Push to GitHub.
4. Import the repository in Vercel.
5. Set the Framework Preset to `Next.js` and Root Directory to `frontend`.
6. Add environment variables and deploy.

### 2. Backend (Docker / Railway / Render)
1. Set up a persistent service (e.g., Railway App).
2. Use the provided `backend/Dockerfile`.
3. Set your environment variables in the service dashboard (refer to `backend/.env.example`).
   - `MOCK_MODE=False`
   - `KOTAK_CONSUMER_KEY=your_key`
4. Deploy the service and expose port `8000`.

## Local Development Setup

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to access the trading dashboard.

## Production Hardening Checklist
- [ ] Connect a PostgreSQL database via `DB_URL` environment variable to ensure order logs and sessions persist across backend container restarts.
- [ ] Route traffic securely over HTTPS/WSS.
- [ ] Ensure backend monitoring/alerts are configured so you are notified if the background strategy evaluator loop crashes.
- [ ] Ensure `MOCK_MODE` is disabled in the `.env` configuration.
- [ ] Implement robust token encryption and secure storage of session IDs.

## Disclaimer & Compliance Statement
**User Assumes All Financial Risk:** This platform allows users to define custom logic for automated trade execution. It relies on Kotak APIs for data and order placement. Users should thoroughly test strategies in "Paper Trading" mode before enabling live execution. The developer bears no responsibility for financial losses, missed trades, order routing errors, or API timeouts. Use responsibly.
