# FinanceServer - Sistema de Gestão Financeira

Sistema completo de gestão financeira pessoal com arquitetura separada em Frontend (React) e Backend (Node.js/Express).

## 📁 Estrutura do Projeto

```
RiderProjects/
├── financeServer-FE/     # Frontend (React + TypeScript + Vite)
└── financeServer-BE/     # Backend (Node.js + Express + TypeScript)
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js >= 18
- npm >= 8

### 1. Backend (API)
```bash
cd financeServer-BE

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Executar em desenvolvimento
npm run dev
```

O backend estará disponível em: **http://localhost:3001**

### 2. Frontend (Interface)
```bash
cd financeServer-FE

# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev
```

O frontend estará disponível em: **http://localhost:5173**

## 🏗️ Arquitetura

### Frontend (financeServer-FE)
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn/ui
- **Estado**: Context API + Hooks
- **Roteamento**: React Router v6
- **Funcionalidades**:
  - ✅ Sistema de autenticação com 2FA
  - ✅ Dashboard financeiro interativo
  - ✅ Gestão de transações
  - ✅ Relatórios e gráficos
  - ✅ Sistema de metas financeiras
  - ✅ Configurações e perfil
  - ✅ Notificações em tempo real
  - ✅ Dark mode completo
  - ✅ Interface responsiva

### Backend (financeServer-BE)
- **Framework**: Node.js + Express + TypeScript
- **Segurança**: Helmet, CORS, Rate Limiting, JWT
- **Funcionalidades**:
  - ✅ API REST com estrutura modular
  - ✅ Sistema de middlewares
  - ✅ Tratamento de erros centralizado
  - ✅ Configurações de ambiente
  - ✅ Health check endpoint
  - 🔄 Sistema de autenticação JWT (em desenvolvimento)
  - 🔄 CRUD de transações (em desenvolvimento)
  - 🔄 Sistema de 2FA (em desenvolvimento)
  - 🔄 Integração com banco de dados (em desenvolvimento)

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

## 🔧 Scripts Disponíveis

### Backend
```bash
npm run dev      # Desenvolvimento com hot reload
npm run build    # Build de produção
npm start        # Executar produção
npm run lint     # Linting
npm test         # Testes
```

### Frontend
```bash
npm run dev      # Desenvolvimento com hot reload
npm run build    # Build de produção
npm run preview  # Preview do build
npm run lint     # Linting
```

## 🔒 Recursos de Segurança

### Frontend
- ✅ Autenticação robusta com redirecionamentos
- ✅ Sistema de 2FA (Authenticator/SMS/Email)
- ✅ Recuperação de senha segura
- ✅ Validação de formulários com Zod
- ✅ Tokens JWT com refresh automático
- ✅ Proteção de rotas sensíveis

### Backend
- ✅ Headers de segurança com Helmet
- ✅ CORS configurado corretamente
- ✅ Rate limiting para prevenir ataques
- ✅ Validação de dados com Zod
- ✅ Hash seguro de senhas (Bcrypt)
- ✅ JWT para autenticação stateless
- ✅ Tratamento seguro de erros

## 📊 Status do Desenvolvimento

### ✅ Completado
- [x] Reorganização da arquitetura Frontend/Backend
- [x] Setup completo do frontend com todas as funcionalidades
- [x] Estrutura base do backend com Express e TypeScript
- [x] Sistema de 2FA completo no frontend
- [x] Dark mode em todo o sistema
- [x] Sistema de notificações interativo
- [x] Configuração de segurança básica
- [x] Documentação completa

### 🔄 Em Desenvolvimento
- [ ] Implementação completa das APIs do backend
- [ ] Integração com banco de dados (Prisma)
- [ ] Sistema de autenticação JWT no backend
- [ ] Conectar frontend com backend real
- [ ] Testes automatizados
- [ ] Sistema de deploy

### 📋 Próximos Passos
1. Implementar endpoints de autenticação no backend
2. Configurar banco de dados PostgreSQL
3. Conectar frontend com APIs reais
4. Implementar sistema de testes
5. Configurar CI/CD

## 🛠️ Tecnologias Utilizadas

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui
- React Router
- Lucide Icons
- Recharts (gráficos)

### Backend
- Node.js
- Express
- TypeScript
- Prisma (ORM)
- JWT
- Bcrypt
- Zod
- Helmet
- CORS
- Rate Limiting

## 🤝 Contribuição

1. Clone o repositório
2. Configure o backend: `cd financeServer-BE && npm install && cp .env.example .env`
3. Configure o frontend: `cd financeServer-FE && npm install`
4. Execute ambos em desenvolvimento
5. Faça suas alterações
6. Teste localmente
7. Envie um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

---

**Nota**: Este projeto foi reorganizado para separar claramente as responsabilidades entre frontend e backend, permitindo desenvolvimento independente e deploy separado de cada parte do sistema.