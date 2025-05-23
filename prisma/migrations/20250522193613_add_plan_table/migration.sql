/*
  Warnings:

  - The values [TO_START,TO_START_DELAYED,IN_PROGRESS_DELAYED,COMPLETED_ON_TIME,COMPLETED_DELAYED,PAUSED] on the enum `ActionStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `actionPlan` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `checklist` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `managerId` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `observation` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `problem` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `why` on the `Action` table. All the data in the column will be lost.
  - You are about to drop the column `actionCount` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `maxActions` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `plan` on the `Company` table. All the data in the column will be lost.
  - Added the required column `estimatedEndDate` to the `Action` table without a default value. This is not possible if the table is not empty.
  - Added the required column `estimatedStartDate` to the `Action` table without a default value. This is not possible if the table is not empty.
  - Added the required column `responsibleId` to the `Action` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planId` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planId` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ActionPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "PlanFeature" AS ENUM ('ACTIONS', 'COLLABORATORS', 'MANAGERS', 'AI_SUGGESTIONS');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- AlterEnum
BEGIN;
CREATE TYPE "ActionStatus_new" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');
ALTER TABLE "Action" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Action" ALTER COLUMN "status" TYPE "ActionStatus_new" USING ("status"::text::"ActionStatus_new");
ALTER TYPE "ActionStatus" RENAME TO "ActionStatus_old";
ALTER TYPE "ActionStatus_new" RENAME TO "ActionStatus";
DROP TYPE "ActionStatus_old";
ALTER TABLE "Action" ALTER COLUMN "status" SET DEFAULT 'TODO';
COMMIT;

-- DropForeignKey
ALTER TABLE "Action" DROP CONSTRAINT "Action_managerId_fkey";

-- AlterTable
ALTER TABLE "Action" DROP COLUMN "actionPlan",
DROP COLUMN "checklist",
DROP COLUMN "endDate",
DROP COLUMN "managerId",
DROP COLUMN "observation",
DROP COLUMN "problem",
DROP COLUMN "startDate",
DROP COLUMN "why",
ADD COLUMN     "blockedReason" TEXT,
ADD COLUMN     "estimatedEndDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "estimatedStartDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isBlocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isLate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priority" "ActionPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "responsibleId" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'TODO';

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "actionCount",
DROP COLUMN "maxActions",
DROP COLUMN "plan",
ADD COLUMN     "planId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "planId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "type" "PlanType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "features" "PlanFeature"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanLimit" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "feature" "PlanFeature" NOT NULL,
    "limit" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanLimit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyUsage" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "feature" "PlanFeature" NOT NULL,
    "currentUsage" INTEGER NOT NULL DEFAULT 0,
    "lastResetAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AISuggestion" (
    "id" TEXT NOT NULL,
    "actionId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "tokensUsed" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AISuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "completedAt" TIMESTAMP(3),
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "actionId" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanLimit_planId_feature_key" ON "PlanLimit"("planId", "feature");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyUsage_companyId_feature_key" ON "CompanyUsage"("companyId", "feature");

-- CreateIndex
CREATE INDEX "Task_actionId_status_order_idx" ON "Task"("actionId", "status", "order");

-- AddForeignKey
ALTER TABLE "PlanLimit" ADD CONSTRAINT "PlanLimit_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyUsage" ADD CONSTRAINT "CompanyUsage_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AISuggestion" ADD CONSTRAINT "AISuggestion_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "Action"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
