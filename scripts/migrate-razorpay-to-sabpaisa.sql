-- Run once when migrating from Razorpay to SabPaisa on an existing database.
-- PostgreSQL: rename enum value and drop old payment columns.

ALTER TYPE "PaymentMethod" RENAME VALUE 'RAZORPAY' TO 'SABPAISA';

ALTER TABLE "Order" RENAME COLUMN "razorpayOrderId" TO "sabpaisaPaymentId";
ALTER TABLE "Order" RENAME COLUMN "razorpayPaymentId" TO "sabpaisaTxnId";

-- If columns were already renamed manually, use instead:
-- ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "sabpaisaPaymentId" TEXT;
-- ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "sabpaisaTxnId" TEXT;
-- ALTER TABLE "Order" DROP COLUMN IF EXISTS "razorpayOrderId";
-- ALTER TABLE "Order" DROP COLUMN IF EXISTS "razorpayPaymentId";

CREATE TABLE IF NOT EXISTS "WebhookEvent" (
  "id" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "event" TEXT NOT NULL,
  "merchantTxnId" TEXT NOT NULL,
  "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "WebhookEvent_idempotencyKey_key" ON "WebhookEvent"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "WebhookEvent_merchantTxnId_idx" ON "WebhookEvent"("merchantTxnId");
