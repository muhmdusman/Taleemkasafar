import { routes } from "@/lib/routes";
import { siteConfig } from "@/config/site";

/**
 * PRICING CONFIG: the one place to edit the student offer and plans.
 *
 * Positioning (product owner, 2026-10-22): Taleem ka Safar is FREE for
 * students, built by students and teachers. If a fee is ever introduced it is
 * capped at Rs 250, only to cover technical costs and keep the experience
 * smooth. Academies get in touch on WhatsApp.
 *
 * Shape mirrors a future `pricing_plans` DB table (snake_case there):
 * id, name, tagline, price_pkr (numeric, 0 = free | null = contact us),
 * price_note, features (text[]), highlighted, cta_label, cta_href.
 */

export type PricingPlan = {
  id: string;
  name: string;
  tagline: string;
  /** Price in PKR. 0 = free; "contact" = talk to us (academies). */
  pricePkr: number | "contact";
  priceNote: string;
  features: string[];
  highlighted: boolean;
  ctaLabel: string;
  ctaHref: string;
  /** External link (WhatsApp) opens in a new tab. */
  external?: boolean;
};

/** Maximum fee, ever, if one is introduced (PKR). */
export const PRICE_CAP_PKR = 250;

export const studentOffer = {
  /** Long badge / tagline used across the site. */
  tagline: "For the students, by the students & teachers",
  /** Short selling point for chips, buttons and meta copy. */
  short: "Free for students",
  headline: "Free for students, built by students and teachers.",
  priceCapNote: `If we ever add a fee, it will never be more than Rs ${PRICE_CAP_PKR}, only to cover technical costs and keep the experience smooth.`,
  ctaLabel: "Get started free",
  ctaHref: routes.signUp,
} as const;

export const pricingPlans: PricingPlan[] = [
  {
    id: "student",
    name: "Students",
    tagline: "Everything you need to prepare, free.",
    pricePkr: 0,
    priceNote: `Never more than Rs ${PRICE_CAP_PKR} if a fee is ever added`,
    features: [
      "Chapter-wise MCQ practice",
      "Explanations for every wrong answer",
      "Past paper practice",
      "Timed mock tests",
      "Performance analytics by subject and chapter",
      "Merit calculator for 18 universities",
    ],
    highlighted: true,
    ctaLabel: studentOffer.ctaLabel,
    ctaHref: routes.signUp,
  },
  {
    id: "academy",
    name: "Academies",
    tagline: "For coaching centres, teachers and their students.",
    pricePkr: "contact",
    priceNote: "Message us on WhatsApp for a plan that fits your batch",
    features: [
      "Student accounts for your batch",
      "Shared mock tests",
      "Batch performance overview",
      "Direct support from our team",
    ],
    highlighted: false,
    ctaLabel: "Contact on WhatsApp",
    ctaHref: siteConfig.contact.whatsappUrl,
    external: true,
  },
];

/** Display text for a plan's price. */
export function formatPlanPrice(plan: PricingPlan): string {
  if (plan.pricePkr === "contact") return "Let's talk";
  if (plan.pricePkr === 0) return "Free";
  return `Rs ${new Intl.NumberFormat("en-PK").format(plan.pricePkr)}`;
}
