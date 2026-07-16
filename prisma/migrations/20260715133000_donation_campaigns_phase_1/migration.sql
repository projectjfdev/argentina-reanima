-- CreateEnum
CREATE TYPE "DonationCampaignStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "DonationCampaign" (
    "id" SERIAL NOT NULL,
    "institutionName" TEXT NOT NULL,
    "locality" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "placeImageUrl" TEXT NOT NULL,
    "placeImagePublicId" TEXT NOT NULL,
    "goalAmount" DECIMAL(14,2) NOT NULL,
    "status" "DonationCampaignStatus" NOT NULL DEFAULT 'ACTIVE',
    "completedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DonationCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" SERIAL NOT NULL,
    "campaignId" INTEGER NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "isAnonymous" BOOLEAN NOT NULL DEFAULT true,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "status" "DonationStatus" NOT NULL DEFAULT 'PENDING',
    "receiptUrl" TEXT,
    "receiptPublicId" TEXT NOT NULL,
    "receiptResourceType" TEXT NOT NULL,
    "receiptOriginalName" TEXT,
    "receiptBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DonationCampaign_status_idx" ON "DonationCampaign"("status");

-- CreateIndex
CREATE INDEX "DonationCampaign_createdAt_idx" ON "DonationCampaign"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DonationCampaign_single_active_idx" ON "DonationCampaign"("status") WHERE "status" = 'ACTIVE';

-- CreateIndex
CREATE INDEX "Donation_campaignId_status_createdAt_idx" ON "Donation"("campaignId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "Donation_status_idx" ON "Donation"("status");

-- CreateIndex
CREATE INDEX "Donation_createdAt_idx" ON "Donation"("createdAt");

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "DonationCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
