# CI/CD Workflows - FinanceServer

Este diretório contém os workflows do GitHub Actions para CI/CD profissional do projeto FinanceServer.

## 📋 Estrutura dos Workflows

### Backend Workflows

#### 🟢 Development (`backend-dev.yml`)
- **Branch**: `dev`
- **Triggers**: Push e Pull Request na branch dev
- **Jobs**:
  - ✅ Testes automatizados
  - 🔨 Build TypeScript + Python
  - 🗃️ Migrations Prisma
  - 🚀 Deploy automático no Railway (ambiente dev)

#### 🟡 Homologation (`backend-homol.yml`)
- **Branch**: `homol`
- **Triggers**: Push e Pull Request na branch homol
- **Jobs**:
  - ✅ Testes automatizados
  - 🔒 Security scan (npm audit + Snyk)
  - 🔨 Build TypeScript + Python
  - 🚀 Deploy automático no Railway (ambiente staging)

#### 🔴 Production (`backend-prod.yml`)
- **Branch**: `main`
- **Triggers**: Push e Pull Request na branch main
- **Jobs**:
  - ✅ Testes automatizados
  - 🔒 Security scan (npm audit + Snyk)
  - 🔨 Build TypeScript + Python
  - 🏷️ Criação automática de tags de release
  - ✅ Verificação de deployment
  - 🚀 Deploy automático no Railway (ambiente production)
  - 📢 Notificações de status

### Frontend Workflows

#### 🟢 Development (`frontend-dev.yml`)
- **Branch**: `dev`
- **Triggers**: Push e Pull Request na branch dev
- **Jobs**:
  - ✅ Type checking
  - 🔨 Build Vite
  - 🎨 Linter
  - 🚀 Deploy automático no Railway (ambiente dev)

#### 🟡 Homologation (`frontend-homol.yml`)
- **Branch**: `homol`
- **Triggers**: Push e Pull Request na branch homol
- **Jobs**:
  - ✅ Type checking
  - 🔨 Build Vite
  - 🎨 Linter
  - 💡 Lighthouse Performance Audit
  - 🚀 Deploy automático no Railway (ambiente staging)

#### 🔴 Production (`frontend-prod.yml`)
- **Branch**: `main`
- **Triggers**: Push e Pull Request na branch main
- **Jobs**:
  - ✅ Type checking
  - 🔨 Build Vite
  - 🎨 Linter (obrigatório)
  - 💡 Lighthouse Performance Audit
  - 🔒 Security scan (npm audit + Snyk)
  - 🏷️ Criação automática de tags de release
  - ✅ Verificação de deployment
  - 🚀 Deploy automático no Railway (ambiente production)
  - 📢 Notificações de status

## 🔐 Secrets Necessários

Configure os seguintes secrets no GitHub:

```
RAILWAY_TOKEN          # Token de autenticação do Railway
SNYK_TOKEN            # Token do Snyk para security scans (opcional)
```

### Como configurar:
1. Vá em **Settings** → **Secrets and variables** → **Actions**
2. Clique em **New repository secret**
3. Adicione cada secret

## 🌍 Ambientes

| Ambiente | Branch | Backend URL | Frontend URL |
|----------|--------|-------------|--------------|
| Development | `dev` | `api-dev.mocktstudio.com.br` | `dev.mocktstudio.com.br` |
| Homologation | `homol` | `api-homol.mocktstudio.com.br` | `homol.mocktstudio.com.br` |
| Production | `main` | `api.mocktstudio.com.br` | `mocktstudio.com.br` |

## 🚀 Fluxo de Deploy

```
feature/branch → dev → homol → main
```

1. **Feature branch**: Desenvolvimento local
2. **Dev**: Testes e integração contínua
3. **Homol**: Validação e testes de aceitação
4. **Main**: Produção estável

## 📊 Status Badges

Adicione ao README principal:

```markdown
![Backend Dev](https://github.com/hengtan/financeServer/actions/workflows/backend-dev.yml/badge.svg)
![Backend Homol](https://github.com/hengtan/financeServer/actions/workflows/backend-homol.yml/badge.svg)
![Backend Prod](https://github.com/hengtan/financeServer/actions/workflows/backend-prod.yml/badge.svg)

![Frontend Dev](https://github.com/hengtan/financeServer/actions/workflows/frontend-dev.yml/badge.svg)
![Frontend Homol](https://github.com/hengtan/financeServer/actions/workflows/frontend-homol.yml/badge.svg)
![Frontend Prod](https://github.com/hengtan/financeServer/actions/workflows/frontend-prod.yml/badge.svg)
```

## 🛠️ Tecnologias Utilizadas

- **GitHub Actions**: CI/CD
- **Railway**: Hosting e Deploy
- **PostgreSQL**: Database (via services)
- **Redis**: Cache (via services)
- **Snyk**: Security scanning
- **Lighthouse CI**: Performance audits
- **Node.js 20.x**: Runtime
- **Python 3.11**: Analytics service

## 📝 Notas Importantes

1. **Cache**: Os workflows usam cache de dependências para builds mais rápidos
2. **Monorepo**: Workflows são acionados apenas quando há mudanças nos respectivos diretórios
3. **Security**: Scans de segurança rodam em homol e prod
4. **Performance**: Lighthouse audits garantem performance do frontend
5. **Tags**: Releases são taggeadas automaticamente em produção
6. **Health Checks**: Verificação de saúde após deploy em produção
