CREATE TABLE "platform_settings" (
    "id" TEXT NOT NULL,
    "googleTagManagerId" TEXT,
    "googleAnalyticsMeasurementId" TEXT,
    "metaPixelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);
