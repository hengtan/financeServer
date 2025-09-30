#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugProblematicTransactions() {
  const problematicIds = [
    'cmg6ve0p60005jle8okd09lga',
    'cmg6vr4f20007jle8vv9eg1rt'
  ]

  for (const id of problematicIds) {
    console.log(`\n🔍 Investigando transação: ${id}`)

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        category: true,
        user: true
      }
    })

    if (transaction) {
      console.log(`  📝 Descrição: ${transaction.description}`)
      console.log(`  👤 Usuário: ${transaction.user.email}`)
      console.log(`  📂 Categoria: ${transaction.category.name}`)
      console.log(`  🔑 Category ID: ${transaction.categoryId}`)

      // Verificar se existe UserCategory correspondente
      const userCategory = await prisma.userCategory.findFirst({
        where: {
          userId: transaction.userId,
          name: transaction.category.name
        }
      })

      if (userCategory) {
        console.log(`  ✅ UserCategory encontrada: ${userCategory.id}`)
      } else {
        console.log(`  ❌ UserCategory NÃO encontrada`)
        console.log(`     Tentando buscar por usuário: ${transaction.userId}`)

        const allUserCategoriesForUser = await prisma.userCategory.findMany({
          where: { userId: transaction.userId },
          select: { id: true, name: true }
        })

        console.log(`     UserCategories do usuário:`)
        allUserCategoriesForUser.forEach(uc => {
          console.log(`       - ${uc.name} (${uc.id})`)
        })
      }
    } else {
      console.log(`  ❌ Transação não encontrada`)
    }
  }

  await prisma.$disconnect()
}

debugProblematicTransactions().catch(console.error)