-- CreateEnum
CREATE TYPE "ResourceStatus" AS ENUM ('active', 'inactive', 'pending');

-- CreateTable
CREATE TABLE "resources" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "status" "ResourceStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resources_created_at_idx" ON "resources"("created_at" DESC);

-- CreateIndex
CREATE INDEX "resources_status_idx" ON "resources"("status");
