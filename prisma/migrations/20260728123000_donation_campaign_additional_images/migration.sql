ALTER TABLE "DonationCampaign"
ADD COLUMN "additionalImageUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "additionalImagePublicIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
