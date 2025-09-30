#!/usr/bin/env tsx
/**
 * 🚀 MIGRATION SCRIPT: Legacy Categories → Hybrid Architecture
 *
 * Migra dados da tabela Category (legacy) para CategoryTemplate + UserCategory
 * Mantém integridade referencial e performance
 *
 * FASES DA MIGRAÇÃO:
 * 1. Criar CategoryTemplates padrão (sistema)
 * 2. Migrar Categories existentes para UserCategory
 * 3. Atualizar referências em Transaction e Budget
 * 4. Validar integridade dos dados
 * 5. Cleanup opcional (remover dados legacy)
 */

import { PrismaClient } from '@prisma/client'
import { promisify } from 'util'

interface MigrationStats {
  categoryTemplatesCreated: number
  userCategoriesMigrated: number
  transactionsUpdated: number
  budgetsUpdated: number
  errors: string[]
  startTime: Date
  endTime?: Date
}

interface CategoryTemplateData {
  name: string
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  description: string
  color: string
  icon: string
  isDefault: boolean
  sortOrder: number
}

class CategoryMigrationService {
  private prisma: PrismaClient
  private stats: MigrationStats

  constructor() {
    this.prisma = new PrismaClient({
      log: ['info', 'warn', 'error']
    })
    this.stats = {
      categoryTemplatesCreated: 0,
      userCategoriesMigrated: 0,
      transactionsUpdated: 0,
      budgetsUpdated: 0,
      errors: [],
      startTime: new Date()
    }
  }

  /**
   * Templates padrão do sistema
   */
  private getDefaultCategoryTemplates(): CategoryTemplateData[] {
    return [
      // INCOME Templates
      { name: 'Salário', type: 'INCOME', description: 'Renda do trabalho CLT', color: '#22c55e', icon: '💰', isDefault: true, sortOrder: 1 },
      { name: 'Freelance', type: 'INCOME', description: 'Trabalho autônomo e projetos', color: '#3b82f6', icon: '💼', isDefault: true, sortOrder: 2 },
      { name: 'Investimentos', type: 'INCOME', description: 'Rendimentos de investimentos', color: '#8b5cf6', icon: '📈', isDefault: true, sortOrder: 3 },
      { name: 'Vendas', type: 'INCOME', description: 'Venda de produtos ou serviços', color: '#06b6d4', icon: '💵', isDefault: false, sortOrder: 4 },
      { name: 'Prêmios', type: 'INCOME', description: 'Prêmios e bonificações', color: '#f59e0b', icon: '🎁', isDefault: false, sortOrder: 5 },
      { name: 'Outros Rendimentos', type: 'INCOME', description: 'Outras fontes de renda', color: '#10b981', icon: '💳', isDefault: true, sortOrder: 6 },

      // EXPENSE Templates
      { name: 'Alimentação', type: 'EXPENSE', description: 'Supermercado, restaurantes e delivery', color: '#ef4444', icon: '🍽️', isDefault: true, sortOrder: 1 },
      { name: 'Transporte', type: 'EXPENSE', description: 'Combustível, transporte público, uber', color: '#f97316', icon: '🚗', isDefault: true, sortOrder: 2 },
      { name: 'Moradia', type: 'EXPENSE', description: 'Aluguel, financiamento, condomínio', color: '#16a34a', icon: '🏠', isDefault: true, sortOrder: 3 },
      { name: 'Contas e Utilidades', type: 'EXPENSE', description: 'Luz, água, internet, telefone', color: '#dc2626', icon: '⚡', isDefault: true, sortOrder: 4 },
      { name: 'Saúde', type: 'EXPENSE', description: 'Plano de saúde, medicamentos, consultas', color: '#059669', icon: '🏥', isDefault: true, sortOrder: 5 },
      { name: 'Educação', type: 'EXPENSE', description: 'Cursos, livros, mensalidades', color: '#0ea5e9', icon: '📚', isDefault: true, sortOrder: 6 },
      { name: 'Lazer e Entretenimento', type: 'EXPENSE', description: 'Cinema, jogos, streaming, hobbies', color: '#8b5cf6', icon: '🎬', isDefault: true, sortOrder: 7 },
      { name: 'Compras', type: 'EXPENSE', description: 'Roupas, eletrônicos, presentes', color: '#ec4899', icon: '🛒', isDefault: true, sortOrder: 8 },
      { name: 'Viagens', type: 'EXPENSE', description: 'Passagens, hospedagem, turismo', color: '#7c3aed', icon: '✈️', isDefault: false, sortOrder: 9 },
      { name: 'Cuidados Pessoais', type: 'EXPENSE', description: 'Salão, cosméticos, academia', color: '#db2777', icon: '💅', isDefault: false, sortOrder: 10 },
      { name: 'Pets', type: 'EXPENSE', description: 'Ração, veterinário, pet shop', color: '#f59e0b', icon: '🐕', isDefault: false, sortOrder: 11 },
      { name: 'Outros Gastos', type: 'EXPENSE', description: 'Despesas diversas', color: '#6b7280', icon: '📂', isDefault: true, sortOrder: 12 },

      // TRANSFER Template
      { name: 'Transferência', type: 'TRANSFER', description: 'Transferência entre contas', color: '#4f46e5', icon: '↔️', isDefault: true, sortOrder: 1 }
    ]
  }

  /**
   * FASE 1: Criar CategoryTemplates padrão
   */
  async createCategoryTemplates(): Promise<void> {
    console.log('📋 FASE 1: Criando CategoryTemplates padrão...')

    const templates = this.getDefaultCategoryTemplates()

    for (const template of templates) {
      try {
        // Verificar se já existe
        const existing = await this.prisma.categoryTemplate.findFirst({
          where: { name: template.name, type: template.type }
        })

        if (!existing) {
          await this.prisma.categoryTemplate.create({
            data: {
              name: template.name,
              type: template.type,
              description: template.description,
              color: template.color,
              icon: template.icon,
              isDefault: template.isDefault,
              isSystem: true,
              sortOrder: template.sortOrder,
              tags: []
            }
          })
          this.stats.categoryTemplatesCreated++
          console.log(`  ✅ Template criado: ${template.name}`)
        } else {
          console.log(`  ⚠️  Template já existe: ${template.name}`)
        }
      } catch (error) {
        const errorMsg = `Erro ao criar template ${template.name}: ${error.message}`
        this.stats.errors.push(errorMsg)
        console.error(`  ❌ ${errorMsg}`)
      }
    }

    console.log(`📊 Templates criados: ${this.stats.categoryTemplatesCreated}`)
  }

  /**
   * FASE 2: Migrar Categories existentes para UserCategory
   */
  async migrateLegacyCategories(): Promise<void> {
    console.log('🔄 FASE 2: Migrando Categories existentes...')

    // Buscar todas as categorias existentes
    const legacyCategories = await this.prisma.category.findMany({
      include: {
        user: true
      },
      orderBy: { createdAt: 'asc' }
    })

    console.log(`📝 Encontradas ${legacyCategories.length} categorias para migrar`)

    for (const category of legacyCategories) {
      try {
        // Buscar template correspondente (por nome e tipo)
        const matchingTemplate = await this.prisma.categoryTemplate.findFirst({
          where: {
            name: category.name,
            type: category.type
          }
        })

        // Verificar se já foi migrada
        const existingUserCategory = await this.prisma.userCategory.findFirst({
          where: {
            userId: category.userId,
            name: category.name
          }
        })

        if (existingUserCategory) {
          console.log(`  ⚠️  Já migrada: ${category.name} (User: ${category.user.email})`)
          continue
        }

        // Criar UserCategory
        await this.prisma.userCategory.create({
          data: {
            userId: category.userId,
            categoryTemplateId: matchingTemplate?.id || null, // null = categoria própria
            name: category.name,
            description: category.description,
            type: category.type,
            color: category.color,
            icon: category.icon,
            parentCategoryId: null, // Será implementado na próxima fase se necessário
            status: category.status,
            isActive: category.status === 'ACTIVE',
            isCustom: !matchingTemplate, // true se não tem template correspondente
            isDefault: category.isDefault,
            sortOrder: null,
            tags: category.tags || [],
            metadata: category.metadata
          }
        })

        this.stats.userCategoriesMigrated++
        console.log(`  ✅ Migrada: ${category.name} → ${matchingTemplate ? 'baseada em template' : 'categoria própria'}`)

      } catch (error) {
        const errorMsg = `Erro ao migrar categoria ${category.name}: ${error.message}`
        this.stats.errors.push(errorMsg)
        console.error(`  ❌ ${errorMsg}`)
      }
    }

    console.log(`📊 Categorias migradas: ${this.stats.userCategoriesMigrated}`)
  }

  /**
   * FASE 3A: Atualizar referências em Transaction
   */
  async updateTransactionReferences(): Promise<void> {
    console.log('🔗 FASE 3A: Atualizando referências em Transaction...')

    // Buscar transações que ainda usam categoryId (legacy)
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userCategoryId: null // Ainda não migradas
      },
      include: {
        category: true,
        user: true
      }
    })

    console.log(`📝 Encontradas ${transactions.length} transações para atualizar`)

    for (const transaction of transactions) {
      try {
        // Buscar UserCategory correspondente
        const userCategory = await this.prisma.userCategory.findFirst({
          where: {
            userId: transaction.userId,
            name: transaction.category.name
          }
        })

        if (userCategory) {
          await this.prisma.transaction.update({
            where: { id: transaction.id },
            data: { userCategoryId: userCategory.id }
          })

          this.stats.transactionsUpdated++

          if (this.stats.transactionsUpdated % 100 === 0) {
            console.log(`  📊 Transações atualizadas: ${this.stats.transactionsUpdated}`)
          }
        } else {
          const errorMsg = `UserCategory não encontrada para transação ${transaction.id}`
          this.stats.errors.push(errorMsg)
          console.error(`  ❌ ${errorMsg}`)
        }

      } catch (error) {
        const errorMsg = `Erro ao atualizar transação ${transaction.id}: ${error.message}`
        this.stats.errors.push(errorMsg)
        console.error(`  ❌ ${errorMsg}`)
      }
    }

    console.log(`📊 Transações atualizadas: ${this.stats.transactionsUpdated}`)
  }

  /**
   * FASE 3B: Atualizar referências em Budget
   */
  async updateBudgetReferences(): Promise<void> {
    console.log('🔗 FASE 3B: Atualizando referências em Budget...')

    const budgets = await this.prisma.budget.findMany({
      where: {
        userCategoryId: null // Ainda não migrados
      },
      include: {
        category: true,
        user: true
      }
    })

    console.log(`📝 Encontrados ${budgets.length} budgets para atualizar`)

    for (const budget of budgets) {
      try {
        // Buscar UserCategory correspondente
        const userCategory = await this.prisma.userCategory.findFirst({
          where: {
            userId: budget.userId,
            name: budget.category.name
          }
        })

        if (userCategory) {
          await this.prisma.budget.update({
            where: { id: budget.id },
            data: { userCategoryId: userCategory.id }
          })

          this.stats.budgetsUpdated++
          console.log(`  ✅ Budget atualizado: ${budget.name}`)
        } else {
          const errorMsg = `UserCategory não encontrada para budget ${budget.id}`
          this.stats.errors.push(errorMsg)
          console.error(`  ❌ ${errorMsg}`)
        }

      } catch (error) {
        const errorMsg = `Erro ao atualizar budget ${budget.id}: ${error.message}`
        this.stats.errors.push(errorMsg)
        console.error(`  ❌ ${errorMsg}`)
      }
    }

    console.log(`📊 Budgets atualizados: ${this.stats.budgetsUpdated}`)
  }

  /**
   * FASE 4: Validar integridade dos dados
   */
  async validateDataIntegrity(): Promise<boolean> {
    console.log('🔍 FASE 4: Validando integridade dos dados...')

    try {
      // Verificar se todas as transações têm userCategoryId
      const transactionsWithoutUserCategory = await this.prisma.transaction.count({
        where: { userCategoryId: null }
      })

      // Verificar se todos os budgets têm userCategoryId
      const budgetsWithoutUserCategory = await this.prisma.budget.count({
        where: { userCategoryId: null }
      })

      // Verificar orphans (userCategories com userId inválido)
      const allUserCategories = await this.prisma.userCategory.findMany({
        select: { id: true, userId: true }
      })

      let orphanUserCategories = 0
      for (const userCategory of allUserCategories) {
        const userExists = await this.prisma.user.findUnique({
          where: { id: userCategory.userId },
          select: { id: true }
        })
        if (!userExists) {
          orphanUserCategories++
        }
      }

      console.log(`📊 Validação:`)
      console.log(`  - Transações sem userCategoryId: ${transactionsWithoutUserCategory}`)
      console.log(`  - Budgets sem userCategoryId: ${budgetsWithoutUserCategory}`)
      console.log(`  - UserCategories órfãs: ${orphanUserCategories}`)

      const isValid = transactionsWithoutUserCategory === 0 &&
                     budgetsWithoutUserCategory === 0 &&
                     orphanUserCategories === 0

      if (isValid) {
        console.log('✅ Integridade dos dados validada com sucesso!')
      } else {
        console.log('❌ Problemas de integridade encontrados!')
      }

      return isValid

    } catch (error) {
      console.error('❌ Erro na validação de integridade:', error.message)
      return false
    }
  }

  /**
   * Executar migração completa
   */
  async migrate(options: { skipTemplates?: boolean; validateOnly?: boolean } = {}): Promise<void> {
    console.log('🚀 INICIANDO MIGRAÇÃO HÍBRIDA DE CATEGORIAS')
    console.log('=' .repeat(60))

    try {
      if (!options.validateOnly) {
        if (!options.skipTemplates) {
          await this.createCategoryTemplates()
        }

        await this.migrateLegacyCategories()
        await this.updateTransactionReferences()
        await this.updateBudgetReferences()
      }

      const isValid = await this.validateDataIntegrity()

      this.stats.endTime = new Date()
      const duration = this.stats.endTime.getTime() - this.stats.startTime.getTime()

      console.log('=' .repeat(60))
      console.log('📊 RELATÓRIO FINAL DA MIGRAÇÃO')
      console.log('=' .repeat(60))
      console.log(`⏱️  Duração: ${Math.round(duration / 1000)}s`)
      console.log(`📋 Templates criados: ${this.stats.categoryTemplatesCreated}`)
      console.log(`🔄 Categorias migradas: ${this.stats.userCategoriesMigrated}`)
      console.log(`🔗 Transações atualizadas: ${this.stats.transactionsUpdated}`)
      console.log(`💰 Budgets atualizados: ${this.stats.budgetsUpdated}`)
      console.log(`❌ Erros: ${this.stats.errors.length}`)
      console.log(`✅ Integridade: ${isValid ? 'OK' : 'FALHOU'}`)

      if (this.stats.errors.length > 0) {
        console.log('\n❌ ERROS ENCONTRADOS:')
        this.stats.errors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error}`)
        })
      }

      console.log('\n🎉 MIGRAÇÃO CONCLUÍDA!')

    } catch (error) {
      console.error('💥 ERRO FATAL NA MIGRAÇÃO:', error.message)
      throw error
    } finally {
      await this.prisma.$disconnect()
    }
  }
}

// Execução do script
async function main() {
  const args = process.argv.slice(2)
  const options = {
    skipTemplates: args.includes('--skip-templates'),
    validateOnly: args.includes('--validate-only')
  }

  const migrationService = new CategoryMigrationService()
  await migrationService.migrate(options)
}

// Executar se chamado diretamente
if (require.main === module) {
  main().catch(console.error)
}

export { CategoryMigrationService }