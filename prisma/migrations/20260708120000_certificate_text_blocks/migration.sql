-- Drop old structured certificate fields and replace them with text blocks.
-- Data preservation is intentionally not required for this development refactor.
ALTER TABLE "Certificate"
  DROP COLUMN "courseName",
  DROP COLUMN "location",
  DROP COLUMN "issuedDate",
  DROP COLUMN "duration",
  DROP COLUMN "clarificationText",
  ADD COLUMN "certificateText" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "footerText" TEXT NOT NULL DEFAULT '';

ALTER TABLE "Certificate"
  ALTER COLUMN "certificateText" DROP DEFAULT,
  ALTER COLUMN "footerText" DROP DEFAULT;
