/*
  Warnings:

  - The values [PENDING,COMPLETED,DELAYED] on the enum `ActionStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'PAID');

-- AlterEnum
BEGIN;
CREATE TYPE "ActionStatus_new" AS ENUM ('TO_START', 'TO_START_DELAYED', 'IN_PROGRESS', 'IN_PROGRESS_DELAYED', 'COMPLETED_ON_TIME', 'COMPLETED_DELAYED', 'PAUSED');
ALTER TABLE "Action" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Action" ALTER COLUMN "status" TYPE "ActionStatus_new" USING ("status"::text::"ActionStatus_new");
ALTER TYPE "ActionStatus" RENAME TO "ActionStatus_old";
ALTER TYPE "ActionStatus_new" RENAME TO "ActionStatus";
DROP TYPE "ActionStatus_old";
ALTER TABLE "Action" ALTER COLUMN "status" SET DEFAULT 'TO_START';
COMMIT;

-- AlterTable
ALTER TABLE "Action" ADD COLUMN     "actualEndDate" TIMESTAMP(3),
ADD COLUMN     "actualStartDate" TIMESTAMP(3),
ADD COLUMN     "checklist" TEXT,
ALTER COLUMN "status" SET DEFAULT 'TO_START';

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "actionCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "maxActions" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "plan" "PlanType" NOT NULL DEFAULT 'FREE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxCompanies" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "plan" "PlanType" NOT NULL DEFAULT 'FREE';
