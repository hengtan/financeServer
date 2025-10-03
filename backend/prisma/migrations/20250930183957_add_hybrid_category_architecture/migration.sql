-- AlterTable
ALTER TABLE "budgets" ADD COLUMN     "userCategoryId" TEXT;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "userCategoryId" TEXT;

-- CreateTable
CREATE TABLE "category_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CategoryType" NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isSystem" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER,
    "tags" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_categories" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "categoryTemplateId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "CategoryType" NOT NULL,
    "color" TEXT,
    "icon" TEXT,
    "parentCategoryId" TEXT,
    "status" "CategoryStatus" NOT NULL DEFAULT 'ACTIVE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER,
    "tags" TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "category_templates_type_idx" ON "category_templates"("type");

-- CreateIndex
CREATE INDEX "category_templates_isDefault_idx" ON "category_templates"("isDefault");

-- CreateIndex
CREATE INDEX "category_templates_isSystem_idx" ON "category_templates"("isSystem");

-- CreateIndex
CREATE INDEX "category_templates_sortOrder_idx" ON "category_templates"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "category_templates_name_type_key" ON "category_templates"("name", "type");

-- CreateIndex
CREATE INDEX "user_categories_userId_idx" ON "user_categories"("userId");

-- CreateIndex
CREATE INDEX "user_categories_userId_type_idx" ON "user_categories"("userId", "type");

-- CreateIndex
CREATE INDEX "user_categories_userId_status_idx" ON "user_categories"("userId", "status");

-- CreateIndex
CREATE INDEX "user_categories_userId_isActive_idx" ON "user_categories"("userId", "isActive");

-- CreateIndex
CREATE INDEX "user_categories_categoryTemplateId_idx" ON "user_categories"("categoryTemplateId");

-- CreateIndex
CREATE INDEX "user_categories_parentCategoryId_idx" ON "user_categories"("parentCategoryId");

-- CreateIndex
CREATE INDEX "user_categories_type_isActive_idx" ON "user_categories"("type", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "user_categories_userId_name_key" ON "user_categories"("userId", "name");

-- CreateIndex
CREATE INDEX "budgets_userCategoryId_idx" ON "budgets"("userCategoryId");

-- CreateIndex
CREATE INDEX "transactions_userCategoryId_idx" ON "transactions"("userCategoryId");

-- CreateIndex
CREATE INDEX "transactions_userCategoryId_date_idx" ON "transactions"("userCategoryId", "date");

-- AddForeignKey
ALTER TABLE "user_categories" ADD CONSTRAINT "user_categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_categories" ADD CONSTRAINT "user_categories_categoryTemplateId_fkey" FOREIGN KEY ("categoryTemplateId") REFERENCES "category_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_categories" ADD CONSTRAINT "user_categories_parentCategoryId_fkey" FOREIGN KEY ("parentCategoryId") REFERENCES "user_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userCategoryId_fkey" FOREIGN KEY ("userCategoryId") REFERENCES "user_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_userCategoryId_fkey" FOREIGN KEY ("userCategoryId") REFERENCES "user_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
