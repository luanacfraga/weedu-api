/*
  Warnings:

  - The values [TODO,DONE] on the enum `ActionStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [TODO,DONE] on the enum `TaskStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ActionStatus_new" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');
ALTER TABLE "Action" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Action" ALTER COLUMN "status" TYPE "ActionStatus_new" USING ("status"::text::"ActionStatus_new");
ALTER TYPE "ActionStatus" RENAME TO "ActionStatus_old";
ALTER TYPE "ActionStatus_new" RENAME TO "ActionStatus";
DROP TYPE "ActionStatus_old";
ALTER TABLE "Action" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TaskStatus_new" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');
ALTER TYPE "TaskStatus" RENAME TO "TaskStatus_old";
ALTER TYPE "TaskStatus_new" RENAME TO "TaskStatus";
DROP TYPE "TaskStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "Action" ALTER COLUMN "status" SET DEFAULT 'PENDING';
