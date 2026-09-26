# Production Dockerfile for AI Microservice
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency specifications
COPY ai-service/pyproject.toml ai-service/poetry.lock* ./

# Install python dependencies
RUN pip install --no-cache-dir \
    fastapi==0.111.0 \
    uvicorn[standard]==0.30.1 \
    pydantic==2.7.4 \
    pydantic-settings==2.3.4 \
    python-dotenv==1.0.1 \
    python-multipart==0.0.9 \
    httpx==0.27.0 \
    pytest==8.2.2 \
    pytest-asyncio==0.23.7

# Copy source code
COPY ai-service/app ./app

# Add unprivileged user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

ENV PORT=8000
ENV HOST=0.0.0.0

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
