import { ContentPage, ContentSection } from "@/components/layout/ContentPage";

export const metadata = {
  title: "Terms & Conditions | Duzzle",
};

export default function TermsAndConditionsPage() {
  return (
    <ContentPage title="Terms & Conditions">
      <p>
        Welcome to Duzzle. By accessing and using our website, you agree to comply with these
        Terms &amp; Conditions.
      </p>

      <ContentSection title="Products & Orders">
        <ul className="list-disc space-y-2 pl-5">
          <li>We sell men&apos;s, women&apos;s, and kids&apos; fashion products.</li>
          <li>
            Product images are for illustrative purposes only and may slightly vary from actual
            products.
          </li>
          <li>
            We reserve the right to refuse or cancel any order due to pricing errors, stock
            unavailability, or suspected fraudulent activity.
          </li>
        </ul>
      </ContentSection>

      <ContentSection title="Pricing & Payments">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            All prices are displayed in the applicable currency and include/exclude taxes as
            specified.
          </li>
          <li>Payments must be completed through our approved payment methods.</li>
        </ul>
      </ContentSection>

      <ContentSection title="Shipping">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Delivery timelines are estimates and may vary due to logistics or unforeseen
            circumstances.
          </li>
          <li>Customers are responsible for providing accurate shipping information.</li>
        </ul>
      </ContentSection>

      <ContentSection title="Intellectual Property">
        <p>
          All content, including logos, images, designs, and text, belongs to Duzzle and may not
          be used without permission.
        </p>
      </ContentSection>

      <ContentSection title="Limitation of Liability">
        <p>
          We are not liable for indirect, incidental, or consequential damages arising from the
          use of our website or products.
        </p>
      </ContentSection>

      <ContentSection title="Changes to Terms">
        <p>We reserve the right to update these Terms &amp; Conditions at any time.</p>
      </ContentSection>
    </ContentPage>
  );
}
