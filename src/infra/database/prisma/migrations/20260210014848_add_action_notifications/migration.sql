-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('overdue_sms', 'overdue_whatsapp');

-- CreateTable
CREATE TABLE "action_notifications" (
    "id" TEXT NOT NULL,
    "action_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "notification_type" "NotificationType" NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sms_sent" BOOLEAN NOT NULL,
    "whatsapp_sent" BOOLEAN NOT NULL,
    "late_status" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "action_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "action_notifications_action_id_sent_at_idx" ON "action_notifications"("action_id", "sent_at" DESC);

-- CreateIndex
CREATE INDEX "action_notifications_user_id_sent_at_idx" ON "action_notifications"("user_id", "sent_at" DESC);

-- AddForeignKey
ALTER TABLE "action_notifications" ADD CONSTRAINT "action_notifications_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_notifications" ADD CONSTRAINT "action_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
