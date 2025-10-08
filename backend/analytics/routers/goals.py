"""
Goals Analytics Router - AI-Powered Goal Insights

Provides intelligent endpoints for financial goal management.
"""
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from loguru import logger

from analytics.agents.goals_advisor import GoalsAdvisorAgent

router = APIRouter()
goals_agent = GoalsAdvisorAgent()


@router.get("/prediction/{goal_id}")
async def predict_goal_achievement(
    goal_id: str,
    user_id: str = Query(..., description="User ID")
):
    """
    Predict if and when a goal will be achieved

    Returns:
    - Probability of achievement (0-100%)
    - Risk level assessment
    - Projected completion date
    - Required vs available monthly contribution
    - Actionable insights and warnings
    """
    try:
        result = await goals_agent.predict_goal_achievement(
            user_id=user_id,
            goal_id=goal_id
        )

        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in goal prediction endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recommendations/{goal_id}")
async def get_contribution_recommendations(
    goal_id: str,
    user_id: str = Query(..., description="User ID")
):
    """
    Get smart contribution recommendations

    Returns:
    - Conservative, moderate, and aggressive plans
    - Monthly, weekly, and daily contribution amounts
    - Estimated completion dates for each plan
    - Budget impact analysis
    - Recommended plan based on financial capacity
    """
    try:
        result = await goals_agent.recommend_contributions(
            user_id=user_id,
            goal_id=goal_id
        )

        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in recommendations endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/at-risk")
async def get_at_risk_goals(
    user_id: str = Query(..., description="User ID")
):
    """
    Identify goals that are at risk of not being achieved

    Returns list of at-risk goals with:
    - Risk level (critical, high, medium, low)
    - Specific risk factors
    - Current progress vs expected
    - Days remaining
    - Recommended actions
    """
    try:
        result = await goals_agent.detect_at_risk_goals(
            user_id=user_id
        )

        return {
            "atRiskGoals": result,
            "count": len(result),
            "summary": {
                "critical": len([g for g in result if g['riskLevel'] == 'critical']),
                "high": len([g for g in result if g['riskLevel'] == 'high']),
                "medium": len([g for g in result if g['riskLevel'] == 'medium'])
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in at-risk goals endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/optimization/{goal_id}")
async def get_goal_optimization_suggestions(
    goal_id: str,
    user_id: str = Query(..., description="User ID")
):
    """
    Get optimization suggestions for a specific goal

    Returns:
    - Optimal deadline adjustments
    - Realistic target amount suggestions
    - Contribution frequency recommendations
    - Impact analysis for each suggestion
    """
    try:
        result = await goals_agent.suggest_goal_optimization(
            user_id=user_id,
            goal_id=goal_id
        )

        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in optimization endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/dashboard")
async def get_goals_dashboard(
    user_id: str = Query(..., description="User ID")
):
    """
    Comprehensive goals dashboard with AI insights

    Aggregates:
    - All at-risk goals
    - Overall achievement probability
    - Total recommended monthly contributions
    - Key insights and recommendations
    """
    try:
        # Get at-risk goals
        at_risk = await goals_agent.detect_at_risk_goals(user_id=user_id)

        # Get all user goals for analysis
        goals = await goals_agent._get_user_goals(user_id=user_id)

        active_goals = [g for g in goals if g['status'] == 'ACTIVE']

        # Calculate aggregated metrics
        total_target = sum(float(g['targetAmount']) for g in active_goals)
        total_current = sum(float(g['currentAmount']) for g in active_goals)
        overall_progress = (total_current / total_target * 100) if total_target > 0 else 0

        # Generate insights
        insights = []

        if len(at_risk) > 0:
            insights.append({
                "type": "warning",
                "message": f"Você tem {len(at_risk)} meta(s) em risco",
                "priority": "high"
            })

        if len(active_goals) > 3:
            insights.append({
                "type": "recommendation",
                "message": "Muitas metas ativas. Considere focar nas mais importantes.",
                "priority": "medium"
            })

        return {
            "summary": {
                "totalGoals": len(goals),
                "activeGoals": len(active_goals),
                "completedGoals": len([g for g in goals if g['status'] == 'COMPLETED']),
                "atRiskCount": len(at_risk),
                "totalTarget": round(total_target, 2),
                "totalCurrent": round(total_current, 2),
                "overallProgress": round(overall_progress, 1)
            },
            "atRiskGoals": at_risk[:3],  # Top 3 at-risk
            "insights": insights,
            "timestamp": datetime.utcnow().isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in goals dashboard endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))
