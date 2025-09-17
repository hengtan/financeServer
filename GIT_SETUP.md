# 🗂️ Configuração Git - FinanceServer

Este documento descreve a configuração do Git para o projeto FinanceServer, incluindo os arquivos `.gitignore` otimizados para ambas as aplicações.

## 📁 Estrutura dos Arquivos Git

```
financeServer/
├── .gitignore              # GitIgnore principal do monorepo
├── .gitattributes          # Configurações de atributos Git
├── frontend/
│   └── .gitignore          # GitIgnore específico do frontend
└── backend/
    └── .gitignore          # GitIgnore específico do backend
```

## 🚫 Arquivos e Pastas Ignorados

### 💻 **IDEs e Editores**
- **JetBrains** (IntelliJ, WebStorm, Rider, PhpStorm, etc.)
  - `.idea/` - Configurações do projeto
  - `*.iml` - Arquivos de módulo
  - `*.ipr`, `*.iws` - Arquivos de projeto e workspace
  - `.idea_modules/` - Módulos externos

- **Visual Studio Code**
  - `.vscode/` - Configurações do VS Code
  - `*.code-workspace` - Arquivos de workspace
  - **Exceção**: `.vscode/extensions.json` é mantido para compartilhar extensões recomendadas

- **Outros Editores**
  - `*.swp`, `*.swo` - Vim swap files
  - `.project`, `.settings/` - Eclipse
  - `*.suo`, `*.ntvs*` - Visual Studio

### 📦 **Gerenciadores de Pacotes**
- `node_modules/` - Dependências Node.js
- `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml` - Lock files
- `.npm`, `.yarn/`, `.pnpm-store/` - Caches dos gerenciadores

### 🏗️ **Build e Compilação**
- `dist/`, `build/`, `out/` - Diretórios de build
- `*.tsbuildinfo` - Cache do TypeScript
- `.next/`, `.nuxt/`, `.vite/` - Caches de frameworks

### 🔐 **Variáveis de Ambiente e Segurança**
- `.env*` - Todas as variações de arquivos de ambiente
- `*.pem`, `*.key`, `*.crt` - Certificados e chaves privadas
- `*.p12`, `*.pfx` - Certificados PKCS

### 💾 **Banco de Dados**
- `*.db`, `*.sqlite*` - Arquivos de banco SQLite
- `prisma/migrations/` - Migrações Prisma (geradas automaticamente)
- `dump.rdb` - Dump do Redis

### 📊 **Logs e Monitoramento**
- `logs/`, `*.log` - Arquivos de log
- `coverage/` - Relatórios de cobertura de testes
- `newrelic_agent.log` - Logs do New Relic

### 🗂️ **Cache e Temporários**
- `.cache/`, `.parcel-cache/` - Caches de build tools
- `temp/`, `tmp/` - Diretórios temporários
- `.DS_Store` (macOS), `Thumbs.db` (Windows) - Arquivos do sistema

### 📱 **Mobile e Deployment**
- `.expo/`, `ios/`, `android/` - Desenvolvimento mobile
- `.vercel/`, `.netlify/`, `.aws/` - Configurações de deploy
- `capacitor.config.json` - Configuração Capacitor

## ✅ **Arquivos Mantidos**

### 🔧 **Configurações de Projeto**
- `.vscode/extensions.json` - Extensões recomendadas
- `package.json` - Configuração do projeto
- `tsconfig.json` - Configuração TypeScript
- `eslint.config.js` - Configuração ESLint
- `prisma/schema.prisma` - Schema do banco

### 📖 **Documentação**
- `README.md` - Documentação principal
- `*.md` - Arquivos de documentação
- `.env.example` - Exemplo de variáveis de ambiente

## 🛠️ **Configurações Especiais**

### 📝 **GitAttributes (.gitattributes)**
- **Line Endings**: Força LF para arquivos de código
- **Binary Files**: Marca arquivos binários corretamente
- **Linguist**: Configura detecção de linguagem no GitHub
- **Generated Files**: Marca arquivos gerados automaticamente

### 🏷️ **Detecção de Linguagem GitHub**
- Arquivos gerados são marcados como `linguist-generated`
- Documentação marcada como `linguist-documentation`
- Lock files ignorados na estatística de linguagens

## 🔍 **Comandos Úteis**

```bash
# Verificar status dos arquivos ignorados
git status --ignored

# Limpar cache do Git (após atualizar .gitignore)
git rm -r --cached .
git add .
git commit -m "Atualizar .gitignore"

# Verificar se um arquivo específico é ignorado
git check-ignore -v <caminho-do-arquivo>

# Forçar adicionar arquivo ignorado (se necessário)
git add -f <caminho-do-arquivo>
```

## 🎯 **Benefícios da Configuração**

### ✨ **Repositório Limpo**
- Apenas código fonte e configurações essenciais
- Sem arquivos gerados ou temporários
- Sem configurações específicas de IDE/OS

### 🚀 **Performance**
- Clones mais rápidos
- Menos conflitos de merge
- Histórico mais limpo

### 🔒 **Segurança**
- Variáveis de ambiente protegidas
- Certificados e chaves não commitados
- Dados sensíveis seguros

### 👥 **Colaboração**
- Funciona em qualquer OS (Windows, macOS, Linux)
- Suporte a diferentes IDEs (JetBrains, VS Code, etc.)
- Configuração consistente para toda a equipe

## 📋 **Checklist de Configuração**

- [x] `.gitignore` principal configurado
- [x] `.gitignore` do backend configurado
- [x] `.gitignore` do frontend configurado
- [x] `.gitattributes` configurado
- [x] IDEs suportados (JetBrains, VS Code)
- [x] Sistemas operacionais suportados
- [x] Arquivos de segurança protegidos
- [x] Arquivos gerados ignorados
- [x] Documentação criada

## 🚨 **Importante**

1. **Nunca commite**:
   - Arquivos `.env` com dados reais
   - Chaves privadas ou certificados
   - Configurações específicas de IDE
   - Dados de banco de dados local

2. **Sempre commite**:
   - Arquivos `.env.example`
   - Configurações de projeto compartilhadas
   - Documentação
   - Código fonte

3. **Antes de fazer commit**:
   - Verifique o `git status`
   - Revise os arquivos que serão commitados
   - Use `git diff` para verificar mudanças