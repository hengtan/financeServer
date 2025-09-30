# 🧪 Guia de Testes - FinanceServer

Este documento fornece informações completas sobre a estratégia de testes, configuração e execução dos testes no projeto FinanceServer.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Backend Tests](#backend-tests)
- [Frontend Tests](#frontend-tests)
- [Configuração do Ambiente](#configuração-do-ambiente)
- [Executando os Testes](#executando-os-testes)
- [Coverage](#coverage)
- [CI/CD](#cicd)
- [Boas Práticas](#boas-práticas)

## 🔍 Visão Geral

Nossa estratégia de testes inclui:

- **Testes Unitários**: Validação de funções, métodos e componentes isolados
- **Testes de Integração**: Validação das APIs e interações entre componentes
- **Testes de Componentes**: Validação dos componentes React
- **Testes E2E**: Fluxos completos da aplicação (futuro)
- **Linting e Type Checking**: Qualidade e consistência do código

## 🔧 Backend Tests

### Stack de Testes
- **Jest**: Framework principal de testes
- **Supertest**: Testes de integração de APIs
- **TypeScript**: Suporte completo ao TypeScript
- **Test Database**: PostgreSQL separado para testes

### Estrutura dos Testes
```
backend/tests/
├── unit/                 # Testes unitários
│   ├── entities/         # Testes das entidades de domínio
│   ├── services/         # Testes dos serviços
│   └── repositories/     # Testes dos repositórios
├── integration/          # Testes de integração
│   ├── auth.test.ts      # Testes das rotas de autenticação
│   └── transactions.test.ts # Testes das rotas de transações
├── helpers/              # Utilitários para testes
│   └── testApp.ts        # Configuração da aplicação de teste
├── mocks/                # Mocks reutilizáveis
└── setup.ts              # Configuração global dos testes
```

### Comandos do Backend
```bash
cd backend

# Executar todos os testes
npm run test

# Executar testes em modo watch
npm run test:watch

# Executar testes com coverage
npm run test:coverage

# Executar apenas testes unitários
npm run test -- unit/

# Executar apenas testes de integração
npm run test -- integration/
```

### Configuração do Banco de Teste
```bash
# Criar banco de teste
createdb financeserver_test

# Executar migrations
DATABASE_URL="postgresql://user:pass@localhost:5432/financeserver_test" npx prisma migrate deploy

# Resetar banco de teste
DATABASE_URL="postgresql://user:pass@localhost:5432/financeserver_test" npx prisma migrate reset --force
```

## ⚛️ Frontend Tests

### Stack de Testes
- **Vitest**: Framework de testes rápido e moderno
- **Testing Library**: Testes centrados no usuário
- **User Events**: Simulação de interações do usuário
- **MSW (Mock Service Worker)**: Mock das APIs
- **JSDOM**: Ambiente de DOM para testes

### Estrutura dos Testes
```
frontend/src/
├── test/                 # Configuração de testes
│   ├── setup.ts          # Setup global dos testes
│   └── mocks/            # Mocks das APIs
│       ├── server.ts     # Configuração do MSW
│       └── handlers/     # Handlers das APIs
├── components/
│   └── ui/
│       └── __tests__/    # Testes dos componentes UI
├── pages/
│   └── __tests__/        # Testes das páginas
└── hooks/
    └── __tests__/        # Testes dos hooks customizados
```

### Comandos do Frontend
```bash
cd frontend

# Executar todos os testes
npm run test

# Executar testes com UI interativa
npm run test:ui

# Executar testes uma vez
npm run test:run

# Executar testes com coverage
npm run test:coverage
```

## 🛠️ Configuração do Ambiente

### Pré-requisitos
```bash
# Node.js 18+
node --version

# PostgreSQL (para testes de integração)
psql --version

# Redis (para testes de integração)
redis-cli --version
```

### Configuração Inicial
```bash
# 1. Clone o repositório
git clone <repo-url>
cd financeServer

# 2. Instale dependências do backend
cd backend
npm install

# 3. Instale dependências do frontend
cd ../frontend
npm install

# 4. Configure variáveis de ambiente
cd ../backend
cp .env.example .env.test

# 5. Configure banco de teste
createdb financeserver_test
DATABASE_URL="postgresql://user:pass@localhost:5432/financeserver_test" npx prisma migrate deploy
```

### Variáveis de Ambiente para Testes
```bash
# backend/.env.test
NODE_ENV=test
DATABASE_URL=postgresql://test:test@localhost:5432/financeserver_test
JWT_SECRET=test-jwt-secret
JWT_REFRESH_SECRET=test-refresh-secret
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB=1
```

## 🚀 Executando os Testes

### Execução Local
```bash
# Todos os testes do backend
cd backend && npm run test:coverage

# Todos os testes do frontend
cd frontend && npm run test:coverage

# Script completo (ambos)
npm run test:all  # (se configurado no package.json raiz)
```

### Execução com Docker
```bash
# Usando docker-compose para ambiente de teste
docker-compose -f docker-compose.test.yml up --build
```

### Testes Específicos
```bash
# Backend - teste específico
cd backend && npm test -- AuthService.test.ts

# Frontend - componente específico
cd frontend && npm test -- button.test.tsx

# Com pattern matching
cd backend && npm test -- --testNamePattern="login"
```

## 📊 Coverage

### Metas de Coverage
- **Backend**: Mínimo 80% de cobertura
- **Frontend**: Mínimo 75% de cobertura
- **Funções Críticas**: 95% de cobertura (auth, transações)

### Relatórios de Coverage
```bash
# Backend - gera relatório HTML
cd backend && npm run test:coverage
# Abrir: backend/coverage/lcov-report/index.html

# Frontend - gera relatório HTML
cd frontend && npm run test:coverage
# Abrir: frontend/coverage/index.html
```

### Exclusões de Coverage
```javascript
// Arquivos excluídos do coverage
- main.ts / index.ts
- *.d.ts (definições de tipos)
- Configurações (*.config.*)
- Mocks e fixtures
```

## 🔄 CI/CD

### GitHub Actions
O pipeline de CI executa automaticamente:

1. **Lint e Type Check**: ESLint + TypeScript
2. **Testes Unitários**: Jest (backend) + Vitest (frontend)
3. **Testes de Integração**: APIs com banco real
4. **Security Audit**: npm audit
5. **Coverage Reports**: Codecov integration

### Workflow Triggers
```yaml
# .github/workflows/tests.yml
on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]
```

### Status Checks
Todos os PRs devem passar:
- ✅ Lint (backend + frontend)
- ✅ Type Check (backend + frontend)
- ✅ Unit Tests (>80% coverage)
- ✅ Integration Tests
- ✅ Security Audit

## 📝 Boas Práticas

### Estrutura dos Testes
```typescript
describe('ComponentName', () => {
  // Setup comum
  beforeEach(() => {
    // Limpar mocks, setup inicial
  })

  describe('feature group', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test data'

      // Act
      const result = functionUnderTest(input)

      // Assert
      expect(result).toBe('expected output')
    })
  })
})
```

### Nomenclatura
```typescript
// ✅ Bom
describe('AuthService', () => {
  it('should return user data when login is successful', () => {})
  it('should throw error when credentials are invalid', () => {})
})

// ❌ Ruim
describe('Auth', () => {
  it('test login', () => {})
  it('test error', () => {})
})
```

### Mocks e Stubs
```typescript
// ✅ Mock específico e limpo
const mockUserRepository = {
  findByEmail: vi.fn().mockResolvedValue(mockUser),
  create: vi.fn().mockResolvedValue(mockUser)
}

// ✅ Cleanup nos afterEach
afterEach(() => {
  vi.clearAllMocks()
})
```

### Testes de Componentes React
```typescript
// ✅ Teste focado no comportamento do usuário
it('should submit form when user clicks submit button', async () => {
  const user = userEvent.setup()
  const mockSubmit = vi.fn()

  render(<LoginForm onSubmit={mockSubmit} />)

  await user.type(screen.getByLabelText(/email/i), 'test@test.com')
  await user.type(screen.getByLabelText(/password/i), 'password')
  await user.click(screen.getByRole('button', { name: /submit/i }))

  expect(mockSubmit).toHaveBeenCalledWith({
    email: 'test@test.com',
    password: 'password'
  })
})
```

### Performance dos Testes
```typescript
// ✅ Use parallel execution
// jest.config.js
module.exports = {
  maxWorkers: '50%',
  testTimeout: 10000
}

// ✅ Mock dependências externas
jest.mock('axios')
jest.mock('ioredis')
```

## 🐛 Debugging Testes

### Debug no VSCode
```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Jest Tests",
  "program": "${workspaceFolder}/backend/node_modules/.bin/jest",
  "args": ["--runInBand", "--testTimeout", "0"],
  "cwd": "${workspaceFolder}/backend",
  "console": "integratedTerminal"
}
```

### Comandos de Debug
```bash
# Debug teste específico
cd backend && npm test -- --runInBand AuthService.test.ts

# Verbose output
cd backend && npm test -- --verbose

# Bail on first failure
cd backend && npm test -- --bail
```

## 📚 Recursos Adicionais

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Vitest Documentation](https://vitest.dev/guide/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [MSW Documentation](https://mswjs.io/docs/)

---

## 🆘 Problemas Comuns

### "Cannot find module" nos testes
```bash
# Verifique os paths no jest.config.js
moduleNameMapping: {
  '^@/(.*)$': '<rootDir>/src/$1'
}
```

### Timeout nos testes de integração
```bash
# Aumente o timeout
jest.setTimeout(30000)
```

### Falha na conexão com banco
```bash
# Verifique se o PostgreSQL está rodando
pg_isready -h localhost -p 5432

# Verifique a DATABASE_URL
echo $DATABASE_URL
```

---

**Mantido por**: Equipe FinanceServer
**Última atualização**: 2024-09-17