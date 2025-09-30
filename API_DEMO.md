# 🚀 FinanceServer API Demo

## 📖 Demonstração Prática das Funcionalidades

Este documento demonstra o funcionamento completo das APIs implementadas no FinanceServer.

---

## 🔧 **Configuração Inicial**

### 1. Iniciar o Sistema
```bash
# Iniciar banco de dados e cache
docker-compose up -d postgres redis

# Iniciar backend
cd backend && npm run dev

# Em outro terminal - iniciar frontend
cd frontend && npm run dev
```

### 2. URLs de Acesso
- **Backend API:** http://localhost:3001
- **Frontend:** http://localhost:5173
- **Documentação Swagger:** http://localhost:3001/docs
- **Health Check:** http://localhost:3001/health
- **Health Check Avançado:** http://localhost:3001/health/detailed
- **Performance Metrics:** http://localhost:3001/health/metrics

---

## 🧪 **Testes das APIs**

### **🔐 1. Autenticação**

#### Registrar Usuário
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "email": "joao@teste.com",
    "password": "senha123456"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@teste.com",
    "password": "senha123456"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "...",
    "user": {
      "id": "clxxxxx",
      "name": "João Silva",
      "email": "joao@teste.com"
    }
  }
}
```

**🔑 Guardar o token para as próximas requisições!**

---

### **🏦 2. API de Contas (Accounts)**

#### Criar Conta
```bash
curl -X POST http://localhost:3001/api/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Conta Corrente Banco do Brasil",
    "type": "CHECKING",
    "balance": "5000.00",
    "currency": "BRL",
    "description": "Conta principal para movimentações"
  }'
```

#### Listar Contas
```bash
curl -X GET http://localhost:3001/api/accounts \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

#### Obter Resumo das Contas
```bash
curl -X GET http://localhost:3001/api/accounts/summary \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

### **🏷️ 3. API de Categorias (Categories)**

#### Listar Categorias (Sistema + Usuário)
```bash
curl -X GET http://localhost:3001/api/categories \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

#### Criar Categoria Personalizada
```bash
curl -X POST http://localhost:3001/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Freelances",
    "type": "INCOME",
    "description": "Renda de trabalhos freelance",
    "color": "#10B981",
    "icon": "💼"
  }'
```

#### Obter Estatísticas de Uso
```bash
curl -X GET "http://localhost:3001/api/categories/usage?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

### **💰 4. API de Transações (Transactions)**

#### Criar Transação de Receita
```bash
curl -X POST http://localhost:3001/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "description": "Salário Janeiro 2024",
    "amount": "5500.00",
    "type": "INCOME",
    "categoryId": "ID_DA_CATEGORIA",
    "accountId": "ID_DA_CONTA",
    "date": "2024-01-05"
  }'
```

#### Criar Transação de Despesa
```bash
curl -X POST http://localhost:3001/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "description": "Supermercado",
    "amount": "-350.00",
    "type": "EXPENSE",
    "categoryId": "ID_DA_CATEGORIA",
    "accountId": "ID_DA_CONTA",
    "date": "2024-01-06"
  }'
```

#### Obter Analytics de Transações
```bash
curl -X GET "http://localhost:3001/api/transactions/analytics?period=monthly&year=2024" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

### **🎯 5. API de Metas (Goals)**

#### Criar Meta Financeira
```bash
curl -X POST http://localhost:3001/api/goals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "title": "Viagem para Europa",
    "description": "Juntar dinheiro para viagem de 15 dias",
    "targetAmount": 15000.00,
    "currentAmount": 2000.00,
    "deadline": "2024-12-31",
    "category": "Viagem",
    "color": "#3B82F6"
  }'
```

#### Contribuir para Meta
```bash
curl -X POST http://localhost:3001/api/goals/ID_DA_META/contribute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "amount": 500.00
  }'
```

#### Obter Progresso Detalhado
```bash
curl -X GET http://localhost:3001/api/goals/ID_DA_META/progress \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

### **💵 6. API de Orçamentos (Budgets)**

#### Criar Orçamento Mensal
```bash
curl -X POST http://localhost:3001/api/budgets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Orçamento Alimentação Janeiro",
    "description": "Limite de gastos com alimentação",
    "amount": 800.00,
    "period": "MONTHLY",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "categoryId": "ID_CATEGORIA_ALIMENTACAO",
    "color": "#F59E0B"
  }'
```

#### Verificar Alertas do Orçamento
```bash
curl -X GET http://localhost:3001/api/budgets/ID_DO_ORCAMENTO/alerts \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

#### Obter Analytics de Orçamentos
```bash
curl -X GET "http://localhost:3001/api/budgets/analytics?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 📊 **Exemplos de Respostas**

### Resumo de Contas
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalAccounts": 3,
      "totalBalance": 12500.50,
      "activeAccounts": 3,
      "accountsByType": {
        "CHECKING": 1,
        "SAVINGS": 1,
        "INVESTMENT": 1
      }
    },
    "accounts": [...]
  }
}
```

### Progresso de Meta
```json
{
  "success": true,
  "data": {
    "goalId": "clxxxxx",
    "title": "Viagem para Europa",
    "financial": {
      "current": 2500.00,
      "target": 15000.00,
      "remaining": 12500.00,
      "percentage": 16.67,
      "isCompleted": false
    },
    "time": {
      "totalDays": 365,
      "daysPassed": 30,
      "daysRemaining": 335,
      "timePercentage": 8.22,
      "isOverdue": false
    },
    "recommendations": {
      "dailyTarget": 37.31,
      "onTrack": true
    }
  }
}
```

### Alertas de Orçamento
```json
{
  "success": true,
  "data": {
    "budgetId": "clxxxxx",
    "alerts": [
      {
        "type": "WARNING",
        "severity": "medium",
        "message": "Atenção: 90% do orçamento atingido",
        "details": "Restam apenas R$ 80,00 do seu orçamento"
      }
    ],
    "currentStatus": {
      "spent": 720.00,
      "budget": 800.00,
      "progress": 90.0,
      "daysRemaining": 5
    }
  }
}
```

---

## 🎨 **Frontend Services**

### Usando os Services no Frontend

```typescript
import {
  accountsService,
  categoriesService,
  goalsService,
  budgetsService
} from '@/services'

// Exemplo: Criar conta
const createAccount = async () => {
  try {
    const response = await accountsService.createAccount({
      name: "Conta Poupança",
      type: "SAVINGS",
      balance: "1000.00"
    })
    console.log("Conta criada:", response.data)
  } catch (error) {
    console.error("Erro:", error)
  }
}

// Exemplo: Listar metas
const loadGoals = async () => {
  try {
    const response = await goalsService.getGoals()
    console.log("Metas:", response.data.goals)
  } catch (error) {
    console.error("Erro:", error)
  }
}
```

---

## 📊 **8. API de Dashboard (Dashboard)**

#### Obter Visão Geral Financeira Completa
```bash
curl -X GET "http://localhost:3001/api/dashboard/overview?period=30" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

#### Obter Estatísticas Rápidas
```bash
curl -X GET http://localhost:3001/api/dashboard/quick-stats \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

#### Testar API Dashboard
```bash
curl -X GET http://localhost:3001/api/dashboard/test
```

**Resposta esperada (Overview):**
```json
{
  "success": true,
  "data": {
    "period": { "days": 30, "startDate": "...", "endDate": "..." },
    "financial": {
      "totalBalance": 12500.50,
      "totalIncome": 8500.00,
      "totalExpenses": 5200.30,
      "netIncome": 3299.70,
      "expenseTrend": { "percentage": -5.2, "direction": "DOWN" }
    },
    "analytics": {
      "topExpenseCategories": [...],
      "financialHealth": {
        "score": 78,
        "recommendations": [...]
      }
    }
  }
}
```

---

## 🔍 **9. Monitoramento e Health Checks**

#### Health Check Básico
```bash
curl -X GET http://localhost:3001/health
```

#### Health Check Detalhado
```bash
curl -X GET http://localhost:3001/health/detailed
```

#### Métricas de Performance
```bash
curl -X GET http://localhost:3001/health/metrics
```

#### Readiness Probe (Kubernetes)
```bash
curl -X GET http://localhost:3001/health/ready
```

#### Liveness Probe (Kubernetes)
```bash
curl -X GET http://localhost:3001/health/alive
```

---

## ✅ **Funcionalidades Implementadas e Testadas**

### Core Features
- ✅ **Autenticação JWT** completa com refresh tokens
- ✅ **CRUD de Contas** com validações e resumos
- ✅ **Categorias sistema + usuário** com estatísticas de uso
- ✅ **Transações** com analytics avançadas e filtros
- ✅ **Metas financeiras** com progresso e contribuições
- ✅ **Orçamentos** com alertas inteligentes e analytics
- ✅ **Dashboard** com visão geral e health scoring
- ✅ **Cache Redis** para performance otimizada
- ✅ **Validação de dados** em todos endpoints
- ✅ **Tratamento de erros** padronizado e estruturado

### Advanced Features
- ✅ **Rate Limiting Avançado** por tipo de operação
- ✅ **Logging Estruturado** com Winston e rotação de logs
- ✅ **Health Checks Avançados** para todos os serviços
- ✅ **Métricas de Performance** em tempo real
- ✅ **Auditoria completa** de operações financeiras
- ✅ **Sliding Window Rate Limiting** com Redis
- ✅ **Documentação Swagger** automática e completa
- ✅ **Frontend Services** para todas as APIs
- ✅ **Error Fingerprinting** para deduplicação
- ✅ **Graceful Shutdown** com cleanup de recursos

### Security & Monitoring
- ✅ **JWT com blacklist** no Redis
- ✅ **Rate limiting por IP, usuário e operação**
- ✅ **Logs de auditoria** para compliance
- ✅ **Monitoramento de saúde** do sistema
- ✅ **Métricas de performance** detalhadas
- ✅ **Detecção de anomalias** financeiras
- ✅ **Backup de logs** com rotação automática

---

## 🚀 **Sistema Enterprise-Ready!**

O FinanceServer está pronto para uso em produção com:

### 🏗️ Arquitetura
- **Clean Architecture** com Domain-Driven Design
- **Dependency Injection** com TypeDI
- **Repository Pattern** com Prisma ORM
- **Service Layer** bem definido
- **Middleware pipeline** configurável

### 🔒 Segurança
- **Rate Limiting** multi-camada
- **JWT Authentication** com refresh tokens
- **Input Validation** completa
- **SQL Injection** prevenção com Prisma
- **CORS** configurado corretamente

### 📊 Observabilidade
- **Structured Logging** com níveis
- **Health Checks** para todos serviços
- **Performance Metrics** detalhadas
- **Error Tracking** com fingerprints
- **Audit Trails** completos

### ⚡ Performance
- **Redis Caching** estratégico
- **Connection Pooling** otimizado
- **Query Optimization** com índices
- **Sliding Window** rate limiting
- **Graceful Degradation** em falhas

### 📱 Frontend Ready
- **TypeScript Services** completos
- **Type Safety** end-to-end
- **Error Handling** padronizado
- **API Consistency** garantida