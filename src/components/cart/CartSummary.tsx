import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export function CartSummary({
  subtotal,
  shippingFee,
  freeShippingThreshold,
}: {
  subtotal: number;
  shippingFee: number;
  freeShippingThreshold: number;
}) {
  const total = subtotal + shippingFee;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className="border border-gray-100 bg-surface p-6">
      <h2 className="mb-4 font-serif text-lg tracking-wide text-primary">Order Summary</h2>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Subtotal</span>
          <span className="text-primary">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Shipping</span>
          <span className="text-primary">
            {shippingFee === 0 ? "Free" : formatPrice(shippingFee)}
          </span>
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-2 font-medium">
          <span className="text-primary">Total</span>
          <span className="text-primary">{formatPrice(total)}</span>
        </div>
      </div>

      {amountToFreeShipping > 0 && (
        <p className="mt-4 text-xs text-muted">
          Add {formatPrice(amountToFreeShipping)} more for free shipping
        </p>
      )}

      {subtotal >= freeShippingThreshold && (
        <p className="mt-4 text-xs text-accent">You qualify for free shipping!</p>
      )}

      <Link href="/checkout" className="mt-6 block">
        <Button className="w-full" disabled={subtotal === 0}>
          Proceed to Checkout
        </Button>
      </Link>
    </div>
  );
}
