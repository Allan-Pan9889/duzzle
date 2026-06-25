export type PaymentMethodOption = "SABPAISA" | "COD";

export function PaymentSelector({
  value,
  onChange,
  sabpaisaAvailable,
}: {
  value: PaymentMethodOption;
  onChange: (method: PaymentMethodOption) => void;
  sabpaisaAvailable: boolean;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-primary">Payment Method</p>

      {sabpaisaAvailable && (
        <label className="flex cursor-pointer items-start gap-3 border border-gray-200 p-4 transition-colors hover:border-primary">
          <input
            type="radio"
            name="payment"
            value="SABPAISA"
            checked={value === "SABPAISA"}
            onChange={() => onChange("SABPAISA")}
            className="mt-1"
          />
          <div>
            <p className="text-sm font-medium text-primary">Pay Online</p>
            <p className="text-xs text-muted">UPI, Cards, Net Banking via SabPaisa</p>
          </div>
        </label>
      )}

      <label className="flex cursor-pointer items-start gap-3 border border-gray-200 p-4 transition-colors hover:border-primary">
        <input
          type="radio"
          name="payment"
          value="COD"
          checked={value === "COD"}
          onChange={() => onChange("COD")}
          className="mt-1"
        />
        <div>
          <p className="text-sm font-medium text-primary">Cash on Delivery</p>
          <p className="text-xs text-muted">Pay when your order arrives</p>
        </div>
      </label>
    </div>
  );
}
