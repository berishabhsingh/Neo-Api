# Kotak Neo Algorithmic Trading Platform v2

A modern, full-stack trading application built with FastAPI and a reactive Tailwind CSS frontend. It integrates with the Kotak Neo SDK for automated trading.

## 🚀 Features

- **Modern Dashboard**: High-performance UI for monitoring positions and orders.
- **Mock Mode**: Fully functional simulation mode for testing without real credentials.
- **Strategy Engine**: Define and toggle automated trading rules.
- **Risk Management**: Global kill switch and configurable daily loss limits.
- **Audit Logging**: Comprehensive system activity tracking in a local SQLite database.

## 🛠️ Tech Stack

- **Backend**: FastAPI (Python 3.12+), SQLAlchemy (SQLite).
- **Frontend**: Tailwind CSS, Vanilla JS (Modular).
- **SDK**: Official Kotak Neo Python SDK v2.

## 📦 Setup

### Local Development
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
2. Run the application:
   ```bash
   python app.py
   ```
3. Access at `http://localhost:8000`.

### Production (Docker)
```bash
docker build -t kotak-neo-algo .
docker run -p 8000:8000 kotak-neo-algo
```

## ⚙️ Configuration

Environment variables:
- `MOCK_MODE`: Set to `True` for simulation (default `False` in Docker).
- `KOTAK_CONSUMER_KEY`: Your Kotak API consumer key.
- `KOTAK_CONSUMER_SECRET`: Your Kotak API consumer secret.
- `DATABASE_URL`: SQLAlchemy database URL (default: `sqlite:///./trading_app.db`).
- `PORT`: Server port (default: `8000`).

## ⚠️ Disclaimer
Automated trading carries significant financial risk. Always test strategies thoroughly in Mock Mode before live deployment.
