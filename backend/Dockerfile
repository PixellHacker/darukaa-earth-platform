FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for geospatial libraries
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run database seeds and start API server
CMD ["sh", "-c", "python seed_data.py && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
