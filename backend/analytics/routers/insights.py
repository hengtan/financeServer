"""
Insights Router - AI-Powered Financial Insights

Uses LangChain + OpenAI to generate intelligent financial advice.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from loguru import logger

from analytics.agents.financial_advisor import FinancialAdvisorAgent
from analytics.database.connection import get_db_connection

router = APIRouter()


@router.get("/")
async def get_insights(
    user_id: str = Query(..., description="User ID"),
    period_days: int = Query(30, description="Number of days to analyze")
):
    """
    Generate AI-powered financial insights

    Uses LangChain agents to:
    - Analyze spending patterns
    - Identify saving opportunities
    - Detect anomalies
    - Provide personalized recommendations
    """
    try:
        agent = FinancialAdvisorAgent()
        insights = await agent.generate_insights(user_id, period_days)

        return {
            "status": "success",
            "insights": insights,
            "period_days": period_days,
            "generated_at": insights.get("timestamp")
        }

    except Exception as e:
        logger.error(f"Error generating insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/savings-opportunities")
async def get_savings_opportunities(
    user_id: str = Query(..., description="User ID")
):
    """
    Find opportunities to save money using ML analysis
    """
    try:
        agent = FinancialAdvisorAgent()
        opportunities = await agent.find_savings_opportunities(user_id)

        return {
            "status": "success",
            "opportunities": opportunities,
            "potential_savings": sum(o.get("estimated_savings", 0) for o in opportunities)
        }

    except Exception as e:
        logger.error(f"Error finding savings opportunities: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/anomalies")
async def detect_anomalies(
    user_id: str = Query(..., description="User ID"),
    sensitivity: float = Query(2.0, description="Detection sensitivity (1-3)")
):
    """
    Detect unusual transactions using statistical analysis
    """
    try:
        agent = FinancialAdvisorAgent()
        anomalies = await agent.detect_anomalies(user_id, sensitivity)

        return {
            "status": "success",
            "anomalies": anomalies,
            "count": len(anomalies)
        }

    except Exception as e:
        logger.error(f"Error detecting anomalies: {e}")
        raise HTTPException(status_code=500, detail=str(e))
