import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd, organizationJsonLd, websiteJsonLd } from "@/components/seo/json-ld";
import { Hero } from "@/components/marketing/home/hero";
import { Features } from "@/components/marketing/home/features";
import { HowItWorks } from "@/components/marketing/home/how-it-works";
import { MeritTeaser } from "@/components/marketing/home/merit-teaser";
import { Pricing } from "@/components/marketing/home/pricing";
import { Faq } from "@/components/marketing/home/faq";
import { FinalCta } from "@/components/marketing/home/final-cta";

/**
 * Landing page at "/". Fully static (no cookies/session/Date) so it
 * prerenders for SEO. Section order: hero, features, how it works, merit
 * calculator teaser, pricing, FAQ, final CTA.
 */
export const metadata = buildMetadata({
  title: `${siteConfig.name} | Entry Test Preparation in Pakistan (NET, PU, UET, FAST, NAT)`,
  absoluteTitle: true,
  description:
    "Making quality entry-test preparation accessible to everyone. Free for students: NET, PU, UET, FAST and NAT MCQs with an explanation for every wrong answer, mock tests and no ads.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      <Hero />
      {/* PainPoints ("Why Taleem ka Safar") paused by the owner; its points now live in the FAQ. */}
      <Features />
      <HowItWorks />
      <MeritTeaser />
      <Pricing />
      <Faq />
      <FinalCta />
    </>
  );
}
