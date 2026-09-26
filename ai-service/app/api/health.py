from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter()

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    checks: Dict[str, Any]

@router.get("/health", response_model=HealthResponse)
async def get_health():
    return {
        "status": "healthy",
        "service": "ai-service",
        "version": "1.0.0",
        "checks": {
            "embeddings": "ready",
            "qdrant_client": "standby"
        }
    }

@router.get("/ready")
async def get_readiness():
    return {"ready": True}
