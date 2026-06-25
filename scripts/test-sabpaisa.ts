/**
 * Verify SabPaisa credentials and API connectivity on the server.
 *
 *   npm run test:sabpaisa
 */
import {
  createPaymentSession,
  getSabpaisaBaseUrl,
  isSabpaisaConfigured,
} from "../src/lib/sabpaisa";

async function main() {
  if (!isSabpaisaConfigured()) {
    console.error("Missing SABPAISA_API_KEY, SABPAISA_SECRET_KEY, or SABPAISA_MERCHANT_ID");
    process.exit(1);
  }

  const merchantTxnId = `TEST-${Date.now()}`;
  const baseUrl = getSabpaisaBaseUrl();

  console.log("SabPaisa base URL:", baseUrl);
  console.log("Merchant ID:", process.env.SABPAISA_MERCHANT_ID);
  console.log("Creating test payment session:", merchantTxnId);

  try {
    const session = await createPaymentSession({
      merchantTxnId,
      subtotalPaise: 10000,
      shippingPaise: 0,
      amountPaise: 10000,
      customerName: "Test Customer",
      customerEmail: "test@example.com",
      customerPhone: "9876543210",
      description: "SabPaisa connectivity test",
      shippingAddress: {
        fullName: "Test Customer",
        phone: "9876543210",
        line1: "123 Test Street",
        city: "Chennai",
        state: "Tamil Nadu",
        pinCode: "600032",
      },
    });

    console.log("OK — payment session created");
    console.log("paymentId:", session.paymentId);
    console.log("checkoutUrl:", session.checkoutUrl);
  } catch (error) {
    console.error("FAILED:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
