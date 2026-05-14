FROM python:3.12-slim

WORKDIR /app

# Install git since neo_api_client is installed from a git repo
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Set dynamic port via environment variable (default 8000)
ENV PORT=8000
ENV MOCK_MODE=False

# Command to run the application
CMD ["python", "app.py"]
