ALTER TABLE "DonationCampaign"
ADD COLUMN "invoiceImageUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "invoiceImagePublicIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
