"""
Report Analyzer Agent
Generates financial reports with AI-powered insights
"""
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
from loguru import logger
from analytics.ai import get_gpt_advisor
import pandas as pd
import numpy as np


class ReportAnalyzer:
    """Generates comprehensive financial reports with AI insights"""

    def __init__(self, db_manager):
        self.db = db_manager
        self.gpt = get_gpt_advisor()

    def generate_standard_report(
        self,
        user_id: str,
        report_type: str,
        period: str = "30d"
    ) -> Dict[str, Any]:
        """
        Generate a standard report

        Args:
            user_id: User ID
            report_type: Type of report (monthly, category, goals, cash_flow)
            period: Time period (7d, 30d, 90d, 1y)

        Returns:
            Report data with insights and charts
        """
        try:
            # Fetch data based on period
            days = self._parse_period(period)
            transactions = self._fetch_transactions(user_id, days)
            goals = self._fetch_goals(user_id)

            # Generate report based on type
            if report_type == "monthly":
                return self._generate_monthly_report(user_id, transactions, period)
            elif report_type == "category":
                return self._generate_category_report(user_id, transactions, period)
            elif report_type == "goals":
                return self._generate_goals_report(user_id, goals, transactions, period)
            elif report_type == "cash_flow":
                return self._generate_cash_flow_report(user_id, transactions, period)
            else:
                return {"error": "Invalid report type"}

        except Exception as e:
            logger.error(f"Error generating standard report: {e}")
            return {"error": str(e)}

    def generate_custom_report(
        self,
        user_id: str,
        query: str,
        period: str = "30d"
    ) -> Dict[str, Any]:
        """
        Generate a custom report based on natural language query

        Args:
            user_id: User ID
            query: Natural language query from user
            period: Time period

        Returns:
            Custom report with AI analysis
        """
        try:
            # Fetch all relevant data
            days = self._parse_period(period)
            transactions = self._fetch_transactions(user_id, days)
            goals = self._fetch_goals(user_id)

            # Use GPT to interpret the query and generate report
            report = self._analyze_custom_query(
                query, transactions, goals, period
            )

            return report

        except Exception as e:
            logger.error(f"Error generating custom report: {e}")
            return {"error": str(e)}

    def _generate_monthly_report(
        self,
        user_id: str,
        transactions: List[Dict],
        period: str
    ) -> Dict[str, Any]:
        """Generate monthly financial summary report"""

        df = pd.DataFrame(transactions)

        if df.empty:
            return {
                "type": "monthly",
                "period": period,
                "summary": {
                    "totalIncome": 0,
                    "totalExpenses": 0,
                    "netSavings": 0,
                    "savingsRate": 0
                },
                "monthlyData": [],
                "insights": ["Nenhuma transação encontrada no período."]
            }

        # Calculate monthly aggregations
        df['date'] = pd.to_datetime(df['date'])
        df['month'] = df['date'].dt.to_period('M')

        monthly = df.groupby(['month', 'type']).agg({
            'amount': 'sum'
        }).reset_index()

        # Pivot to get income and expenses
        monthly_pivot = monthly.pivot(
            index='month',
            columns='type',
            values='amount'
        ).fillna(0)

        monthly_data = []
        for month in monthly_pivot.index:
            income = monthly_pivot.loc[month, 'INCOME'] if 'INCOME' in monthly_pivot.columns else 0
            expenses = abs(monthly_pivot.loc[month, 'EXPENSE']) if 'EXPENSE' in monthly_pivot.columns else 0

            monthly_data.append({
                "month": str(month),
                "income": float(income),
                "expenses": float(expenses),
                "balance": float(income - expenses)
            })

        # Calculate summary
        total_income = df[df['type'] == 'INCOME']['amount'].sum()
        total_expenses = abs(df[df['type'] == 'EXPENSE']['amount'].sum())
        net_savings = total_income - total_expenses
        savings_rate = (net_savings / total_income * 100) if total_income > 0 else 0

        # Generate AI insights
        insights = self._generate_monthly_insights(
            total_income, total_expenses, net_savings, savings_rate, monthly_data
        )

        return {
            "type": "monthly",
            "period": period,
            "summary": {
                "totalIncome": float(total_income),
                "totalExpenses": float(total_expenses),
                "netSavings": float(net_savings),
                "savingsRate": float(savings_rate)
            },
            "monthlyData": monthly_data,
            "insights": insights,
            "timestamp": datetime.now().isoformat()
        }

    def _generate_category_report(
        self,
        user_id: str,
        transactions: List[Dict],
        period: str
    ) -> Dict[str, Any]:
        """Generate expenses by category report"""

        df = pd.DataFrame(transactions)

        if df.empty:
            return {
                "type": "category",
                "period": period,
                "categories": [],
                "insights": ["Nenhuma transação encontrada no período."]
            }

        # Filter only expenses
        expenses_df = df[df['type'] == 'EXPENSE'].copy()

        if expenses_df.empty:
            return {
                "type": "category",
                "period": period,
                "categories": [],
                "insights": ["Nenhuma despesa encontrada no período."]
            }

        # Group by category
        category_summary = expenses_df.groupby('category').agg({
            'amount': ['sum', 'count', 'mean']
        }).reset_index()

        category_summary.columns = ['category', 'total', 'count', 'average']
        category_summary['total'] = category_summary['total'].abs()
        category_summary['average'] = category_summary['average'].abs()
        category_summary = category_summary.sort_values('total', ascending=False)

        total_expenses = category_summary['total'].sum()

        categories = []
        for _, row in category_summary.iterrows():
            percentage = (row['total'] / total_expenses * 100) if total_expenses > 0 else 0
            categories.append({
                "name": row['category'],
                "total": float(row['total']),
                "count": int(row['count']),
                "average": float(row['average']),
                "percentage": float(percentage)
            })

        # Generate AI insights
        insights = self._generate_category_insights(categories, total_expenses)

        return {
            "type": "category",
            "period": period,
            "totalExpenses": float(total_expenses),
            "categories": categories,
            "insights": insights,
            "timestamp": datetime.now().isoformat()
        }

    def _generate_goals_report(
        self,
        user_id: str,
        goals: List[Dict],
        transactions: List[Dict],
        period: str
    ) -> Dict[str, Any]:
        """Generate goals progress report"""

        if not goals:
            return {
                "type": "goals",
                "period": period,
                "goals": [],
                "insights": ["Nenhuma meta cadastrada."]
            }

        goals_data = []
        for goal in goals:
            target = goal.get('targetAmount', 0)
            current = goal.get('currentAmount', 0)
            progress = (current / target * 100) if target > 0 else 0

            # Calculate time remaining
            target_date = goal.get('targetDate')
            days_remaining = None
            if target_date:
                if isinstance(target_date, str):
                    target_date = datetime.fromisoformat(target_date.replace('Z', '+00:00'))
                days_remaining = (target_date - datetime.now()).days

            goals_data.append({
                "name": goal.get('name', 'Meta'),
                "target": float(target),
                "current": float(current),
                "remaining": float(target - current),
                "progress": float(progress),
                "daysRemaining": days_remaining,
                "status": goal.get('status', 'ACTIVE')
            })

        # Generate AI insights
        insights = self._generate_goals_insights(goals_data, transactions)

        return {
            "type": "goals",
            "period": period,
            "totalGoals": len(goals_data),
            "goals": goals_data,
            "insights": insights,
            "timestamp": datetime.now().isoformat()
        }

    def _generate_cash_flow_report(
        self,
        user_id: str,
        transactions: List[Dict],
        period: str
    ) -> Dict[str, Any]:
        """Generate cash flow report (daily balance)"""

        df = pd.DataFrame(transactions)

        if df.empty:
            return {
                "type": "cash_flow",
                "period": period,
                "cashFlow": [],
                "insights": ["Nenhuma transação encontrada no período."]
            }

        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')

        # Calculate daily balance
        daily = df.groupby('date').agg({
            'amount': 'sum'
        }).reset_index()

        daily['balance'] = daily['amount'].cumsum()

        cash_flow_data = []
        for _, row in daily.iterrows():
            cash_flow_data.append({
                "date": row['date'].isoformat(),
                "amount": float(row['amount']),
                "balance": float(row['balance'])
            })

        # Calculate trend
        if len(daily) > 1:
            trend = "increasing" if daily['balance'].iloc[-1] > daily['balance'].iloc[0] else "decreasing"
        else:
            trend = "stable"

        # Generate AI insights
        insights = self._generate_cash_flow_insights(cash_flow_data, trend)

        return {
            "type": "cash_flow",
            "period": period,
            "trend": trend,
            "currentBalance": float(daily['balance'].iloc[-1]) if not daily.empty else 0,
            "cashFlow": cash_flow_data,
            "insights": insights,
            "timestamp": datetime.now().isoformat()
        }

    def _analyze_custom_query(
        self,
        query: str,
        transactions: List[Dict],
        goals: List[Dict],
        period: str
    ) -> Dict[str, Any]:
        """Use GPT to analyze custom query and generate report"""

        if not self.gpt.is_available():
            return {
                "error": "GPT não disponível. Configure OPENAI_API_KEY."
            }

        try:
            # Prepare data summary for GPT
            df = pd.DataFrame(transactions)

            data_summary = {
                "total_transactions": len(transactions),
                "total_goals": len(goals),
                "period": period
            }

            if not df.empty:
                total_income = df[df['type'] == 'INCOME']['amount'].sum()
                total_expenses = abs(df[df['type'] == 'EXPENSE']['amount'].sum())

                data_summary.update({
                    "total_income": float(total_income),
                    "total_expenses": float(total_expenses),
                    "balance": float(total_income - total_expenses)
                })

                # Category breakdown
                if 'category' in df.columns:
                    categories = df[df['type'] == 'EXPENSE'].groupby('category')['amount'].sum().abs()
                    data_summary["top_categories"] = {
                        cat: float(amt) for cat, amt in categories.nlargest(5).items()
                    }

            # Call GPT to analyze
            prompt = f"""
Você é um analista financeiro. O usuário pediu o seguinte relatório:

"{query}"

Dados financeiros disponíveis (período: {period}):
- Total de transações: {data_summary.get('total_transactions', 0)}
- Receitas: R$ {data_summary.get('total_income', 0):.2f}
- Despesas: R$ {data_summary.get('total_expenses', 0):.2f}
- Saldo: R$ {data_summary.get('balance', 0):.2f}
- Metas: {data_summary.get('total_goals', 0)}

Principais categorias de despesa:
{chr(10).join([f"- {cat}: R$ {amt:.2f}" for cat, amt in data_summary.get('top_categories', {}).items()])}

Gere um relatório respondendo à pergunta do usuário. Inclua:
1. Título do relatório
2. Análise dos dados (3-5 pontos)
3. Recomendações práticas (2-3 itens)

Seja específico, use os números fornecidos, e responda em português brasileiro.
"""

            response = self.gpt.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "Você é um analista financeiro experiente que gera relatórios claros e acionáveis."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=800,
                temperature=0.7
            )

            analysis = response.choices[0].message.content.strip()

            return {
                "type": "custom",
                "query": query,
                "period": period,
                "analysis": analysis,
                "dataSummary": data_summary,
                "timestamp": datetime.now().isoformat()
            }

        except Exception as e:
            logger.error(f"Error in custom analysis: {e}")
            return {"error": str(e)}

    def _generate_monthly_insights(
        self, income: float, expenses: float, savings: float, rate: float, monthly: List
    ) -> List[str]:
        """Generate insights for monthly report using GPT"""

        if not self.gpt.is_available():
            return [
                f"Receita total: R$ {income:.2f}",
                f"Despesas totais: R$ {expenses:.2f}",
                f"Taxa de poupança: {rate:.1f}%"
            ]

        try:
            prompt = f"""
Analise este resumo financeiro mensal e forneça 3-4 insights práticos:

Receita total: R$ {income:.2f}
Despesas totais: R$ {expenses:.2f}
Economia líquida: R$ {savings:.2f}
Taxa de poupança: {rate:.1f}%

Forneça insights curtos e diretos (máximo 1 linha cada).
"""
            response = self.gpt.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "Você é um consultor financeiro."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=200,
                temperature=0.7
            )

            text = response.choices[0].message.content.strip()
            insights = [line.strip('- ').strip() for line in text.split('\n') if line.strip()]
            return insights[:4]

        except Exception as e:
            logger.error(f"Error generating insights: {e}")
            return [f"Taxa de poupança: {rate:.1f}%"]

    def _generate_category_insights(
        self, categories: List[Dict], total: float
    ) -> List[str]:
        """Generate insights for category report"""

        if not categories:
            return ["Nenhuma despesa categorizada."]

        top_3 = categories[:3]
        insights = []

        for cat in top_3:
            insights.append(
                f"{cat['name']}: R$ {cat['total']:.2f} ({cat['percentage']:.1f}% do total)"
            )

        return insights

    def _generate_goals_insights(
        self, goals: List[Dict], transactions: List[Dict]
    ) -> List[str]:
        """Generate insights for goals report"""

        if not goals:
            return ["Nenhuma meta cadastrada."]

        completed = sum(1 for g in goals if g['progress'] >= 100)
        at_risk = sum(1 for g in goals if g['progress'] < 50 and g.get('daysRemaining', 365) < 60)

        insights = [
            f"Total de metas: {len(goals)}",
            f"Metas concluídas: {completed}"
        ]

        if at_risk > 0:
            insights.append(f"⚠️ {at_risk} metas em risco")

        return insights

    def _generate_cash_flow_insights(
        self, cash_flow: List[Dict], trend: str
    ) -> List[str]:
        """Generate insights for cash flow report"""

        if not cash_flow:
            return ["Sem dados de fluxo de caixa."]

        current = cash_flow[-1]['balance']

        insights = [
            f"Saldo atual: R$ {current:.2f}",
            f"Tendência: {trend}"
        ]

        return insights

    def _parse_period(self, period: str) -> int:
        """Parse period string to days"""
        if period.endswith('d'):
            return int(period[:-1])
        elif period.endswith('m'):
            return int(period[:-1]) * 30
        elif period.endswith('y'):
            return int(period[:-1]) * 365
        return 30

    def _fetch_transactions(self, user_id: str, days: int) -> List[Dict]:
        """Fetch transactions from database"""
        query = f"""
            SELECT
                t.id,
                t.amount,
                t.type,
                t.category,
                t.description,
                t.date,
                t.status
            FROM transactions t
            WHERE t."userId" = %(user_id)s
                AND t.date >= NOW() - INTERVAL '{days} days'
                AND t.status = 'COMPLETED'
            ORDER BY t.date DESC
        """

        result = self.db.execute_query(query, {"user_id": user_id})

        transactions = []
        for row in result:
            transactions.append({
                "id": row[0],
                "amount": float(row[1]),
                "type": row[2],
                "category": row[3],
                "description": row[4],
                "date": row[5].isoformat() if row[5] else None,
                "status": row[6]
            })

        return transactions

    def _fetch_goals(self, user_id: str) -> List[Dict]:
        """Fetch goals from database"""
        query = """
            SELECT id, name, "targetAmount", "currentAmount", "targetDate",
                   status, color, "userId", "createdAt"
            FROM goals
            WHERE "userId" = %(user_id)s
            ORDER BY "createdAt" DESC
        """

        result = self.db.execute_query(query, {"user_id": user_id})

        goals = []
        for row in result:
            goals.append({
                "id": row[0],
                "name": row[1],
                "targetAmount": float(row[2]),
                "currentAmount": float(row[3]),
                "targetDate": row[4].isoformat() if row[4] else None,
                "status": row[5],
                "color": row[6],
                "userId": row[7],
                "createdAt": row[8].isoformat() if row[8] else None
            })

        return goals
