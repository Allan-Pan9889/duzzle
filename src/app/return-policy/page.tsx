import { ContentPage, ContentSection } from "@/components/layout/ContentPage";

export const metadata = {
  title: "Return & Refund Policy | Duzzlecode",
};

export default function ReturnPolicyPage() {
  return (
    <ContentPage title="Return & Refund Policy">
      <ContentSection title="Return Eligibility">
        <ul className="list-disc space-y-2 pl-5">
          <li>Returns are accepted within 7–14 days of delivery.</li>
          <li>
            Items must be unused, unwashed, and in original packaging with tags attached.
          </li>
        </ul>
      </ContentSection>

      <ContentSection title="Non-Returnable Items">
        <ul className="list-disc space-y-2 pl-5">
          <li>Innerwear</li>
          <li>Customized products</li>
          <li>Clearance or final sale items</li>
        </ul>
      </ContentSection>

      <ContentSection title="Return Process">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Contact customer support.</li>
          <li>Provide your order number and return reason.</li>
          <li>Ship the product according to the instructions provided.</li>
        </ol>
      </ContentSection>

      <ContentSection title="Refunds">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Refunds will be processed after inspection and approval of returned items.
          </li>
          <li>
            Refunds may take 5–10 business days to appear in the original payment method.
          </li>
        </ul>
      </ContentSection>

      <ContentSection title="Damaged or Incorrect Items">
        <p>Report damaged or incorrect products within 48 hours of delivery.</p>
      </ContentSection>
    </ContentPage>
  );
}
