"""
Goals Advisor Agent - AI-Powered Goal Management & Predictions

Provides intelligent insights for financial goals:
- Achievement probability prediction
- Smart contribution recommendations
- Risk detection for goals at risk
- Optimal timeline and target suggestions
"""
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import pandas as pd
from sqlalchemy import text
from loguru import logger

from analytics.database.connection import get_db_connection
from analytics.ai import get_gpt_advisor


class GoalsAdvisorAgent:
    """
    AI-powered goals advisor

    Capabilities:
    - Predict goal achievement probability
    - Recommend optimal contribution amounts
    - Detect at-risk goals
    - Suggest goal adjustments based on financial capacity
    - Generate personalized motivation messages
    """

    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        # Future: LangChain integration for natural language recommendations

    async def predict_goal_achievement(
        self,
        user_id: str,
        goal_id: str
    ) -> Dict[str, Any]:
        """
        Predict if and when a goal will be achieved

        Uses:
        - Historical contribution patterns
        - Current progress rate
        - Income vs expenses analysis
        - Statistical forecasting
        """
        try:
            goal = await self._get_goal(goal_id)

            if not goal or goal['userId'] != user_id:
                return {"error": "Goal not found"}

            # Get user's financial data
            transactions_df = await self._get_user_transactions(user_id, 90)

            # Calculate financial capacity
            monthly_income = self._calculate_monthly_income(transactions_df)
            monthly_expenses = self._calculate_monthly_expenses(transactions_df)
            available_monthly = monthly_income - monthly_expenses

            # Calculate goal metrics
            target_amount = float(goal['targetAmount'])
            current_amount = float(goal['currentAmount'])
            remaining = target_amount - current_amount

            # Calculate deadline
            deadline = goal.get('targetDate')
            if deadline:
                deadline_date = pd.to_datetime(deadline)
                days_remaining = (deadline_date - pd.Timestamp.now()).days
                months_remaining = max(1, days_remaining / 30)
            else:
                # No deadline - estimate based on 10% monthly savings
                months_remaining = remaining / (available_monthly * 0.1) if available_monthly > 0 else 999
                days_remaining = int(months_remaining * 30)

            # Calculate required monthly contribution
            required_monthly = remaining / months_remaining if months_remaining > 0 else remaining

            # Calculate probability based on financial capacity
            if available_monthly <= 0:
                probability = 0
                risk_level = "critical"
            elif required_monthly > available_monthly * 0.5:  # Requires >50% of available money
                probability = 20
                risk_level = "high"
            elif required_monthly > available_monthly * 0.3:  # Requires 30-50%
                probability = 60
                risk_level = "medium"
            elif required_monthly > available_monthly * 0.1:  # Requires 10-30%
                probability = 85
                risk_level = "low"
            else:  # Requires <10%
                probability = 95
                risk_level = "very_low"

            # Calculate projected completion date
            if available_monthly > 0:
                safe_monthly_contribution = available_monthly * 0.2  # Conservative 20%
                projected_months = remaining / safe_monthly_contribution if safe_monthly_contribution > 0 else 999
                projected_date = datetime.now() + timedelta(days=int(projected_months * 30))
            else:
                projected_date = None

            # Generate insights
            insights = []

            if probability < 50:
                insights.append({
                    "type": "warning",
                    "message": "Meta em risco! Ajustes necessários para alcançar o objetivo.",
                    "priority": "high"
                })

            if required_monthly > available_monthly * 0.3:
                insights.append({
                    "type": "recommendation",
                    "message": f"Considere estender o prazo ou reduzir o valor alvo.",
                    "priority": "medium"
                })

            if deadline and days_remaining < 30 and remaining > available_monthly:
                insights.append({
                    "type": "urgent",
                    "message": "Prazo muito próximo! Improvável de alcançar sem contribuição extra.",
                    "priority": "critical"
                })

            # Add GPT-4 personalized insights
            try:
                gpt = get_gpt_advisor()
                if gpt.is_available():
                    goal_data = {
                        'title': goal.get('title', 'Meta'),
                        'targetAmount': target_amount,
                        'currentAmount': current_amount,
                        'deadline': deadline.isoformat() if deadline else None
                    }
                    financial_summary = {
                        'monthly_income': monthly_income,
                        'monthly_expenses': monthly_expenses
                    }
                    gpt_insights = gpt.generate_goal_insights(
                        goal_data,
                        transactions_data,
                        financial_summary
                    )
                    for gpt_insight in gpt_insights:
                        insights.append({
                            "type": "gpt",
                            "message": gpt_insight,
                            "priority": "medium"
                        })
            except Exception as e:
                logger.error(f"Error generating GPT insights: {e}")

            return {
                "goalId": goal_id,
                "prediction": {
                    "probability": round(probability, 1),
                    "riskLevel": risk_level,
                    "projectedCompletionDate": projected_date.isoformat() if projected_date else None,
                    "onTrack": probability >= 70
                },
                "financial": {
                    "remaining": remaining,
                    "requiredMonthly": round(required_monthly, 2),
                    "availableMonthly": round(available_monthly, 2),
                    "recommendedMonthly": round(min(required_monthly, available_monthly * 0.3), 2),
                    "monthsRemaining": round(months_remaining, 1)
                },
                "insights": insights,
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Error predicting goal achievement: {e}")
            return {"error": str(e)}

    async def recommend_contributions(
        self,
        user_id: str,
        goal_id: str
    ) -> Dict[str, Any]:
        """
        Recommend optimal contribution amounts

        Provides:
        - Conservative, moderate, and aggressive plans
        - Weekly and monthly recommendations
        - Impact analysis for each plan
        """
        try:
            goal = await self._get_goal(goal_id)

            if not goal or goal['userId'] != user_id:
                return {"error": "Goal not found"}

            transactions_df = await self._get_user_transactions(user_id, 90)

            monthly_income = self._calculate_monthly_income(transactions_df)
            monthly_expenses = self._calculate_monthly_expenses(transactions_df)
            available_monthly = monthly_income - monthly_expenses

            target_amount = float(goal['targetAmount'])
            current_amount = float(goal['currentAmount'])
            remaining = target_amount - current_amount

            deadline = goal.get('targetDate')
            if deadline:
                deadline_date = pd.to_datetime(deadline)
                months_remaining = max(1, (deadline_date - pd.Timestamp.now()).days / 30)
            else:
                months_remaining = 12  # Default to 1 year

            # Calculate three contribution plans
            plans = []

            # Conservative: 10% of available income
            conservative = available_monthly * 0.10
            conservative_months = remaining / conservative if conservative > 0 else 999
            plans.append({
                "name": "Conservador",
                "type": "conservative",
                "monthly": round(conservative, 2),
                "weekly": round(conservative / 4, 2),
                "daily": round(conservative / 30, 2),
                "completionMonths": round(conservative_months, 1),
                "completionDate": (datetime.now() + timedelta(days=int(conservative_months * 30))).isoformat(),
                "impactOnBudget": "10%",
                "description": "Contribuição segura sem comprometer seu orçamento"
            })

            # Moderate: 20% of available income
            moderate = available_monthly * 0.20
            moderate_months = remaining / moderate if moderate > 0 else 999
            plans.append({
                "name": "Moderado",
                "type": "moderate",
                "monthly": round(moderate, 2),
                "weekly": round(moderate / 4, 2),
                "daily": round(moderate / 30, 2),
                "completionMonths": round(moderate_months, 1),
                "completionDate": (datetime.now() + timedelta(days=int(moderate_months * 30))).isoformat(),
                "impactOnBudget": "20%",
                "description": "Equilíbrio entre progresso e conforto financeiro"
            })

            # Aggressive: Required monthly or 35% of available
            required_monthly = remaining / months_remaining if months_remaining > 0 else remaining
            aggressive = min(required_monthly, available_monthly * 0.35)
            aggressive_months = remaining / aggressive if aggressive > 0 else 999
            plans.append({
                "name": "Agressivo",
                "type": "aggressive",
                "monthly": round(aggressive, 2),
                "weekly": round(aggressive / 4, 2),
                "daily": round(aggressive / 30, 2),
                "completionMonths": round(aggressive_months, 1),
                "completionDate": (datetime.now() + timedelta(days=int(aggressive_months * 30))).isoformat(),
                "impactOnBudget": f"{round((aggressive/available_monthly)*100, 1) if available_monthly > 0 else 0}%",
                "description": "Máximo progresso possível dentro da sua capacidade"
            })

            # Recommend the best plan
            recommended_plan = "moderate"
            if required_monthly <= available_monthly * 0.10:
                recommended_plan = "conservative"
            elif required_monthly > available_monthly * 0.30:
                recommended_plan = "aggressive"

            return {
                "goalId": goal_id,
                "plans": plans,
                "recommended": recommended_plan,
                "context": {
                    "monthlyIncome": round(monthly_income, 2),
                    "monthlyExpenses": round(monthly_expenses, 2),
                    "available": round(available_monthly, 2),
                    "remaining": round(remaining, 2),
                    "monthsToDeadline": round(months_remaining, 1)
                },
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Error recommending contributions: {e}")
            return {"error": str(e)}

    async def detect_at_risk_goals(
        self,
        user_id: str
    ) -> List[Dict[str, Any]]:
        """
        Identify goals that are unlikely to be achieved

        Risk factors:
        - Insufficient financial capacity
        - Approaching deadline with low progress
        - Negative savings trend
        - Multiple competing goals
        """
        try:
            goals = await self._get_user_goals(user_id)
            transactions_df = await self._get_user_transactions(user_id, 90)

            if not goals:
                return []

            monthly_income = self._calculate_monthly_income(transactions_df)
            monthly_expenses = self._calculate_monthly_expenses(transactions_df)
            available_monthly = monthly_income - monthly_expenses

            at_risk = []

            for goal in goals:
                if goal['status'] != 'ACTIVE':
                    continue

                target_amount = float(goal['targetAmount'])
                current_amount = float(goal['currentAmount'])
                remaining = target_amount - current_amount

                # Check if goal has deadline
                deadline = goal.get('targetDate')
                if not deadline:
                    continue

                deadline_date = pd.to_datetime(deadline)
                days_remaining = (deadline_date - pd.Timestamp.now()).days

                if days_remaining <= 0:
                    # Already overdue
                    at_risk.append({
                        "goalId": goal['id'],
                        "name": goal['name'],
                        "riskLevel": "critical",
                        "reason": "Prazo expirado",
                        "daysOverdue": abs(days_remaining),
                        "recommendation": "Estenda o prazo ou reduza o valor alvo"
                    })
                    continue

                months_remaining = max(1, days_remaining / 30)
                required_monthly = remaining / months_remaining

                # Calculate risk level
                risk_reasons = []
                risk_level = "low"

                if required_monthly > available_monthly * 0.5:
                    risk_reasons.append(f"Requer {round((required_monthly/available_monthly)*100, 0)}% do seu saldo mensal")
                    risk_level = "high"
                elif required_monthly > available_monthly * 0.3:
                    risk_reasons.append(f"Requer {round((required_monthly/available_monthly)*100, 0)}% do seu saldo mensal")
                    risk_level = "medium"

                if days_remaining < 30:
                    risk_reasons.append(f"Apenas {days_remaining} dias restantes")
                    risk_level = "high"

                progress = (current_amount / target_amount * 100) if target_amount > 0 else 0
                time_progress = ((goal.get('createdAt', datetime.now()) - pd.Timestamp.now()).days /
                                (deadline_date - pd.Timestamp(goal.get('createdAt', datetime.now()))).days * 100) if deadline else 0

                if progress < time_progress - 20:  # More than 20% behind schedule
                    risk_reasons.append(f"Progresso ({round(progress, 0)}%) abaixo do esperado")
                    if risk_level == "low":
                        risk_level = "medium"

                if risk_reasons:
                    at_risk.append({
                        "goalId": goal['id'],
                        "name": goal['name'],
                        "riskLevel": risk_level,
                        "reasons": risk_reasons,
                        "progress": round(progress, 1),
                        "daysRemaining": days_remaining,
                        "requiredMonthly": round(required_monthly, 2),
                        "recommendation": self._generate_risk_recommendation(
                            risk_level,
                            required_monthly,
                            available_monthly
                        )
                    })

            return sorted(at_risk, key=lambda x: {"critical": 0, "high": 1, "medium": 2, "low": 3}[x['riskLevel']])

        except Exception as e:
            logger.error(f"Error detecting at-risk goals: {e}")
            return []

    async def suggest_goal_optimization(
        self,
        user_id: str,
        goal_id: str
    ) -> Dict[str, Any]:
        """
        Suggest optimizations for a specific goal

        Provides:
        - Optimal deadline adjustment
        - Realistic target amount
        - Contribution frequency recommendations
        """
        try:
            goal = await self._get_goal(goal_id)

            if not goal or goal['userId'] != user_id:
                return {"error": "Goal not found"}

            transactions_df = await self._get_user_transactions(user_id, 90)

            monthly_income = self._calculate_monthly_income(transactions_df)
            monthly_expenses = self._calculate_monthly_expenses(transactions_df)
            available_monthly = monthly_income - monthly_expenses

            target_amount = float(goal['targetAmount'])
            current_amount = float(goal['currentAmount'])
            remaining = target_amount - current_amount

            suggestions = []

            # Optimal monthly contribution (20% of available)
            optimal_monthly = available_monthly * 0.20
            optimal_months = remaining / optimal_monthly if optimal_monthly > 0 else 999
            optimal_deadline = datetime.now() + timedelta(days=int(optimal_months * 30))

            current_deadline = pd.to_datetime(goal.get('targetDate')) if goal.get('targetDate') else None

            # Deadline too aggressive?
            if current_deadline and optimal_deadline > current_deadline:
                suggestions.append({
                    "type": "deadline_extension",
                    "current": current_deadline.isoformat(),
                    "suggested": optimal_deadline.isoformat(),
                    "reason": "Prazo atual muito agressivo para sua capacidade financeira",
                    "impact": f"Reduz contribuição mensal necessária para R$ {optimal_monthly:.2f}"
                })

            # Deadline too conservative?
            if current_deadline and optimal_deadline < current_deadline:
                early_deadline = optimal_deadline
                suggestions.append({
                    "type": "deadline_acceleration",
                    "current": current_deadline.isoformat(),
                    "suggested": early_deadline.isoformat(),
                    "reason": "Você pode alcançar esta meta mais cedo",
                    "impact": f"Conclui {round((current_deadline - early_deadline).days / 30, 1)} meses antes"
                })

            # Target amount optimization
            comfortable_target = current_amount + (optimal_monthly * 12)  # 1 year
            if comfortable_target > target_amount * 1.2:
                suggestions.append({
                    "type": "target_increase",
                    "current": target_amount,
                    "suggested": round(comfortable_target, 2),
                    "reason": "Você tem capacidade para uma meta mais ambiciosa",
                    "impact": f"Aumenta meta em R$ {comfortable_target - target_amount:.2f}"
                })

            return {
                "goalId": goal_id,
                "suggestions": suggestions,
                "optimal": {
                    "monthlyContribution": round(optimal_monthly, 2),
                    "deadline": optimal_deadline.isoformat(),
                    "timeframe": f"{round(optimal_months, 1)} meses"
                },
                "timestamp": datetime.utcnow().isoformat()
            }

        except Exception as e:
            logger.error(f"Error suggesting optimization: {e}")
            return {"error": str(e)}

    # Private helper methods

    async def _get_goal(self, goal_id: str) -> Optional[Dict[str, Any]]:
        """Fetch single goal from database"""
        engine = get_db_connection()

        query = text("""
            SELECT id, name, "targetAmount", "currentAmount", "targetDate",
                   status, color, "userId", "createdAt"
            FROM goals
            WHERE id = :goal_id
        """)

        with engine.connect() as conn:
            result = conn.execute(query, {"goal_id": goal_id}).fetchone()

            if result:
                return {
                    "id": result[0],
                    "name": result[1],
                    "targetAmount": result[2],
                    "currentAmount": result[3],
                    "targetDate": result[4],
                    "status": result[5],
                    "color": result[6],
                    "userId": result[7],
                    "createdAt": result[8]
                }
            return None

    async def _get_user_goals(self, user_id: str) -> List[Dict[str, Any]]:
        """Fetch all goals for a user"""
        engine = get_db_connection()

        query = text("""
            SELECT id, name, "targetAmount", "currentAmount", "targetDate",
                   status, color, "userId", "createdAt"
            FROM goals
            WHERE "userId" = :user_id
            ORDER BY "createdAt" DESC
        """)

        with engine.connect() as conn:
            results = conn.execute(query, {"user_id": user_id}).fetchall()

            return [{
                "id": r[0],
                "name": r[1],
                "targetAmount": r[2],
                "currentAmount": r[3],
                "targetDate": r[4],
                "status": r[5],
                "color": r[6],
                "userId": r[7],
                "createdAt": r[8]
            } for r in results]

    async def _get_user_transactions(
        self,
        user_id: str,
        period_days: int
    ) -> pd.DataFrame:
        """Fetch user transactions from database"""
        engine = get_db_connection()

        query = text("""
            SELECT
                t.id,
                t.amount,
                t.type,
                t.date,
                t.status
            FROM transactions t
            WHERE t."userId" = :user_id
                AND t.date >= NOW() - INTERVAL ':days days'
                AND t.status = 'COMPLETED'
            ORDER BY t.date DESC
        """)

        with engine.connect() as conn:
            df = pd.read_sql(query, conn, params={
                "user_id": user_id,
                "days": period_days
            })

        if not df.empty:
            df['date'] = pd.to_datetime(df['date'])

        return df

    def _calculate_monthly_income(self, df: pd.DataFrame) -> float:
        """Calculate average monthly income"""
        if df.empty:
            return 0.0

        income_df = df[df['type'] == 'INCOME']

        if income_df.empty:
            return 0.0

        # Calculate average monthly income over the period
        months = (df['date'].max() - df['date'].min()).days / 30
        months = max(1, months)

        return float(income_df['amount'].sum() / months)

    def _calculate_monthly_expenses(self, df: pd.DataFrame) -> float:
        """Calculate average monthly expenses"""
        if df.empty:
            return 0.0

        expense_df = df[df['type'] == 'EXPENSE']

        if expense_df.empty:
            return 0.0

        months = (df['date'].max() - df['date'].min()).days / 30
        months = max(1, months)

        return float(expense_df['amount'].sum() / months)

    def _generate_risk_recommendation(
        self,
        risk_level: str,
        required_monthly: float,
        available_monthly: float
    ) -> str:
        """Generate contextual recommendation based on risk"""
        if risk_level == "critical":
            return "Ação urgente: Estenda o prazo ou reduza o valor alvo"
        elif risk_level == "high":
            return f"Considere estender o prazo ou aumentar a renda em R$ {(required_monthly - available_monthly * 0.3):.2f}/mês"
        elif risk_level == "medium":
            return "Aumente suas contribuições mensais ou ajuste o prazo"
        else:
            return "Continue com as contribuições regulares"
