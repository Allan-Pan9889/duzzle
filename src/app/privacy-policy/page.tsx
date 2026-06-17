import { ContentPage, ContentSection } from "@/components/layout/ContentPage";

export const metadata = {
  title: "Privacy Policy | Duzzle",
};

export default function PrivacyPolicyPage() {
  return (
    <ContentPage title="Privacy Policy">
      <p>
        At Duzzle, we value your privacy and are committed to protecting your personal
        information.
      </p>

      <ContentSection title="Information We Collect">
        <ul className="list-disc space-y-2 pl-5">
          <li>Name</li>
          <li>Email address</li>
          <li>Phone number</li>
          <li>Shipping and billing address</li>
          <li>Payment information (processed securely through payment gateways)</li>
          <li>Browsing and device information</li>
        </ul>
      </ContentSection>

      <ContentSection title="How We Use Your Information">
        <ul className="list-disc space-y-2 pl-5">
          <li>Process orders and payments</li>
          <li>Provide customer support</li>
          <li>Send order updates</li>
          <li>Improve website performance</li>
          <li>Send promotional communications (with your consent)</li>
        </ul>
      </ContentSection>

      <ContentSection title="Data Protection">
        <p>We implement industry-standard security measures to protect your data.</p>
      </ContentSection>

      <ContentSection title="Third-Party Services">
        <p>
          We may share information with shipping providers, payment processors, and analytics
          services as necessary to operate our business.
        </p>
      </ContentSection>

      <ContentSection title="Your Rights">
        <p>Access, update, or delete your personal information by contacting us.</p>
      </ContentSection>

      <ContentSection title="Contact">
        <p>
          Email:{" "}
          <a href="mailto:duzzlecode2026@gmail.com" className="text-primary underline">
            duzzlecode2026@gmail.com
          </a>
        </p>
      </ContentSection>
    </ContentPage>
  );
}
