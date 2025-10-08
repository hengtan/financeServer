# Instruções do Projeto FinanceServer

## Git Workflow - CRÍTICO

### NUNCA Commitar Diretamente na Main

**REGRA FUNDAMENTAL**: ❌ NUNCA fazer commits direto na branch `main`

1. **SEMPRE criar uma branch nova** para qualquer mudança
   - Se o usuário não especificou criar uma branch, você DEVE criar automaticamente
   - Não precisa criar múltiplas branches, mas pelo menos 1 branch de trabalho

2. **Fluxo de branches**:
   ```
   feature/nome-da-feature → dev → main
   ```
   - Commits vão para a branch de feature
   - Merge para `dev` somente se o usuário pedir
   - Merge para `main` somente se o usuário pedir explicitamente

3. **Nomenclatura de branches**:
   - `feature/nome-descritivo` - para novas funcionalidades
   - `fix/nome-descritivo` - para correções
   - `refactor/nome-descritivo` - para refatorações

## Git Commits

**IMPORTANTE**: Todos os commits devem ser feitos SOMENTE com o nome do desenvolvedor (hengtan).

- ❌ NUNCA adicionar "Claude" ou "Co-Authored-By: Claude" nos commits
- ❌ NUNCA usar assinaturas automáticas do Claude Code
- ✅ Usar sempre o nome e email do desenvolvedor configurado no git

### Formato de Commit Correto

```bash
git commit -m "feat: descrição da feature"
# OU
git commit -m "fix: descrição do fix"
```

**NÃO** usar o formato com "Co-Authored-By: Claude" ou emojis do Claude Code.

## Ambiente de Desenvolvimento

- Backend Node.js (Fastify) na porta 3001
- Backend Python (FastAPI) na porta 8000
- Frontend React na porta 5173
- PostgreSQL via Docker
- Redis via Docker

## Deploy

- Frontend: Railway (https://mocktstudio.com.br)
- Backend: Railway (https://api.mocktstudio.com.br)
- Usar Dockerfile para deploy (não nixpacks)
