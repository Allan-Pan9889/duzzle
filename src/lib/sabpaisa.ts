import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const DEFAULT_BASE_URL = "https://staging-sb-merchant-api.sabpaisa.in";

export type AddressSnapshot = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  pinCode: string;
  email?: string;
};

export type CreatePaymentInput = {
  merchantTxnId: string;
  subtotalPaise: number;
  shippingPaise: number;
  amountPaise: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  description?: string;
  shippingAddress: AddressSnapshot;
  metadata?: Record<string, string>;
};

export type SabpaisaPaymentSession = {
  paymentId: string;
  checkoutUrl: string;
  clientSecret: string;
  redirectUrl: string;
};

export function isSabpaisaConfigured(): boolean {
  return Boolean(
    process.env.SABPAISA_API_KEY &&
      process.env.SABPAISA_SECRET_KEY &&
      process.env.SABPAISA_MERCHANT_ID,
  );
}

export function getSabpaisaBaseUrl(): string {
  return process.env.SABPAISA_BASE_URL?.trim() || DEFAULT_BASE_URL;
}

export function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export function formatIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "").slice(-10);
  if (!/^[6-9]\d{9}$/.test(digits)) {
    throw new Error("Invalid Indian phone number for payment");
  }
  return digits;
}

export function isValidCheckoutEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function generatePaymentChecksum(
  merchantTxnId: string,
  amountPaise: number,
  timestamp: number,
): string {
  const merchantId = process.env.SABPAISA_MERCHANT_ID!;
  const secretKey = process.env.SABPAISA_SECRET_KEY!;
  const message = `${merchantId}|${merchantTxnId}|${amountPaise}|INR|${timestamp}`;
  return crypto.createHmac("sha256", secretKey).update(message).digest("hex");
}

export function verifyReturnUrlSignature(
  params: Record<string, string>,
): boolean {
  const signature = params.signature;
  if (!signature) return false;

  const secretKey = process.env.SABPAISA_SECRET_KEY;
  if (!secretKey) return false;

  const signedParams = { ...params };
  delete signedParams.signature;

  const dataString = Object.keys(signedParams)
    .sort()
    .map((key) => `${key}=${signedParams[key]}`)
    .join("|");

  const expected = crypto
    .createHmac("sha256", secretKey)
    .update(dataString)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(signature, "utf8"),
    );
  } catch {
    return false;
  }
}

export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
): boolean {
  if (!signatureHeader) return false;

  const secret =
    process.env.SABPAISA_WEBHOOK_SECRET?.trim() ||
    process.env.SABPAISA_SECRET_KEY?.trim();
  if (!secret) return false;

  const [timestamp, receivedSignature] = signatureHeader.split(".");
  if (!timestamp || !receivedSignature) return false;

  const timestampMs = Number(timestamp);
  if (!Number.isFinite(timestampMs)) return false;

  const ageMs = Math.abs(Date.now() - timestampMs);
  if (ageMs > 5 * 60 * 1000) return false;

  const toSign = `${timestamp}.${rawBody}`;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(toSign)
    .digest("base64");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "utf8"),
      Buffer.from(receivedSignature, "utf8"),
    );
  } catch {
    return false;
  }
}

export async function createPaymentSession(
  input: CreatePaymentInput,
): Promise<SabpaisaPaymentSession> {
  if (!isSabpaisaConfigured()) {
    throw new Error("SabPaisa is not configured");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const checksum = generatePaymentChecksum(
    input.merchantTxnId,
    input.amountPaise,
    timestamp,
  );

  const payload = {
    merchantId: process.env.SABPAISA_MERCHANT_ID,
    merchantTxnId: input.merchantTxnId,
    amount: input.amountPaise,
    currency: "INR",
    customerName: input.customerName,
    customerEmail: input.customerEmail.trim(),
    customerPhone: input.customerPhone,
    returnUrl: `${getAppBaseUrl()}/payment/return`,
    description: input.description,
    checksum,
    timestamp,
    metadata: input.metadata,
    shippingAddress: {
      name: input.shippingAddress.fullName,
      line1: input.shippingAddress.line1,
      line2: input.shippingAddress.line2 || undefined,
      city: input.shippingAddress.city,
      state: input.shippingAddress.state,
      postalCode: input.shippingAddress.pinCode,
      country: "IN",
      phone: formatIndianPhone(input.shippingAddress.phone),
    },
    orderSummary: {
      subtotal: input.subtotalPaise,
      shippingAmount: input.shippingPaise,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount: input.amountPaise,
    },
  };

  const response = await fetch(`${getSabpaisaBaseUrl()}/api/v2/payments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": process.env.SABPAISA_API_KEY!,
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as {
    success?: boolean;
    paymentId?: string;
    checkoutUrl?: string;
    clientSecret?: string;
    message?: string;
  };

  if (!response.ok || !data.checkoutUrl || !data.clientSecret || !data.paymentId) {
    throw new Error(data.message || "Failed to create SabPaisa payment session");
  }

  const redirectUrl = `${data.checkoutUrl}?clientSecret=${encodeURIComponent(data.clientSecret)}`;

  return {
    paymentId: data.paymentId,
    checkoutUrl: data.checkoutUrl,
    clientSecret: data.clientSecret,
    redirectUrl,
  };
}

export async function enquiryPayment(merchantTxnId: string) {
  if (!isSabpaisaConfigured()) {
    throw new Error("SabPaisa is not configured");
  }

  const response = await fetch(`${getSabpaisaBaseUrl()}/api/v2/payments/enquiry`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": process.env.SABPAISA_API_KEY!,
    },
    body: JSON.stringify({
      clientCode: process.env.SABPAISA_MERCHANT_ID,
      merchantTxnId,
    }),
  });

  const data = (await response.json()) as {
    success?: boolean;
    status?: string;
    txnId?: string;
    sessionId?: string;
    message?: string;
  };

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to enquiry SabPaisa payment");
  }

  return data;
}

export async function markOrderPaidByMerchantTxnId(
  merchantTxnId: string,
  txnId?: string,
  paymentId?: string,
) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: merchantTxnId },
  });

  if (!order) return null;
  if (order.paymentStatus === "PAID") return order;

  return prisma.order.update({
    where: { id: order.id },
    data: {
      status: "PAID",
      paymentStatus: "PAID",
      sabpaisaTxnId: txnId ?? order.sabpaisaTxnId,
      sabpaisaPaymentId: paymentId ?? order.sabpaisaPaymentId,
    },
  });
}

export async function markOrderPaymentFailedByMerchantTxnId(merchantTxnId: string) {
  const order = await prisma.order.findUnique({
    where: { orderNumber: merchantTxnId },
  });

  if (!order || order.paymentStatus === "PAID") return order;

  return prisma.order.update({
    where: { id: order.id },
    data: {
      paymentStatus: "FAILED",
    },
  });
}

export async function recordWebhookEvent(input: {
  idempotencyKey: string;
  event: string;
  merchantTxnId: string;
}): Promise<boolean> {
  try {
    await prisma.webhookEvent.create({
      data: input,
    });
    return true;
  } catch {
    return false;
  }
}

export async function handleSabpaisaTerminalStatus(
  merchantTxnId: string,
  status: string,
  txnId?: string,
  paymentId?: string,
) {
  const normalized = status.toUpperCase();

  if (normalized === "SUCCESS") {
    return markOrderPaidByMerchantTxnId(merchantTxnId, txnId, paymentId);
  }

  if (["FAILED", "EXPIRED", "TIMEOUT", "CANCELLED"].includes(normalized)) {
    return markOrderPaymentFailedByMerchantTxnId(merchantTxnId);
  }

  return null;
}
