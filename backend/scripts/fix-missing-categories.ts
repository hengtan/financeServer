#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixMissingCategories() {
  console.log('🔧 Corrigindo categorias faltantes...')

  // Buscar transações sem userCategoryId
  const transactionsWithoutUserCategory = await prisma.transaction.findMany({
    where: { userCategoryId: null },
    include: {
      category: true,
      user: true
    }
  })

  for (const transaction of transactionsWithoutUserCategory) {
    console.log(`\n🔍 Processando transação: ${transaction.description}`)
    console.log(`   Usuário: ${transaction.user.email}`)
    console.log(`   Categoria: ${transaction.category.name}`)

    // Verificar se já existe UserCategory
    let userCategory = await prisma.userCategory.findFirst({
      where: {
        userId: transaction.userId,
        name: transaction.category.name
      }
    })

    if (!userCategory) {
      console.log(`   ⚠️  UserCategory não existe, criando...`)

      // Buscar template correspondente
      const template = await prisma.categoryTemplate.findFirst({
        where: {
          name: transaction.category.name,
          type: transaction.category.type
        }
      })

      // Criar UserCategory
      userCategory = await prisma.userCategory.create({
        data: {
          userId: transaction.userId,
          categoryTemplateId: template?.id || null,
          name: transaction.category.name,
          description: transaction.category.description,
          type: transaction.category.type,
          color: transaction.category.color,
          icon: transaction.category.icon,
          status: transaction.category.status,
          isActive: transaction.category.status === 'ACTIVE',
          isCustom: !template,
          isDefault: transaction.category.isDefault,
          tags: transaction.category.tags || []
        }
      })

      console.log(`   ✅ UserCategory criada: ${userCategory.id}`)
    }

    // Atualizar transação
    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { userCategoryId: userCategory.id }
    })

    console.log(`   ✅ Transação atualizada`)
  }

  console.log('\n🎉 Correção concluída!')
  await prisma.$disconnect()
}

fixMissingCategories().catch(console.error)