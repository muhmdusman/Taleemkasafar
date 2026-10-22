import { homeFaq } from "@/config/faq";
import { Container, SectionHeading } from "@/components/marketing/container";
import { FaqList } from "@/components/marketing/faq-list";
import { JsonLd, faqPageJsonLd } from "@/components/seo/json-ld";

/**
 * Home FAQ (native <details>, no client JS) + matching FAQPage JSON-LD, both
 * from config/faq.ts so the visible Q&A and the structured data always match.
 */
export function Faq() {
  return (
    <section aria-labelledby="faq-heading" className="py-16 md:py-24">
      <JsonLd data={faqPageJsonLd(homeFaq)} />
      {/* Heading on top, questions full width below (user layout request). */}
      <Container className="flex flex-col gap-10">
        <SectionHeading
          id="faq-heading"
          eyebrow="FAQ"
          title="Questions students ask us"
          description="Can't find your answer? Reach out through the contact page."
        />
        <FaqList items={homeFaq} />
      </Container>
    </section>
  );
}
