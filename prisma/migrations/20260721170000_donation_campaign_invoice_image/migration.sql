ALTER TABLE "DonationCampaign"
ADD COLUMN "invoiceImageUrl" TEXT,
ADD COLUMN "invoiceImagePublicId" TEXT,
ADD COLUMN "invoiceImageResourceType" VARCHAR(40),
ADD COLUMN "invoiceImageOriginalName" TEXT,
ADD COLUMN "invoiceImageBytes" INTEGER;
