"""
Health Check Router
"""
from fastapi import APIRouter
from datetime import datetime
import psutil
import os

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint for analytics service"""
    return {
        "status": "healthy",
        "service": "analytics",
        "timestamp": datetime.utcnow().isoformat(),
        "uptime": psutil.Process(os.getpid()).create_time(),
        "memory": {
            "used_mb": psutil.Process(os.getpid()).memory_info().rss / 1024 / 1024,
            "percent": psutil.Process(os.getpid()).memory_percent()
        },
        "cpu_percent": psutil.Process(os.getpid()).cpu_percent()
    }


@router.get("/status")
async def status():
    """Detailed status of analytics service"""
    return {
        "status": "operational",
        "features": {
            "reports": "enabled",
            "insights": "enabled",
            "ai_agents": "enabled",
            "ml_predictions": "enabled"
        },
        "version": "1.0.0"
    }
