-- CreateTable
CREATE TABLE "platform_settings" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "support_whatsapp" TEXT,
    "support_email" TEXT,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);
