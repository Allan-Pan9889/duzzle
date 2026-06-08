export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-3xl text-primary">Privacy Policy</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
        <section>
          <h2 className="mb-2 font-medium text-primary">Information We Collect</h2>
          <p>
            We collect your mobile number, delivery address, and order history to process
            purchases and provide customer support.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-medium text-primary">How We Use Your Data</h2>
          <p>
            Your information is used solely to fulfil orders, send order updates, and improve
            your shopping experience. We do not sell your personal information to third parties.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-medium text-primary">Data Security</h2>
          <p>
            We use industry-standard security measures to protect your data. Payment information
            is processed securely through Razorpay and is never stored on our servers.
          </p>
        </section>
        <section>
          <h2 className="mb-2 font-medium text-primary">Contact</h2>
          <p>
            For privacy-related questions, email{" "}
            <a href="mailto:duzzlecode2026@gmail.com" className="text-primary underline">
              duzzlecode2026@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
