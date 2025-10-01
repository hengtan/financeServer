# Database Seeding Guide

Este diretório contém scripts de seed para popular o banco de dados com dados de teste.

## 📋 Seeds Disponíveis

### 1. `seed.ts` - Seed Básico (Original)
Seed simples com dados mínimos para testes básicos.

**Conteúdo:**
- 1 usuário sandbox
- Categorias básicas de sistema
- 1 conta padrão
- ~15 transações de exemplo
- 2 metas financeiras
- 2 relatórios de exemplo
- 4 alertas

**Uso:**
```bash
npm run db:seed
```

### 2. `seed-realistic.ts` - Seed Completo e Realístico ⭐ (RECOMENDADO)
Seed completo com dados realísticos para testes abrangentes e demonstrações.

**Conteúdo:**

#### 👤 Usuário
- **Email:** sandbox@financeserver.dev
- **Senha:** sandbox
- **Nome:** Henrique Santos
- **Telefone:** +5511987654321

#### 📊 Categorias
- **19 Templates de categorias** (sistema global)
- **19 Categorias de usuário** (arquitetura híbrida)
- **4 Categorias legacy** (compatibilidade com budgets)

**Categorias de Receita:**
- Salário, Freelance, Investimentos, Bônus, Aluguel Recebido

**Categorias de Despesa:**
- Alimentação, Transporte, Moradia, Saúde, Educação
- Lazer, Compras, Serviços, Vestuário, Beleza
- Pet, Seguros, Impostos, Outros

#### 🏦 Contas Bancárias (5)
| Conta | Tipo | Saldo Inicial | Cor |
|-------|------|---------------|-----|
| Banco Caixa | Corrente | R$ 100,81 | Azul |
| Banco Inter | Corrente | R$ 0,01 | Laranja |
| Banco Itaú | Corrente | R$ 3.272,33 | Laranja escuro |
| Carteira | Dinheiro | R$ 30,00 | Verde |
| Mercado Pago | Digital | R$ 0,01 | Azul claro |

#### 💳 Cartões de Crédito (4)
| Cartão | Limite | Saldo Usado | % Utilizado |
|--------|--------|-------------|-------------|
| Cartão Inter | R$ 969,96 | R$ 153,01 | 15.8% |
| Pão de Açúcar | R$ 984,59 | R$ 633,12 | 64.3% |
| Personallite Black | R$ 53.725,00 | R$ 1.987,73 | 3.7% |
| Latam Black | R$ 14.903,90 | R$ 2.182,76 | 14.6% |

#### 💰 Transações (447 total)

**Distribuição por Tipo:**
- 📥 **Receitas:** ~30 transações
  - Salário mensal (12x)
  - Freelance esporádico (7x)
  - Investimentos trimestrais (4x)
  - Bônus (2x)

- 📤 **Despesas Fixas:** ~180 transações
  - Aluguel mensal (R$ 1.800)
  - Contas (luz, água, gás, internet)
  - Plano de saúde (R$ 450)
  - Academia (R$ 79,90)
  - Telefone (R$ 89,90)
  - Assinaturas digitais (Netflix, Spotify, Amazon Prime, YouTube, iCloud)

- 📤 **Despesas Variáveis:** ~230 transações
  - Supermercado semanal (R$ 200-450)
  - Transporte (Uber, gasolina)
  - Restaurantes e delivery (iFood, Rappi) - ~60x
  - Café e lanches (Starbucks, padarias) - ~40x
  - Compras online (Amazon, Mercado Livre) - ~16x
  - Lazer (cinema, shows, bares)
  - Saúde (farmácia, médico)
  - Pet (ração, vet) - ~6x
  - Beleza (cabeleleiro, manicure) - ~24x
  - Vestuário (Zara, Renner, Nike) - ~15x
  - Educação (cursos online) - ~4x

- 🔄 **Transferências:** 4 transações
  - Entre contas do mesmo titular

- 💸 **Despesas Especiais:**
  - Seguros (automóvel) - 2x/ano
  - Impostos (IPVA, IPTU)
  - Presentes (Natal, aniversários)

**Período:** 12 meses (Outubro 2024 - Setembro 2025)

#### 🎯 Metas Financeiras (4)
| Meta | Valor Alvo | Valor Atual | Progresso | Data Alvo |
|------|------------|-------------|-----------|-----------|
| Reserva de Emergência | R$ 35.000 | R$ 12.450 | 35.6% | Jun/2026 |
| Viagem para Europa | R$ 15.000 | R$ 4.200 | 28.0% | Dez/2025 |
| Carro Novo | R$ 25.000 | R$ 8.750 | 35.0% | Mar/2026 |
| MBA | R$ 28.000 | R$ 3.200 | 11.4% | Ago/2026 |

#### 💰 Orçamentos Mensais (4)
| Categoria | Limite Mensal | Descrição |
|-----------|---------------|-----------|
| Alimentação | R$ 1.500 | Supermercado, restaurantes |
| Transporte | R$ 800 | Uber, gasolina, manutenção |
| Lazer | R$ 600 | Entretenimento, streaming |
| Compras | R$ 500 | Compras online, vestuário |

#### 🚨 Alertas Inteligentes (4)
- ⚠️ Orçamento de alimentação excedido (15%)
- 💰 Saldo baixo - Banco Caixa
- 🎉 Meta de viagem alcançou 25%
- 💵 Renda de freelance recebida

**Uso:**
```bash
npm run db:seed:realistic
```

## 🔄 Como Resetar e Popular o Banco

### Opção 1: Reset Completo (RECOMENDADO)
Apaga todos os dados e recria o banco com o seed realístico:

```bash
cd backend
npx prisma migrate reset --force
```

Isso irá:
1. ✅ Dropar o banco de dados
2. ✅ Recriar o banco de dados
3. ✅ Aplicar todas as migrações
4. ✅ Executar o seed configurado (seed-realistic.ts)

### Opção 2: Seed Manual
Se você só quer rodar o seed sem resetar:

```bash
# Seed básico
npm run db:seed

# Seed realístico
npm run db:seed:realistic
```

⚠️ **ATENÇÃO:** Rodar o seed manualmente sem resetar pode causar erros de chave duplicada se os dados já existirem.

## 📊 Prisma Studio

Para visualizar os dados no banco:

```bash
npm run db:studio
```

Abre interface visual em: http://localhost:5555

## 🔐 Credenciais de Acesso

Após executar qualquer seed:

- **Email:** sandbox@financeserver.dev
- **Senha:** sandbox

## 🎨 Casos de Uso

### Para Desenvolvimento
Use `seed-realistic.ts` para:
- ✅ Testar dashboards com dados reais
- ✅ Validar cálculos financeiros
- ✅ Testar filtros e buscas
- ✅ Visualizar gráficos com dados variados
- ✅ Testar relatórios e exportações
- ✅ Demonstrações para clientes

### Para Testes Unitários
Use `seed.ts` para:
- ✅ Testes rápidos
- ✅ Dados mínimos necessários
- ✅ CI/CD pipelines

## 📝 Estrutura dos Seeds

```typescript
// seed-realistic.ts
1. Criar usuário sandbox
2. Criar templates de categorias (sistema)
3. Criar categorias de usuário (híbrido)
4. Criar categorias legacy (compatibilidade)
5. Criar contas bancárias e cartões de crédito
6. Criar 447 transações realísticas
7. Criar metas financeiras
8. Criar orçamentos mensais
9. Criar alertas inteligentes
```

## 🚀 Melhorias Futuras

- [ ] Seed com múltiplos usuários
- [ ] Seed com dados de anos anteriores
- [ ] Seed com transações recorrentes automatizadas
- [ ] Seed com dados de investimentos
- [ ] Seed com múltiplas moedas
- [ ] Seed com dados de empresas (B2B)

## 📚 Recursos Adicionais

- [Prisma Seeding Docs](https://www.prisma.io/docs/guides/database/seed-database)
- [Prisma Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)

---

**Última atualização:** Outubro 2025
**Versão do seed:** 2.0 (447 transações)
