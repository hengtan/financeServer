# FinanceServer - Sistema de Gestão Financeira

Sistema completo de gestão financeira pessoal com arquitetura Full-Stack (Frontend React + Backend Node.js).

## 📁 Estrutura do Projeto

```
financeServer/
├── frontend/             # React + TypeScript + Vite
├── backend/              # Node.js + Express + TypeScript
├── package.json          # Scripts centralizados
└── README.md             # Este arquivo
```

## 🚀 Início Rápido

### Instalação Completa
```bash
# Instalar dependências de todos os projetos
npm run install:all
```

### Desenvolvimento
```bash
# Executar frontend e backend simultaneamente
npm run dev

# Ou executar separadamente:
npm run dev:frontend    # Frontend em http://localhost:5173
npm run dev:backend     # Backend em http://localhost:3001
```

### Build de Produção
```bash
# Build completo
npm run build

# Ou build separado:
npm run build:frontend
npm run build:backend
```

## 🏗️ Arquitetura

### Frontend (`/frontend`)
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn/ui
- **Estado**: Context API + Hooks
- **Roteamento**: React Router v6
- **URL**: http://localhost:5173

**Funcionalidades:**
- ✅ Sistema de autenticação com 2FA
- ✅ Dashboard financeiro interativo
- ✅ Gestão de transações
- ✅ Relatórios e gráficos
- ✅ Sistema de metas financeiras
- ✅ Configurações e perfil
- ✅ Notificações em tempo real
- ✅ Dark mode completo
- ✅ Interface responsiva

### Backend (`/backend`)
- **Framework**: Node.js + Express + TypeScript
- **Segurança**: Helmet, CORS, Rate Limiting, JWT
- **ORM**: Prisma (configurado)
- **Validação**: Zod
- **URL**: http://localhost:3001

**Funcionalidades:**
- ✅ API REST com estrutura modular
- ✅ Sistema de middlewares de segurança
- ✅ Tratamento de erros centralizado
- ✅ Configurações de ambiente
- ✅ Health check endpoint
- 🔄 Sistema de autenticação JWT (em desenvolvimento)
- 🔄 CRUD completo (em desenvolvimento)

## 📊 Scripts Disponíveis

### Scripts Centralizados (raiz)
```bash
npm run dev              # Frontend + Backend juntos
npm run build            # Build completo
npm run test             # Testes completos
npm run lint             # Lint completo
npm run install:all      # Instalar todas as dependências
```

### Scripts do Frontend
```bash
cd frontend
npm run dev              # Desenvolvimento
npm run build            # Build de produção
npm run preview          # Preview do build
npm run lint             # Linting
```

### Scripts do Backend
```bash
cd backend
npm run dev              # Desenvolvimento com hot reload
npm run build            # Build TypeScript
npm start                # Executar produção
npm run lint             # Linting
npm test                 # Testes
```

## 🌐 Endpoints da API

### Funcionando
- `GET /health` - Health check
- `GET /api/auth/test` - Teste da rota de autenticação
- `GET /api/users/test` - Teste da rota de usuários
- `GET /api/transactions/test` - Teste da rota de transações
- `GET /api/categories/test` - Teste da rota de categorias
- `GET /api/goals/test` - Teste da rota de metas

### Em Desenvolvimento
- `POST /api/auth/login` - Login com 2FA
- `POST /api/auth/register` - Registro de usuário
- `GET /api/users/me` - Perfil do usuário
- `GET /api/transactions` - Listar transações
- E muitos outros...

## 🔧 Configuração

### Pré-requisitos
- Node.js >= 18
- npm >= 8
- PostgreSQL (para o backend)

### Configuração do Backend
```bash
cd backend
cp .env.example .env
# Editar .env com suas configurações
```

### Variáveis de Ambiente Importantes
```env
# Backend
PORT=3001
DATABASE_URL="postgresql://user:pass@localhost:5432/financeserver"
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
```

## 🛠️ Tecnologias

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui
- React Router
- Lucide Icons
- Recharts

### Backend
- Node.js
- Express
- TypeScript
- Prisma
- JWT
- Bcrypt
- Zod
- Helmet
- CORS

## 🔒 Segurança

### Frontend
- Autenticação robusta com 2FA
- Proteção de rotas
- Validação de formulários
- Tokens JWT com refresh

### Backend
- Headers de segurança (Helmet)
- CORS configurado
- Rate limiting
- Validação de dados (Zod)
- Hash seguro de senhas (Bcrypt)

## 🧪 Testes

```bash
# Testes completos
npm test

# Testes por projeto
npm run test:frontend
npm run test:backend
```

## 📦 Deploy

### Frontend
O frontend pode ser deployado em:
- Vercel (recomendado para Vite)
- Netlify
- GitHub Pages

### Backend
O backend pode ser deployado em:
- Railway
- Heroku
- DigitalOcean
- AWS

## 🚀 Próximos Passos

1. **Implementar APIs reais no backend**
2. **Configurar banco de dados PostgreSQL**
3. **Conectar frontend com backend real**
4. **Adicionar testes automatizados**
5. **Configurar CI/CD**
6. **Documentar APIs com Swagger**

## 🤝 Contribuição

1. Clone o repositório
2. Execute `npm run install:all`
3. Configure as variáveis de ambiente
4. Execute `npm run dev`
5. Faça suas alterações
6. Teste localmente
7. Envie um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

---

**🎯 Objetivo**: Criar um sistema completo de gestão financeira pessoal com tecnologias modernas e arquitetura escalável.