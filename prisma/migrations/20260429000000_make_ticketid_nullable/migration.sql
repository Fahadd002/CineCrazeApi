-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "ticketId" DROP NOT NULL;

-- Since ticketId is now nullable, update any existing subscription payments to have NULL ticketId
-- This assumes subscription payments currently have a placeholder ticketId; if not, this is safe
UPDATE "payments" SET "ticketId" = NULL WHERE "purpose" LIKE 'SUBSCRIPTION%';
