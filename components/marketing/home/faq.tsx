import { homeFaq } from "@/config/faq";
import { Container } from "@/components/marketing/container";
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
      {/* Centered heading on top, questions full width below (owner layout request). */}
      <Container className="flex flex-col gap-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="faq-heading"
            className="font-headline text-3xl font-bold tracking-tight text-on-surface sm:text-4xl"
          >
            Questions students ask us
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">
            Can&apos;t find your answer? Reach out through the contact page.
          </p>
        </div>
        <FaqList items={homeFaq} />
      </Container>
    </section>
  );
}
