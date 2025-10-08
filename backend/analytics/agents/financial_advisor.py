"""
Financial Advisor Agent - AI-Powered Financial Analysis

Uses LangChain + OpenAI to provide intelligent financial advice.
"""
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any
import pandas as pd
from sqlalchemy import text
from loguru import logger

from analytics.database.connection import get_db_connection


class FinancialAdvisorAgent:
    """
    AI-powered financial advisor

    Capabilities:
    - Analyze spending patterns
    - Generate personalized insights
    - Detect anomalies
    - Recommend savings opportunities
    """

    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        # Note: LangChain integration will be added later
        # For now, using rule-based analysis

    async def generate_insights(
        self,
        user_id: str,
        period_days: int = 30
    ) -> Dict[str, Any]:
        """
        Generate comprehensive financial insights for a user

        Returns personalized recommendations and warnings
        """
        try:
            # Fetch user transactions
            df = await self._get_user_transactions(user_id, period_days)

            if df.empty:
                return {
                    "timestamp": datetime.utcnow().isoformat(),
                    "insights": [],
                    "message": "Não há transações suficientes para análise."
                }

            insights = []

            # 1. Spending Trend Analysis
            trend_insight = self._analyze_spending_trend(df)
            if trend_insight:
                insights.append(trend_insight)

            # 2. Category Analysis
            category_insights = self._analyze_categories(df)
            insights.extend(category_insights)

            # 3. Budget Compliance
            budget_insight = self._check_budget_compliance(df)
            if budget_insight:
                insights.append(budget_insight)

            # 4. Savings Recommendations
            savings_insight = self._generate_savings_recommendations(df)
            if savings_insight:
                insights.append(savings_insight)

            return {
                "timestamp": datetime.utcnow().isoformat(),
                "period_days": period_days,
                "insights": insights,
                "summary": self._generate_summary(df)
            }

        except Exception as e:
            logger.error(f"Error generating insights: {e}")
            return {
                "timestamp": datetime.utcnow().isoformat(),
                "insights": [],
                "error": str(e)
            }

    async def find_savings_opportunities(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Identify opportunities to save money

        Uses ML to find:
        - Expensive subscriptions
        - Unnecessary recurring expenses
        - Category overspending
        """
        opportunities = []

        df = await self._get_user_transactions(user_id, 90)  # 3 months

        if df.empty:
            return opportunities

        # Find high recurring expenses
        recurring = self._find_recurring_expenses(df)

        for expense in recurring:
            if expense['average_amount'] > 50:  # High-value recurring
                opportunities.append({
                    "type": "expensive_subscription",
                    "category": expense['category'],
                    "monthly_cost": expense['average_amount'],
                    "estimated_savings": expense['average_amount'] * 0.3,  # Assume 30% savings
                    "priority": "high",
                    "recommendation": f"Revise assinatura em '{expense['category']}' - R$ {expense['average_amount']:.2f}/mês"
                })

        # Find categories with unusual high spending
        expense_df = df[df['type'] == 'EXPENSE']
        category_totals = expense_df.groupby('category_name')['amount'].sum().sort_values(ascending=False)

        for category, total in category_totals.head(3).items():
            avg_transaction = expense_df[expense_df['category_name'] == category]['amount'].mean()

            if avg_transaction > 100:
                opportunities.append({
                    "type": "high_category_spending",
                    "category": category,
                    "total_spent": float(total),
                    "average_transaction": float(avg_transaction),
                    "estimated_savings": float(total * 0.15),  # 15% reduction
                    "priority": "medium",
                    "recommendation": f"Reduza gastos em '{category}' para economizar ~R$ {total * 0.15:.2f}"
                })

        return opportunities[:5]  # Top 5 opportunities

    async def detect_anomalies(
        self,
        user_id: str,
        sensitivity: float = 2.0
    ) -> List[Dict[str, Any]]:
        """
        Detect unusual transactions using statistical analysis

        Uses Z-score to find outliers
        """
        anomalies = []

        df = await self._get_user_transactions(user_id, 60)

        if df.empty or len(df) < 10:
            return anomalies

        # Calculate Z-scores for each transaction
        expense_df = df[df['type'] == 'EXPENSE'].copy()

        for category in expense_df['category_name'].unique():
            category_df = expense_df[expense_df['category_name'] == category]

            if len(category_df) < 3:
                continue

            mean = category_df['amount'].mean()
            std = category_df['amount'].std()

            if std == 0:
                continue

            category_df['z_score'] = (category_df['amount'] - mean) / std

            # Find outliers
            outliers = category_df[abs(category_df['z_score']) > sensitivity]

            for _, row in outliers.iterrows():
                anomalies.append({
                    "transaction_id": row['id'],
                    "date": row['date'].isoformat() if pd.notna(row['date']) else None,
                    "category": row['category_name'],
                    "amount": float(row['amount']),
                    "expected_range": {
                        "min": float(mean - sensitivity * std),
                        "max": float(mean + sensitivity * std)
                    },
                    "severity": "high" if abs(row['z_score']) > 3 else "medium",
                    "description": f"Transação incomum: R$ {row['amount']:.2f} (média: R$ {mean:.2f})"
                })

        return anomalies

    # Private helper methods

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
                t."userId",
                t.description,
                t.amount,
                t.type,
                t.date,
                t.status,
                uc.name as category_name,
                uc.type as category_type
            FROM transactions t
            LEFT JOIN "userCategories" uc ON t."userCategoryId" = uc.id
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

        df['date'] = pd.to_datetime(df['date'])
        return df

    def _analyze_spending_trend(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analyze if spending is increasing or decreasing"""
        expense_df = df[df['type'] == 'EXPENSE'].copy()

        if expense_df.empty:
            return None

        # Compare first half vs second half of period
        mid_point = expense_df['date'].min() + (expense_df['date'].max() - expense_df['date'].min()) / 2

        first_half = expense_df[expense_df['date'] <= mid_point]['amount'].sum()
        second_half = expense_df[expense_df['date'] > mid_point]['amount'].sum()

        if second_half > first_half * 1.2:  # 20% increase
            return {
                "type": "spending_increase",
                "priority": "high",
                "trend": "increasing",
                "change_percent": ((second_half - first_half) / first_half * 100),
                "message": "Seus gastos aumentaram significativamente recentemente.",
                "recommendation": "Revise suas despesas e identifique áreas para reduzir."
            }

        return None

    def _analyze_categories(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Analyze spending by category"""
        insights = []

        expense_df = df[df['type'] == 'EXPENSE']
        category_totals = expense_df.groupby('category_name')['amount'].sum().sort_values(ascending=False)

        # Top spending category
        if not category_totals.empty:
            top_category = category_totals.index[0]
            top_amount = category_totals.iloc[0]

            insights.append({
                "type": "top_category",
                "priority": "medium",
                "category": top_category,
                "amount": float(top_amount),
                "percentage": (top_amount / expense_df['amount'].sum() * 100),
                "message": f"Maior gasto: {top_category} (R$ {top_amount:.2f})"
            })

        return insights

    def _check_budget_compliance(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Check if user is within budget (placeholder)"""
        # TODO: Integrate with budget data
        return None

    def _generate_savings_recommendations(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Generate savings recommendations"""
        expense_df = df[df['type'] == 'EXPENSE']
        income_df = df[df['type'] == 'INCOME']

        if income_df.empty:
            return None

        total_income = income_df['amount'].sum()
        total_expenses = expense_df['amount'].sum()
        savings_rate = ((total_income - total_expenses) / total_income * 100) if total_income > 0 else 0

        if savings_rate < 20:
            return {
                "type": "low_savings",
                "priority": "high",
                "current_rate": savings_rate,
                "target_rate": 20,
                "amount_to_save": (total_income * 0.2 - (total_income - total_expenses)),
                "message": f"Taxa de economia: {savings_rate:.1f}% (ideal: 20%)",
                "recommendation": "Estabeleça metas de economia automática para atingir 20% da renda."
            }

        return None

    def _generate_summary(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Generate overall summary"""
        return {
            "total_transactions": len(df),
            "total_income": float(df[df['type'] == 'INCOME']['amount'].sum()),
            "total_expenses": float(df[df['type'] == 'EXPENSE']['amount'].sum()),
            "categories_count": df['category_name'].nunique()
        }

    def _find_recurring_expenses(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Find recurring expenses"""
        recurring = []

        expense_df = df[df['type'] == 'EXPENSE'].copy()
        expense_df['amount_rounded'] = expense_df['amount'].round(0)

        for (category, amount), group in expense_df.groupby(['category_name', 'amount_rounded']):
            if len(group) >= 2:  # At least 2 occurrences
                recurring.append({
                    "category": category,
                    "average_amount": float(group['amount'].mean()),
                    "frequency": len(group)
                })

        return recurring
