import { ContentPage, ContentSection } from "@/components/layout/ContentPage";
import { COMPANY_BRAND, COMPANY_EMAIL, COMPANY_LEGAL_NAME } from "@/lib/company";

export const metadata = {
  title: `Privacy Policy | ${COMPANY_BRAND}`,
};

export default function PrivacyPolicyPage() {
  return (
    <ContentPage title="Privacy Policy">
      <p>
        At {COMPANY_BRAND}, we value your privacy and are committed to protecting your personal
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
          <a href={`mailto:${COMPANY_EMAIL}`} className="text-primary underline">
            {COMPANY_EMAIL}
          </a>
        </p>
      </ContentSection>

      <p className="border-t border-gray-100 pt-6 text-primary">{COMPANY_LEGAL_NAME}</p>
    </ContentPage>
  );
}
