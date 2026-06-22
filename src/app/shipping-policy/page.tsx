export default function ShippingPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-3xl text-primary">Shipping Policy</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="mb-2 font-medium text-primary">Delivery Coverage</h2>
          <p>
            Duzzlecode delivers across India. Please provide a valid 6-digit Pin Code at checkout
            so we can confirm delivery to your area.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-medium text-primary">Delivery Time</h2>
          <p>
            Standard delivery takes 5–9 business days after your order is confirmed. Delivery
            times may vary for remote locations.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-medium text-primary">Shipping Charges</h2>
          <p>
            A standard shipping fee of ₹79 applies to orders below ₹999. Orders of ₹999 and
            above qualify for free shipping.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-medium text-primary">Order Tracking</h2>
          <p>
            Once your order ships, you can track its status in your account under My Orders.
          </p>
        </section>
      </div>
    </div>
  );
}
