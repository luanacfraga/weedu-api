-- CreateEnum
CREATE TYPE "NotificationPreference" AS ENUM ('sms_only', 'whatsapp_only', 'both');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "notification_preference" "NotificationPreference" NOT NULL DEFAULT 'both';
