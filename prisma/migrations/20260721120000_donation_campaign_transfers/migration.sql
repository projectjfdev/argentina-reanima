CREATE TABLE "DonationCampaignTransfer" (
    "id" SERIAL NOT NULL,
    "sourceCampaignId" INTEGER NOT NULL,
    "targetCampaignId" INTEGER,
    "amount" DECIMAL(14,2) NOT NULL,
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DonationCampaignTransfer_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "DonationCampaignTransfer_amount_check" CHECK ("amount" >= 0),
    CONSTRAINT "DonationCampaignTransfer_distinct_campaigns_check" CHECK ("targetCampaignId" IS NULL OR "sourceCampaignId" <> "targetCampaignId")
);

CREATE UNIQUE INDEX "DonationCampaignTransfer_sourceCampaignId_key" ON "DonationCampaignTransfer"("sourceCampaignId");
CREATE INDEX "DonationCampaignTransfer_targetCampaignId_idx" ON "DonationCampaignTransfer"("targetCampaignId");

ALTER TABLE "DonationCampaignTransfer" ADD CONSTRAINT "DonationCampaignTransfer_sourceCampaignId_fkey" FOREIGN KEY ("sourceCampaignId") REFERENCES "DonationCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DonationCampaignTransfer" ADD CONSTRAINT "DonationCampaignTransfer_targetCampaignId_fkey" FOREIGN KEY ("targetCampaignId") REFERENCES "DonationCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
