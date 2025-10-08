"""
Analytics Service - FastAPI Application

Provides advanced analytics, reporting, and AI-powered insights.
Runs on port 8000 alongside Node.js backend (port 3001).
"""
import sys
import os
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Load environment variables from parent .env file
from dotenv import load_dotenv
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from loguru import logger

from analytics.config import get_settings
from analytics.routers import reports, insights, health, goals

# Initialize settings
settings = get_settings()

# Configure logger
logger.add(
    "logs/analytics_{time}.log",
    rotation="1 day",
    retention="7 days",
    level="INFO" if not settings.debug else "DEBUG"
)

# Create FastAPI app
app = FastAPI(
    title="Finance Analytics Service",
    description="Advanced analytics and AI-powered insights",
    version="1.0.0",
    docs_url="/analytics/docs" if settings.debug else None,
    redoc_url="/analytics/redoc" if settings.debug else None,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": str(exc) if settings.debug else "An error occurred"
        }
    )

# Register routers
app.include_router(health.router, prefix="/analytics", tags=["Health"])
app.include_router(reports.router, prefix="/analytics/reports", tags=["Reports"])
app.include_router(insights.router, prefix="/analytics/insights", tags=["Insights"])
app.include_router(goals.router, prefix="/analytics/goals", tags=["Goals AI"])

@app.on_event("startup")
async def startup_event():
    logger.info("🐍 Analytics Service starting...")
    logger.info(f"🌍 Environment: {settings.environment}")
    logger.info(f"🔧 Debug mode: {settings.debug}")
    logger.info(f"🚀 Server running on {settings.host}:{settings.port}")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("🛑 Analytics Service shutting down...")

# Root endpoint
@app.get("/analytics")
async def root():
    return {
        "service": "Finance Analytics Service",
        "version": "1.0.0",
        "status": "running",
        "environment": settings.environment,
        "docs": "/analytics/docs" if settings.debug else None
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="debug" if settings.debug else "info"
    )
