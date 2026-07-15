ALTER TABLE "Certificate"
  ADD COLUMN "instructorSignatureEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "instructorKey" VARCHAR(80);
