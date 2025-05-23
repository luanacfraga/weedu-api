/*
  Warnings:

  - The values [CONSULTANT] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `ConsultantCompany` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `cost` to the `AISuggestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `model` to the `AISuggestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `Company` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "KanbanColumn" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('MASTER', 'ADMIN', 'MANAGER', 'COLLABORATOR');
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "ConsultantCompany" DROP CONSTRAINT "ConsultantCompany_companyId_fkey";

-- DropForeignKey
ALTER TABLE "ConsultantCompany" DROP CONSTRAINT "ConsultantCompany_consultantId_fkey";

-- AlterTable
ALTER TABLE "AISuggestion" ADD COLUMN     "cacheKey" TEXT,
ADD COLUMN     "cost" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "isCached" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "model" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "ownerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "priority" "ActionPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "startedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "ConsultantCompany";

-- CreateTable
CREATE TABLE "CompanyAICredits" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "totalCredits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "usedCredits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dailyUsage" INTEGER NOT NULL DEFAULT 0,
    "lastDailyReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyAICredits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KanbanOrder" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "column" "KanbanColumn" NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastMovedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "KanbanOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskMovement" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "fromColumn" "KanbanColumn" NOT NULL,
    "toColumn" "KanbanColumn" NOT NULL,
    "movedById" TEXT NOT NULL,
    "movedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeSpent" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollaboratorPerformance" (
    "id" TEXT NOT NULL,
    "collaboratorId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "period" TIMESTAMP(3) NOT NULL,
    "totalTasks" INTEGER NOT NULL DEFAULT 0,
    "completedTasks" INTEGER NOT NULL DEFAULT 0,
    "averageTimeSpent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "onTimeDelivery" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollaboratorPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompanyAICredits_companyId_key" ON "CompanyAICredits"("companyId");

-- CreateIndex
CREATE INDEX "ChecklistItem_actionId_order_idx" ON "ChecklistItem"("actionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "KanbanOrder_taskId_key" ON "KanbanOrder"("taskId");

-- CreateIndex
CREATE INDEX "KanbanOrder_column_position_idx" ON "KanbanOrder"("column", "position");

-- CreateIndex
CREATE INDEX "KanbanOrder_column_sortOrder_idx" ON "KanbanOrder"("column", "sortOrder");

-- CreateIndex
CREATE INDEX "KanbanOrder_column_lastMovedAt_idx" ON "KanbanOrder"("column", "lastMovedAt");

-- CreateIndex
CREATE INDEX "TaskMovement_taskId_movedAt_idx" ON "TaskMovement"("taskId", "movedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CollaboratorPerformance_collaboratorId_managerId_period_key" ON "CollaboratorPerformance"("collaboratorId", "managerId", "period");

-- CreateIndex
CREATE INDEX "AISuggestion_cacheKey_idx" ON "AISuggestion"("cacheKey");

-- CreateIndex
CREATE INDEX "Task_createdAt_idx" ON "Task"("createdAt");

-- CreateIndex
CREATE INDEX "Task_completedAt_idx" ON "Task"("completedAt");

-- CreateIndex
CREATE INDEX "Task_startedAt_idx" ON "Task"("startedAt");

-- CreateIndex
CREATE INDEX "Task_deadline_idx" ON "Task"("deadline");

-- AddForeignKey
ALTER TABLE "CompanyAICredits" ADD CONSTRAINT "CompanyAICredits_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KanbanOrder" ADD CONSTRAINT "KanbanOrder_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskMovement" ADD CONSTRAINT "TaskMovement_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskMovement" ADD CONSTRAINT "TaskMovement_movedById_fkey" FOREIGN KEY ("movedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaboratorPerformance" ADD CONSTRAINT "CollaboratorPerformance_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaboratorPerformance" ADD CONSTRAINT "CollaboratorPerformance_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
