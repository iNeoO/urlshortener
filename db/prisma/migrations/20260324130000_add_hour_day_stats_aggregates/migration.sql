-- CreateTable
CREATE TABLE "UrlHourCount" (
    "id" TEXT NOT NULL,
    "urlId" TEXT NOT NULL,
    "window" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UrlHourCount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UrlDayCount" (
    "id" TEXT NOT NULL,
    "urlId" TEXT NOT NULL,
    "window" TIMESTAMP(3) NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UrlDayCount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UrlDimensionHourCount" (
    "id" TEXT NOT NULL,
    "urlId" TEXT NOT NULL,
    "window" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UrlDimensionHourCount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UrlDimensionDayCount" (
    "id" TEXT NOT NULL,
    "urlId" TEXT NOT NULL,
    "window" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UrlDimensionDayCount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UrlHourCount_urlId_window_key" ON "UrlHourCount"("urlId", "window");

-- CreateIndex
CREATE INDEX "UrlHourCount_urlId_window_idx" ON "UrlHourCount"("urlId", "window");

-- CreateIndex
CREATE INDEX "UrlHourCount_window_idx" ON "UrlHourCount"("window");

-- CreateIndex
CREATE UNIQUE INDEX "UrlDayCount_urlId_window_key" ON "UrlDayCount"("urlId", "window");

-- CreateIndex
CREATE INDEX "UrlDayCount_urlId_window_idx" ON "UrlDayCount"("urlId", "window");

-- CreateIndex
CREATE INDEX "UrlDayCount_window_idx" ON "UrlDayCount"("window");

-- CreateIndex
CREATE UNIQUE INDEX "UrlDimensionHourCount_urlId_window_type_value_key" ON "UrlDimensionHourCount"("urlId", "window", "type", "value");

-- CreateIndex
CREATE INDEX "UrlDimensionHourCount_urlId_type_window_idx" ON "UrlDimensionHourCount"("urlId", "type", "window");

-- CreateIndex
CREATE INDEX "UrlDimensionHourCount_window_type_idx" ON "UrlDimensionHourCount"("window", "type");

-- CreateIndex
CREATE UNIQUE INDEX "UrlDimensionDayCount_urlId_window_type_value_key" ON "UrlDimensionDayCount"("urlId", "window", "type", "value");

-- CreateIndex
CREATE INDEX "UrlDimensionDayCount_urlId_type_window_idx" ON "UrlDimensionDayCount"("urlId", "type", "window");

-- CreateIndex
CREATE INDEX "UrlDimensionDayCount_window_type_idx" ON "UrlDimensionDayCount"("window", "type");

-- AddForeignKey
ALTER TABLE "UrlHourCount" ADD CONSTRAINT "UrlHourCount_urlId_fkey" FOREIGN KEY ("urlId") REFERENCES "Url"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UrlDayCount" ADD CONSTRAINT "UrlDayCount_urlId_fkey" FOREIGN KEY ("urlId") REFERENCES "Url"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UrlDimensionHourCount" ADD CONSTRAINT "UrlDimensionHourCount_urlId_fkey" FOREIGN KEY ("urlId") REFERENCES "Url"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UrlDimensionDayCount" ADD CONSTRAINT "UrlDimensionDayCount_urlId_fkey" FOREIGN KEY ("urlId") REFERENCES "Url"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
