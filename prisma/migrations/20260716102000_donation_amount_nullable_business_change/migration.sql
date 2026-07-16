-- Business change: public donors do not declare the donation amount.
-- Pending donations store receipt/contact data only. Admin review must set amount.
ALTER TABLE "Donation" ALTER COLUMN "amount" DROP NOT NULL;
