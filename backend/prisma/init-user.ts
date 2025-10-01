import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initExistingUser() {
  const user = await prisma.user.findUnique({ where: { email: 'Hengtan@live.com' } });
  if (!user) {
    console.log('❌ User not found');
    process.exit(1);
  }

  console.log(`🎯 Initializing resources for ${user.email}...`);

  // 1. Check if already has categories
  const existingCategories = await prisma.userCategory.count({ where: { userId: user.id } });

  if (existingCategories > 0) {
    console.log(`✅ User already has ${existingCategories} categories, skipping...`);
  } else {
    // Create UserCategories from templates
    const templates = await prisma.categoryTemplate.findMany({ where: { isDefault: true } });
    console.log(`📋 Creating ${templates.length} categories...`);

    for (const template of templates) {
      await prisma.userCategory.create({
        data: {
          userId: user.id,
          categoryTemplateId: template.id,
          name: template.name,
          type: template.type,
          color: template.color,
          icon: template.icon,
          isActive: true,
          isCustom: false,
          tags: template.tags || []
        }
      });
    }
    console.log(`✅ Created ${templates.length} user categories`);
  }

  // 2. Check if already has account
  const existingAccounts = await prisma.account.count({ where: { userId: user.id } });

  if (existingAccounts > 0) {
    console.log(`✅ User already has ${existingAccounts} accounts, skipping...`);
  } else {
    // Create default account
    await prisma.account.create({
      data: {
        userId: user.id,
        name: 'Conta Principal',
        type: 'CHECKING',
        balance: 0,
        currency: 'BRL',
        status: 'ACTIVE',
        isDefault: true,
        description: 'Conta criada automaticamente'
      }
    });
    console.log(`✅ Created default account`);
  }

  console.log(`✅ Resources initialized for ${user.email}!`);
  await prisma.$disconnect();
}

initExistingUser().catch(console.error);
