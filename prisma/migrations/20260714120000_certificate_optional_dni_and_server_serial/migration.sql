UPDATE "Certificate"
SET "recipientDni" = NULL
WHERE "recipientDni" = '';

ALTER TABLE "Certificate" ALTER COLUMN "recipientDni" DROP NOT NULL;
