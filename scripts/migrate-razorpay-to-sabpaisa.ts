/**
 * One-time migration: Razorpay → SabPaisa on an existing PostgreSQL database.
 * Run on EC2 after git pull, before creating online-payment orders:
 *
 *   npx tsx scripts/migrate-razorpay-to-sabpaisa.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function enumHasValue(typeName: string, value: string): Promise<boolean> {
  const rows = await prisma.$queryRawUnsafe<{ enumlabel: string }[]>(
    `SELECT e.enumlabel
     FROM pg_enum e
     JOIN pg_type t ON e.enumtypid = t.oid
     WHERE t.typname = $1`,
    typeName,
  );
  return rows.some((r) => r.enumlabel === value);
}

async function columnExists(table: string, column: string): Promise<boolean> {
  const rows = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
    `SELECT EXISTS (
       SELECT 1 FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2
     ) AS exists`,
    table,
    column,
  );
  return Boolean(rows[0]?.exists);
}

async function main() {
  const hasRazorpay = await enumHasValue("PaymentMethod", "RAZORPAY");
  const hasSabpaisa = await enumHasValue("PaymentMethod", "SABPAISA");

  if (hasSabpaisa && !hasRazorpay) {
    console.log("PaymentMethod enum already has SABPAISA.");
  } else if (hasRazorpay && !hasSabpaisa) {
    console.log('Renaming enum value RAZORPAY → SABPAISA...');
    await prisma.$executeRawUnsafe(
      `ALTER TYPE "PaymentMethod" RENAME VALUE 'RAZORPAY' TO 'SABPAISA'`,
    );
    console.log("Done.");
  } else if (!hasSabpaisa) {
    console.log('Adding enum value SABPAISA...');
    await prisma.$executeRawUnsafe(`ALTER TYPE "PaymentMethod" ADD VALUE 'SABPAISA'`);
    console.log("Done.");
  } else {
    console.log("PaymentMethod has both RAZORPAY and SABPAISA; leaving enum as-is.");
  }

  if (await columnExists("Order", "razorpayOrderId")) {
    console.log("Renaming Order.razorpayOrderId → sabpaisaPaymentId...");
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Order" RENAME COLUMN "razorpayOrderId" TO "sabpaisaPaymentId"`,
    );
  }

  if (await columnExists("Order", "razorpayPaymentId")) {
    console.log("Renaming Order.razorpayPaymentId → sabpaisaTxnId...");
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Order" RENAME COLUMN "razorpayPaymentId" TO "sabpaisaTxnId"`,
    );
  }

  if (!(await columnExists("Order", "sabpaisaPaymentId"))) {
    console.log("Adding Order.sabpaisaPaymentId...");
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "sabpaisaPaymentId" TEXT`,
    );
  }

  if (!(await columnExists("Order", "sabpaisaTxnId"))) {
    console.log("Adding Order.sabpaisaTxnId...");
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "sabpaisaTxnId" TEXT`,
    );
  }

  console.log("Ensuring WebhookEvent table...");
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "WebhookEvent" (
      "id" TEXT NOT NULL,
      "idempotencyKey" TEXT NOT NULL,
      "event" TEXT NOT NULL,
      "merchantTxnId" TEXT NOT NULL,
      "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "WebhookEvent_idempotencyKey_key"
    ON "WebhookEvent"("idempotencyKey")
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "WebhookEvent_merchantTxnId_idx"
    ON "WebhookEvent"("merchantTxnId")
  `);

  const final = await enumHasValue("PaymentMethod", "SABPAISA");
  if (!final) {
    throw new Error("Migration failed: PaymentMethod still missing SABPAISA");
  }

  console.log("Migration complete. Run: npx prisma generate && npm run build && pm2 restart duzzle");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
