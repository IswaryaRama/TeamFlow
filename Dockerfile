FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for PostgreSQL compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy entire repo
COPY . .

# Set working directory to backend where app/ lives
WORKDIR /app/backend

ENV PYTHONPATH="/app/backend"
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
