import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  enquiryPayment,
  handleSabpaisaTerminalStatus,
  verifyReturnUrlSignature,
} from "@/lib/sabpaisa";

export default async function PaymentReturnPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const flatParams: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") flatParams[key] = value;
  }

  if (!flatParams.signature || !verifyReturnUrlSignature(flatParams)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-serif text-2xl text-primary">Payment Verification Failed</h1>
        <p className="mt-4 text-sm text-muted">
          We could not verify your payment response. If money was deducted, please contact
          support with your order details.
        </p>
        <Link href="/contact" className="mt-6 inline-block text-sm text-primary underline">
          Contact Support
        </Link>
      </div>
    );
  }

  const merchantTxnId = flatParams.merchant_txn_id;
  const status = flatParams.status?.toUpperCase() ?? "";

  const order = await prisma.order.findUnique({
    where: { orderNumber: merchantTxnId },
  });

  if (!order) {
    redirect("/account/orders?error=order_not_found");
  }

  if (status === "SUCCESS") {
    try {
      const enquiry = await enquiryPayment(merchantTxnId);
      if (enquiry.status?.toUpperCase() === "SUCCESS") {
        await handleSabpaisaTerminalStatus(
          merchantTxnId,
          "SUCCESS",
          enquiry.txnId,
          enquiry.sessionId,
        );
      }
    } catch (error) {
      console.error("SabPaisa return enquiry error:", error);
    }

    redirect(`/account/orders/${order.id}?placed=1`);
  }

  await handleSabpaisaTerminalStatus(
    merchantTxnId,
    status,
    flatParams.transaction_id,
    order.sabpaisaPaymentId ?? undefined,
  );

  redirect(`/account/orders/${order.id}?payment=${status.toLowerCase()}`);
}
