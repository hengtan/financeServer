# FinanceServer Backend

API REST para o sistema de gestão financeira FinanceServer, desenvolvida com Node.js, Express e TypeScript.

## 🚀 Funcionalidades

### ✅ Implementado
- Configuração inicial do servidor Express
- Sistema de middlewares de segurança (Helmet, CORS, Rate Limiting)
- Estrutura de rotas modular
- Sistema de tratamento de erros centralizado
- Configurações de ambiente
- Sistema de logging
- Health check endpoint

### 🔄 Em Desenvolvimento
- Sistema de autenticação com JWT
- Autenticação de dois fatores (2FA)
- CRUD de usuários
- CRUD de transações
- CRUD de categorias
- CRUD de metas financeiras
- Sistema de relatórios
- Integração com banco de dados (Prisma)
- Testes automatizados

## 📁 Estrutura do Projeto

```
src/
├── config/           # Configurações da aplicação
├── controllers/      # Controladores das rotas
├── middleware/       # Middlewares customizados
├── models/          # Modelos de dados
├── routes/          # Definição das rotas
├── services/        # Lógica de negócio
├── types/           # Tipos TypeScript
├── utils/           # Utilitários
└── index.ts         # Ponto de entrada

tests/
├── unit/            # Testes unitários
└── integration/     # Testes de integração

docs/                # Documentação
```

## 🛠️ Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Tipagem estática
- **Prisma** - ORM para banco de dados
- **JWT** - Autenticação
- **Bcrypt** - Hash de senhas
- **Zod** - Validação de schemas
- **Jest** - Testes
- **ESLint** - Linting

## 🔧 Configuração

### Pré-requisitos
- Node.js >= 18
- npm >= 8
- PostgreSQL (ou outro banco suportado pelo Prisma)

### Instalação

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/financeserver"
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:5173
```

3. **Executar em desenvolvimento:**
```bash
npm run dev
```

## 📊 Scripts Disponíveis

```bash
# Desenvolvimento com hot reload
npm run dev

# Build de produção
npm run build

# Executar versão de produção
npm start

# Linting
npm run lint
npm run lint:fix

# Testes
npm test
npm run test:watch
npm run test:coverage
```

## 🌐 Endpoints

### Health Check
```
GET /health
```

### Autenticação
```
GET /api/auth/test        # Teste da rota
POST /api/auth/login      # Em desenvolvimento
POST /api/auth/register   # Em desenvolvimento
POST /api/auth/refresh    # Em desenvolvimento
```

### Usuários
```
GET /api/users/test       # Teste da rota
GET /api/users/me         # Em desenvolvimento
PUT /api/users/me         # Em desenvolvimento
```

### Transações
```
GET /api/transactions/test    # Teste da rota
GET /api/transactions         # Em desenvolvimento
POST /api/transactions        # Em desenvolvimento
PUT /api/transactions/:id     # Em desenvolvimento
DELETE /api/transactions/:id  # Em desenvolvimento
```

### Categorias
```
GET /api/categories/test      # Teste da rota
GET /api/categories           # Em desenvolvimento
POST /api/categories          # Em desenvolvimento
PUT /api/categories/:id       # Em desenvolvimento
DELETE /api/categories/:id    # Em desenvolvimento
```

### Metas
```
GET /api/goals/test           # Teste da rota
GET /api/goals                # Em desenvolvimento
POST /api/goals               # Em desenvolvimento
PUT /api/goals/:id            # Em desenvolvimento
DELETE /api/goals/:id         # Em desenvolvimento
```

## 🔒 Segurança

- **Helmet** - Headers de segurança
- **CORS** - Controle de origem cruzada
- **Rate Limiting** - Limitação de taxa de requisições
- **JWT** - Tokens seguros para autenticação
- **Bcrypt** - Hash seguro de senhas
- **Validação de entrada** - Validação com Zod

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Testes em modo watch
npm run test:watch

# Coverage dos testes
npm run test:coverage
```

## 📝 Logging

O sistema de logging está configurado com Morgan para logs de requisições HTTP e console personalizado para logs da aplicação.

## 🚀 Deploy

### Preparação para produção:
1. Definir todas as variáveis de ambiente necessárias
2. Configurar banco de dados de produção
3. Executar build: `npm run build`
4. Executar: `npm start`

### Variáveis obrigatórias em produção:
- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`

## 🤝 Contribuição

1. Faça fork do projeto
2. Crie uma branch para sua feature: `git checkout -b feature/nova-feature`
3. Commit suas mudanças: `git commit -m 'Adiciona nova feature'`
4. Push para a branch: `git push origin feature/nova-feature`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.