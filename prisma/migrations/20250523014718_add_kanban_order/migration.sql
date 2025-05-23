/*
  Warnings:

  - You are about to drop the column `taskId` on the `KanbanOrder` table. All the data in the column will be lost.
  - You are about to drop the `Task` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TaskMovement` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[actionId]` on the table `KanbanOrder` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `actionId` to the `KanbanOrder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "ActionPriority" ADD VALUE 'URGENT';

-- DropForeignKey
ALTER TABLE "KanbanOrder" DROP CONSTRAINT "KanbanOrder_taskId_fkey";

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_actionId_fkey";

-- DropForeignKey
ALTER TABLE "TaskMovement" DROP CONSTRAINT "TaskMovement_movedById_fkey";

-- DropForeignKey
ALTER TABLE "TaskMovement" DROP CONSTRAINT "TaskMovement_taskId_fkey";

-- DropIndex
DROP INDEX "KanbanOrder_taskId_key";

-- AlterTable
ALTER TABLE "KanbanOrder" DROP COLUMN "taskId",
ADD COLUMN     "actionId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Task";

-- DropTable
DROP TABLE "TaskMovement";

-- CreateTable
CREATE TABLE "ActionMovement" (
    "id" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "fromColumn" "KanbanColumn" NOT NULL,
    "toColumn" "KanbanColumn" NOT NULL,
    "movedById" TEXT NOT NULL,
    "movedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeSpent" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActionMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ActionMovement_actionId_movedAt_idx" ON "ActionMovement"("actionId", "movedAt");

-- CreateIndex
CREATE INDEX "Action_companyId_status_idx" ON "Action"("companyId", "status");

-- CreateIndex
CREATE INDEX "Action_responsibleId_idx" ON "Action"("responsibleId");

-- CreateIndex
CREATE INDEX "Action_createdAt_idx" ON "Action"("createdAt");

-- CreateIndex
CREATE INDEX "Action_actualStartDate_idx" ON "Action"("actualStartDate");

-- CreateIndex
CREATE INDEX "Action_actualEndDate_idx" ON "Action"("actualEndDate");

-- CreateIndex
CREATE INDEX "Action_estimatedStartDate_idx" ON "Action"("estimatedStartDate");

-- CreateIndex
CREATE INDEX "Action_estimatedEndDate_idx" ON "Action"("estimatedEndDate");

-- CreateIndex
CREATE UNIQUE INDEX "KanbanOrder_actionId_key" ON "KanbanOrder"("actionId");

-- AddForeignKey
ALTER TABLE "KanbanOrder" ADD CONSTRAINT "KanbanOrder_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionMovement" ADD CONSTRAINT "ActionMovement_movedById_fkey" FOREIGN KEY ("movedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionMovement" ADD CONSTRAINT "ActionMovement_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
