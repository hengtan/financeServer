# Deploy no Render - FinanceServer

## 🚀 Guia Completo de Deploy

### 1️⃣ Pré-requisitos
- Conta no [Render](https://render.com) (grátis)
- Repositório Git (GitHub/GitLab/Bitbucket)
- Domínio `mocktstudio.com` configurado

---

## 📋 Passo a Passo

### **Opção A: Deploy Automático com Blueprint (Recomendado)**

1. **Faça commit do arquivo `render.yaml`**
   ```bash
   git add render.yaml RENDER_DEPLOY.md
   git commit -m "feat: add Render deployment configuration"
   git push
   ```

2. **No Render Dashboard:**
   - Acesse: https://dashboard.render.com/blueprints
   - Clique em **"New Blueprint Instance"**
   - Conecte seu repositório Git
   - Selecione o repositório `financeServer`
   - Render detectará automaticamente o `render.yaml`
   - Clique em **"Apply"**

3. **Configure as variáveis que precisam ser definidas manualmente:**

   Após o deploy inicial, você precisa atualizar estas variáveis:

   **Backend (`finance-backend`):**
   - `CORS_ORIGIN`: Adicione a URL do seu frontend
     ```
     https://finance-frontend.onrender.com,https://finance.mocktstudio.com
     ```

   **Frontend (`finance-frontend`):**
   - `VITE_API_BASE_URL`: URL do backend
     ```
     https://finance-backend.onrender.com
     ```

4. **Aguarde o deploy completar** (5-10 minutos)

---

### **Opção B: Deploy Manual**

#### **A. Deploy do Backend**

1. No Dashboard do Render, clique em **"New +"** → **"Web Service"**

2. Conecte seu repositório

3. Configure:
   - **Name:** `finance-backend`
   - **Region:** Oregon (ou mais próximo de você)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:**
     ```bash
     npm install && npm run build && npx prisma generate
     ```
   - **Start Command:**
     ```bash
     npx prisma migrate deploy && npm start
     ```

4. Adicione variáveis de ambiente (ver seção abaixo)

5. Clique em **"Create Web Service"**

#### **B. Deploy do Frontend**

1. Clique em **"New +"** → **"Static Site"**

2. Conecte o mesmo repositório

3. Configure:
   - **Name:** `finance-frontend`
   - **Branch:** `main`
   - **Root Directory:** `frontend`
   - **Build Command:**
     ```bash
     npm install && npm run build
     ```
   - **Publish Directory:** `dist`

4. Adicione variáveis de ambiente:
   ```
   VITE_API_BASE_URL=https://finance-backend.onrender.com
   VITE_USE_REAL_API=true
   VITE_APP_ENV=production
   ```

5. Clique em **"Create Static Site"**

#### **C. Criar PostgreSQL Database**

1. Clique em **"New +"** → **"PostgreSQL"**

2. Configure:
   - **Name:** `finance-postgres`
   - **Database:** `financeserver`
   - **Region:** Oregon (mesma do backend)
   - **Plan:** Free (90 dias grátis)

3. Após criar, copie a **Internal Database URL**

4. Volte no **Backend Service** → **Environment** → Adicione:
   ```
   DATABASE_URL=postgresql://[cole-aqui-a-url-interna]
   ```

#### **D. Criar Redis**

1. Clique em **"New +"** → **Redis**

2. Configure:
   - **Name:** `finance-redis`
   - **Region:** Oregon
   - **Plan:** Free
   - **Maxmemory Policy:** `allkeys-lru`

3. Após criar, copie o **Host** e **Port**

4. Volte no **Backend Service** → **Environment** → Adicione:
   ```
   REDIS_HOST=[host-do-redis]
   REDIS_PORT=[porta-do-redis]
   REDIS_PASSWORD=
   ```

---

## 🔐 Variáveis de Ambiente Obrigatórias

### Backend (`finance-backend`)

```env
# Server
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://[gerado-automaticamente-pelo-render]

# Redis
REDIS_HOST=[host-do-redis-interno]
REDIS_PORT=[porta-do-redis]
REDIS_PASSWORD=
REDIS_DB=0

# Security (GERE VALORES SEGUROS!)
JWT_SECRET=[gerar-string-aleatoria-de-64-caracteres]
JWT_REFRESH_SECRET=[gerar-outra-string-aleatoria-de-64-caracteres]

# CORS (adicionar após deploy do frontend)
CORS_ORIGIN=https://finance-frontend.onrender.com,https://finance.mocktstudio.com

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000

# Features
SWAGGER_ENABLED=true
ENABLE_RATE_LIMITING=true
ENABLE_AUDIT_LOG=true
```

### Frontend (`finance-frontend`)

```env
# API URL (atualizar após deploy do backend)
VITE_API_BASE_URL=https://finance-backend.onrender.com

# Features
VITE_USE_REAL_API=true
VITE_ENABLE_OFFLINE_MODE=false
VITE_ENABLE_CACHING=true
VITE_APP_ENV=production
VITE_APP_NAME=FinanceServer
VITE_APP_VERSION=1.0.0
```

---

## 🌐 Configurar Domínio Personalizado

### No Render (Frontend)

1. Vá em **finance-frontend** → **Settings** → **Custom Domains**
2. Clique em **"Add Custom Domain"**
3. Digite: `finance.mocktstudio.com`
4. Render mostrará instruções de DNS

### No seu provedor de domínio (GoDaddy, Namecheap, etc)

1. Acesse as configurações de DNS de `mocktstudio.com`
2. Adicione um registro **CNAME**:
   ```
   Nome/Host: finance
   Tipo: CNAME
   Valor: finance-frontend.onrender.com
   TTL: 3600 (ou automático)
   ```
3. Salve as alterações
4. Aguarde propagação DNS (5min - 48h, geralmente < 1h)

### Verificação

Após a propagação, acesse:
- ✅ `https://finance.mocktstudio.com` → Frontend
- ✅ `https://finance-backend.onrender.com` → Backend API

---

## 🔧 Comandos Úteis

### Gerar Secrets Seguros (JWT)

```bash
# No terminal local
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Verificar Status dos Serviços

```bash
# Health check do backend
curl https://finance-backend.onrender.com/health

# Detailed health
curl https://finance-backend.onrender.com/health/detailed
```

### Logs

- Acesse cada serviço no Dashboard do Render
- Clique na aba **"Logs"**
- Logs em tempo real de build e runtime

---

## ⚠️ Limitações do Tier Gratuito

### Backend (Web Service Free)
- ❌ **Dorme após 15 minutos de inatividade**
- ⏱️ ~30-60s para "acordar" na primeira requisição
- ✅ 750 horas/mês grátis
- ✅ SSL automático

### PostgreSQL Free
- ⏰ **Expira após 90 dias** (depois $7/mês)
- 💾 1 GB de storage
- ✅ Backups automáticos

### Redis Free
- ✅ 25 MB de memória
- ✅ Sem expiração

### Static Site (Frontend)
- ✅ **100% gratuito para sempre**
- ✅ 100 GB bandwidth/mês
- ✅ CDN global
- ✅ SSL automático

---

## 🐛 Troubleshooting

### Backend não inicia

1. Verifique os logs no Dashboard
2. Confirme que `DATABASE_URL` está correta
3. Verifique se as migrations rodaram:
   ```bash
   npx prisma migrate deploy
   ```

### Frontend não carrega dados

1. Verifique se `VITE_API_BASE_URL` está correto
2. Verifique CORS no backend (`CORS_ORIGIN`)
3. Abra DevTools (F12) → Console para ver erros

### Database connection failed

1. Verifique se PostgreSQL está rodando
2. Confira se `DATABASE_URL` está no formato correto
3. Verifique se o backend está na mesma região do DB

### Domain não funciona

1. Aguarde até 48h para propagação DNS
2. Verifique se o CNAME está correto: `nslookup finance.mocktstudio.com`
3. Limpe cache DNS local: `ipconfig /flushdns` (Windows) ou `sudo dscacheutil -flushcache` (Mac)

---

## 📊 Monitoramento

### Métricas Disponíveis

- **Render Dashboard**: CPU, Memory, Request Rate
- **Logs**: Acesso em tempo real
- **Health Checks**: `/health` e `/health/detailed`

### Swagger API Docs

Após deploy, acesse:
```
https://finance-backend.onrender.com/docs
```

---

## 🔄 Atualizações

### Deploy Automático

Render faz **deploy automático** a cada `git push` para a branch `main`.

### Deploy Manual

No Dashboard → Serviço → Clique em **"Manual Deploy"** → **"Deploy latest commit"**

---

## 💰 Custos Estimados

| Serviço | Tier Gratuito | Tier Pago |
|---------|---------------|-----------|
| Backend | ✅ Free (com sleep) | $7/mês (sem sleep) |
| Frontend | ✅ Free forever | - |
| PostgreSQL | ✅ 90 dias grátis | $7/mês |
| Redis | ✅ Free | $10/mês (1GB) |
| **Total** | **$0/mês** (3 meses) | **$14-24/mês** |

---

## ✅ Checklist Final

- [ ] Push do código para Git
- [ ] Deploy via Blueprint ou Manual
- [ ] Configurar variáveis de ambiente (JWT, CORS, API_URL)
- [ ] Verificar health checks
- [ ] Configurar CNAME no DNS
- [ ] Testar domínio `finance.mocktstudio.com`
- [ ] Testar login/signup
- [ ] Testar criação de transações

---

## 📚 Recursos

- [Render Docs](https://render.com/docs)
- [Blueprint Spec](https://render.com/docs/blueprint-spec)
- [Custom Domains](https://render.com/docs/custom-domains)
- [Environment Variables](https://render.com/docs/configure-environment-variables)

---

🎉 **Pronto! Sua aplicação estará no ar em `finance.mocktstudio.com`**
