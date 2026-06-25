import { NextResponse } from "next/server";
import {
  handleSabpaisaTerminalStatus,
  recordWebhookEvent,
  verifyWebhookSignature,
} from "@/lib/sabpaisa";

export const runtime = "nodejs";

type SabpaisaWebhookPayload = {
  event?: string;
  txn_id?: string;
  merchant_txn_id?: string;
  status?: string;
  idempotency_key?: string;
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signatureHeader = request.headers.get("X-SabPaisa-Signature");

  if (!verifyWebhookSignature(rawBody, signatureHeader)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: SabpaisaWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as SabpaisaWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const merchantTxnId = payload.merchant_txn_id;
  const status = payload.status;
  const idempotencyKey = payload.idempotency_key;

  if (!merchantTxnId || !status || !idempotencyKey) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const isNew = await recordWebhookEvent({
    idempotencyKey,
    event: payload.event ?? status,
    merchantTxnId,
  });

  if (isNew) {
    try {
      await handleSabpaisaTerminalStatus(
        merchantTxnId,
        status,
        payload.txn_id,
        undefined,
      );
    } catch (error) {
      console.error("SabPaisa webhook processing error:", error);
    }
  }

  return NextResponse.json({ received: true });
}
