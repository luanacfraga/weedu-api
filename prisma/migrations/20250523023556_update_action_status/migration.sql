/*
  Warnings:

  - The values [PENDING,COMPLETED] on the enum `ActionStatus` will be removed. If these variants are still used in the database, this will fail.

*/
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

-- AlterTable
ALTER TABLE "Action" ALTER COLUMN "status" SET DEFAULT 'TODO';

-- DropEnum
DROP TYPE "TaskStatus";
