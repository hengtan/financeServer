# 🚀 FinanceServer - Hybrid Backend (Node.js + Python)

## Arquitetura

```
Backend Híbrido (Railway - 1 Serviço)
│
├── Node.js/TypeScript (Porta 3001)
│   ├── API REST (CRUD)
│   │   ├── /api/auth
│   │   ├── /api/transactions
│   │   ├── /api/accounts
│   │   ├── /api/categories
│   │   ├── /api/goals
│   │   └── /api/budgets
│   │
│   └── Proxy para Python
│       └── /api/analytics/* → http://localhost:8000/analytics/*
│
└── Python/FastAPI (Porta 8000)
    ├── Analytics & Reports (High Performance)
    │   ├── /analytics/reports/financial-summary
    │   ├── /analytics/reports/spending-patterns
    │   └── /analytics/reports/category-analysis
    │
    └── AI Agents (Insights Inteligentes)
        ├── /analytics/insights (Recomendações personalizadas)
        ├── /analytics/insights/savings-opportunities
        └── /analytics/insights/anomalies
```

## 📦 Tecnologias

### Node.js Backend
- **Framework**: Fastify (high performance)
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Cache**: Redis
- **Auth**: JWT

### Python Analytics
- **Framework**: FastAPI
- **Data**: Pandas, NumPy
- **AI**: LangChain, OpenAI (opcional)
- **ML**: Scikit-learn
- **Database**: SQLAlchemy (mesma DB do Node.js)

## 🛠️ Setup Local

### 1. Instalar Dependências

```bash
# Backend Node.js
npm install

# Backend Python
pip install -r requirements.txt
```

### 2. Configurar Variáveis de Ambiente

```bash
# .env
DATABASE_URL=postgresql://user:password@localhost:5432/financedb
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-xxx  # Opcional - para AI insights
```

### 3. Rodar Localmente

**Opção 1: Desenvolvimento (ambos com hot-reload)**
```bash
npm run dev:hybrid
```

**Opção 2: Produção**
```bash
npm run build
npm run start:hybrid
```

**Opção 3: Separado (para debug)**
```bash
# Terminal 1 - Node.js
npm run dev

# Terminal 2 - Python
npm run dev:python
```

## 🌐 Deploy no Railway

### Configuração Automática

O Railway detecta automaticamente o `nixpacks.toml` e:
1. Instala Node.js + Python
2. Instala dependências: `npm install` + `pip install -r requirements.txt`
3. Roda build: `npx prisma generate && npm run build`
4. Inicia: `npm run start:hybrid`

### Variáveis de Ambiente no Railway

```
DATABASE_URL=<railway-postgres-url>
REDIS_URL=<railway-redis-url>
JWT_SECRET=<your-secret>
NODE_ENV=production
PYTHON_SERVICE_URL=http://localhost:8000
```

## 📊 Endpoints

### Node.js (TypeScript)
- `GET /health` - Health check
- `POST /api/auth/login` - Login
- `GET /api/transactions` - Listar transações
- `POST /api/transactions` - Criar transação

### Python (FastAPI)
- `GET /analytics/health` - Health check Python
- `GET /analytics/reports/financial-summary?user_id=xxx` - Relatório financeiro
- `GET /analytics/insights?user_id=xxx` - Insights com IA
- `GET /analytics/insights/savings-opportunities?user_id=xxx` - Oportunidades de economia
- `GET /analytics/insights/anomalies?user_id=xxx` - Detectar transações anômalas

### Via Proxy (transparente para frontend)
Frontend sempre chama: `https://api.mocktstudio.com.br/api/analytics/*`

Node.js faz proxy automaticamente para Python (porta 8000).

## 🧪 Testar Localmente

```bash
# 1. Health check Node.js
curl http://localhost:3001/health

# 2. Health check Python
curl http://localhost:8000/analytics/health

# 3. Relatório financeiro (via proxy)
curl "http://localhost:3001/api/analytics/reports/financial-summary?user_id=USER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Insights com IA
curl "http://localhost:3001/api/analytics/insights?user_id=USER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📁 Estrutura de Arquivos

```
backend/
├── src/                          # Node.js/TypeScript
│   ├── routes/fastify/
│   │   └── analytics-proxy.ts    # Proxy para Python
│   └── infrastructure/
│
├── analytics/                    # Python/FastAPI
│   ├── main.py                   # FastAPI app
│   ├── config.py                 # Configurações
│   ├── routers/
│   │   ├── health.py
│   │   ├── reports.py            # Relatórios
│   │   └── insights.py           # IA Insights
│   ├── services/
│   │   └── report_calculator.py  # Cálculos Pandas
│   ├── agents/
│   │   └── financial_advisor.py  # Agente de IA
│   └── database/
│       └── connection.py         # SQLAlchemy
│
├── requirements.txt              # Deps Python
├── nixpacks.toml                 # Railway config
├── start-hybrid.js               # Script de inicialização
└── package.json
```

## 🔥 Benefícios

### Performance
- **10-100x mais rápido** em analytics (Python/Pandas vs Node.js)
- Cálculos vetorizados com NumPy
- Processamento paralelo com Pandas

### IA & Machine Learning
- Agentes inteligentes com LangChain
- Detecção de anomalias com ML
- Insights personalizados com OpenAI
- Previsões financeiras com LSTM (futuro)

### Escalabilidade
- Serviços independentes podem escalar separadamente
- Python ideal para CPU-intensive tasks
- Node.js ideal para I/O-bound operations

### Custo Railway
- **1 único serviço** (sem custo adicional)
- Compartilha mesma database
- Zero mudanças no frontend

## 🚨 Troubleshooting

### Python não inicia
```bash
# Verificar instalação Python
python3 --version

# Verificar dependências
pip list | grep fastapi

# Rodar manualmente
cd backend
python3 -m uvicorn analytics.main:app --port 8000
```

### Proxy não funciona
Verificar se `PYTHON_SERVICE_URL` está configurado:
```bash
echo $PYTHON_SERVICE_URL  # Deve ser http://localhost:8000
```

### Railway build falha
Verificar logs do Railway e garantir que:
1. `requirements.txt` existe na raiz do `/backend`
2. `nixpacks.toml` está configurado corretamente
3. Python 3.11 está especificado

## 📚 Próximos Passos

1. ✅ Setup básico Python + Node.js
2. ✅ Proxy transparente
3. ✅ Migração de ReportService
4. ✅ Agente de insights financeiros
5. ⏳ Integração com OpenAI (opcional)
6. ⏳ ML para detecção de fraudes
7. ⏳ Previsões LSTM para orçamento

## 📖 Documentação

- **Node.js API**: http://localhost:3001/docs
- **Python API**: http://localhost:8000/analytics/docs
- **Railway Docs**: https://docs.railway.app/

---

**Desenvolvido com ❤️ usando Node.js + Python**
