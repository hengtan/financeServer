"""
GPT-4 Financial Advisor
Generates personalized insights using OpenAI's GPT-4
"""
import os
from typing import List, Dict, Any
from openai import OpenAI
from loguru import logger

class GPTAdvisor:
    """Uses GPT-4 to generate personalized financial insights"""

    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            logger.warning("OPENAI_API_KEY not set - GPT insights disabled")
            self.client = None
        else:
            self.client = OpenAI(api_key=api_key)

    def is_available(self) -> bool:
        """Check if GPT is available"""
        return self.client is not None

    def generate_goal_insights(
        self,
        goal_data: Dict[str, Any],
        transactions: List[Dict[str, Any]],
        financial_summary: Dict[str, Any]
    ) -> List[str]:
        """
        Generate personalized insights for a financial goal

        Args:
            goal_data: Goal information (title, target, current, deadline)
            transactions: Recent transactions list
            financial_summary: Income/expense summary

        Returns:
            List of personalized insight messages
        """
        if not self.is_available():
            return []

        try:
            # Prepare context for GPT
            prompt = self._build_goal_prompt(goal_data, transactions, financial_summary)

            # Call GPT-4
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",  # Using mini for cost efficiency
                messages=[
                    {
                        "role": "system",
                        "content": "Você é um consultor financeiro experiente que ajuda pessoas a atingir suas metas financeiras. Sempre responda em português brasileiro, seja direto e dê conselhos práticos e acionáveis."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                max_tokens=300,
                temperature=0.7
            )

            # Parse response into insights
            insights_text = response.choices[0].message.content.strip()
            insights = [line.strip('- ').strip() for line in insights_text.split('\n') if line.strip()]

            return insights[:3]  # Return top 3 insights

        except Exception as e:
            logger.error(f"Error generating GPT insights: {e}")
            return []

    def _build_goal_prompt(
        self,
        goal_data: Dict[str, Any],
        transactions: List[Dict[str, Any]],
        financial_summary: Dict[str, Any]
    ) -> str:
        """Build prompt for GPT"""

        goal_title = goal_data.get('title', 'Meta')
        target_amount = goal_data.get('targetAmount', 0)
        current_amount = goal_data.get('currentAmount', 0)
        deadline = goal_data.get('deadline', 'indefinido')
        progress_pct = (current_amount / target_amount * 100) if target_amount > 0 else 0

        monthly_income = financial_summary.get('monthly_income', 0)
        monthly_expenses = financial_summary.get('monthly_expenses', 0)
        available = monthly_income - monthly_expenses

        # Analyze spending patterns
        spending_categories = {}
        for tx in transactions[-30:]:  # Last 30 transactions
            if tx.get('type') == 'EXPENSE':
                category = tx.get('category', 'Outros')
                amount = abs(tx.get('amount', 0))
                spending_categories[category] = spending_categories.get(category, 0) + amount

        top_expenses = sorted(spending_categories.items(), key=lambda x: x[1], reverse=True)[:3]

        prompt = f"""
Analise esta meta financeira e forneça 2-3 insights práticos e personalizados:

**Meta**: {goal_title}
**Valor alvo**: R$ {target_amount:.2f}
**Valor atual**: R$ {current_amount:.2f}
**Progresso**: {progress_pct:.1f}%
**Prazo**: {deadline}

**Finanças mensais**:
- Renda: R$ {monthly_income:.2f}
- Despesas: R$ {monthly_expenses:.2f}
- Disponível: R$ {available:.2f}

**Maiores gastos recentes**:
{chr(10).join([f"- {cat}: R$ {amt:.2f}" for cat, amt in top_expenses])}

Forneça insights específicos sobre:
1. Como acelerar o progresso desta meta
2. Onde cortar gastos para economizar mais
3. Dicas práticas e realistas

Responda em formato de lista com insights curtos e diretos (máximo 2 linhas cada).
"""
        return prompt

    def generate_dashboard_insights(
        self,
        goals_summary: Dict[str, Any],
        transactions: List[Dict[str, Any]]
    ) -> List[str]:
        """Generate general financial insights for dashboard"""
        if not self.is_available():
            return []

        try:
            prompt = f"""
Analise este resumo financeiro e forneça 2-3 insights estratégicos:

**Metas**:
- Total de metas: {goals_summary.get('total', 0)}
- Metas ativas: {goals_summary.get('active', 0)}
- Metas concluídas: {goals_summary.get('completed', 0)}
- Progresso geral: {goals_summary.get('overall_progress', 0):.1f}%

**Últimas {len(transactions)} transações analisadas**

Forneça insights sobre:
1. Priorização de metas
2. Padrões de gastos
3. Sugestões de otimização

Seja específico e acionável. Máximo 2 linhas por insight.
"""

            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "Você é um consultor financeiro que dá conselhos diretos e práticos em português brasileiro."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=200,
                temperature=0.7
            )

            insights_text = response.choices[0].message.content.strip()
            insights = [line.strip('- ').strip() for line in insights_text.split('\n') if line.strip()]

            return insights[:3]

        except Exception as e:
            logger.error(f"Error generating dashboard insights: {e}")
            return []


# Singleton instance
_gpt_advisor = None

def get_gpt_advisor() -> GPTAdvisor:
    """Get or create GPT advisor instance"""
    global _gpt_advisor
    if _gpt_advisor is None:
        _gpt_advisor = GPTAdvisor()
    return _gpt_advisor
