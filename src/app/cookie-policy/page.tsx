import { ContentPage, ContentSection } from "@/components/layout/ContentPage";
import { COMPANY_BRAND } from "@/lib/company";

export const metadata = {
  title: `Cookie Policy | ${COMPANY_BRAND}`,
};

export default function CookiePolicyPage() {
  return (
    <ContentPage title="Cookie Policy">
      <p>
        This website uses cookies to improve user experience and website functionality.
      </p>

      <ContentSection title="What Are Cookies?">
        <p>
          Cookies are small text files stored on your device that help us recognize your
          preferences and improve site performance.
        </p>
      </ContentSection>

      <ContentSection title="Types of Cookies We Use">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="font-medium text-primary">Essential Cookies:</strong> Required for
            website operation.
          </li>
          <li>
            <strong className="font-medium text-primary">Analytics Cookies:</strong> Help us
            understand visitor behavior.
          </li>
          <li>
            <strong className="font-medium text-primary">Functional Cookies:</strong> Remember user
            preferences.
          </li>
          <li>
            <strong className="font-medium text-primary">Marketing Cookies:</strong> Deliver
            relevant advertisements.
          </li>
        </ul>
      </ContentSection>

      <ContentSection title="Managing Cookies">
        <p>
          You can manage or disable cookies through your browser settings. Disabling cookies may
          affect website functionality.
        </p>
      </ContentSection>

      <ContentSection title="Updates">
        <p>We may update this Cookie Policy periodically.</p>
      </ContentSection>
    </ContentPage>
  );
}
