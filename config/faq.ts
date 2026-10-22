/**
 * Home-page FAQ. Feeds BOTH the visible accordion and the FAQPage JSON-LD,
 * so the two always match (Google requires the marked-up Q&A to be visible).
 *
 * Shape mirrors a future `faqs` DB table: id, question, answer, sort order
 * (array index). Answers are plain text (no HTML) so they are safe in JSON-LD.
 * First-draft copy; refine during the content/SEO phase.
 */

import { PRICE_CAP_PKR } from "@/config/pricing";
import { siteConfig } from "@/config/site";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

const TESTS_ANSWER =
  "Taleem ka Safar covers the NUST Entry Test (NET), Punjab University (PU) entry tests, UET (ECAT), FAST-NUCES and NTS NAT. NET and PU practice, past papers and mock tests are in the dashboard today, and UET, FAST and NAT questions are being added step by step.";

/** /academies FAQ (visible list + FAQPage JSON-LD on that page). First draft. */
export const academiesFaq: FaqItem[] = [
  {
    id: "academy-tests",
    question: "Which entry tests can my students practise?",
    answer: TESTS_ANSWER,
  },
  {
    id: "academy-pricing",
    question: "How much does it cost for an academy?",
    answer: `Message us on WhatsApp at ${siteConfig.contact.phone} and we will agree a plan that fits your batch. Your students can always use Taleem ka Safar for free on their own.`,
  },
  {
    id: "academy-teacher-view",
    question: "Can I see how each of my students is doing?",
    answer:
      "Students already see their own accuracy by subject and chapter. A teacher view of batch and per-student progress is coming soon. Tell us what you need so we can build it around how you teach.",
  },
];

export const homeFaq: FaqItem[] = [
  {
    // Neutral comparison: no claims about other platforms, only what we do.
    id: "why-taleem-ka-safar",
    question: "Why Taleem ka Safar when Maqsad, Chaajao and other platforms already exist?",
    answer: `Those platforms cover a lot of school and exam content. Taleem ka Safar is built only for university entry tests, by students and teachers who have been through them. It is free for students (never more than Rs ${PRICE_CAP_PKR} if a fee is ever added), every wrong answer comes with an explanation, and there are no ads while you practise.`,
  },
  {
    id: "tests-covered",
    question: "Which entry tests can I prepare for?",
    answer: TESTS_ANSWER,
  },
  {
    id: "is-it-free",
    question: "Is Taleem ka Safar really free for students?",
    answer: `Yes. Taleem ka Safar is built for students, by students and teachers, and it is free for students. Good preparation should not depend on your city, school or family income, so every student in Pakistan gets the same quality content. No credit card or payment method is needed. If we ever add a fee, it will never be more than Rs ${PRICE_CAP_PKR}, only to cover technical costs and keep the experience smooth.`,
  },
  {
    id: "ads",
    question: "Will I see ads while I practise?",
    answer:
      "No. There are no pop-ups or banner ads in the middle of a question, so your attention stays on preparing.",
  },
  {
    id: "seniors",
    question: "Can I get guidance from seniors at my dream university?",
    answer:
      "This is coming soon. If no cousin or elder sibling studies where you want to go, you will be able to connect with university seniors who already got admission and ask them what really works.",
  },
  {
    id: "mock-tests",
    question: "Are the mock tests timed like the real exam?",
    answer:
      "Yes. Full-length mock tests follow the section pattern and time limit of the real test, so you can practise managing time before test day. Your results show where you lost marks.",
  },
  {
    id: "merit-calculator",
    question: "How accurate is the merit calculator?",
    answer:
      "The merit calculator uses each university's published weightages for matric, intermediate and entry test marks. Results are estimates only. Always confirm the final formula in the official university admission notification.",
  },
  {
    id: "explanations",
    question: "Do questions come with explanations?",
    answer:
      "Yes. You see the correct answer right after you attempt a question, and every wrong answer comes with an explanation of why, so you learn the concept instead of memorising answers.",
  },
  {
    id: "devices",
    question: "Can I use Taleem ka Safar on my phone?",
    answer:
      "Yes. The platform works in any modern browser on phones, tablets and computers. There is nothing to install.",
  },
  {
    id: "academies",
    question: "I run an academy. Can my students use it?",
    answer: `Yes. We are building tools for academies and coaching centres to give their students structured practice and track batch progress. Message us on WhatsApp at ${siteConfig.contact.phone} to discuss your needs.`,
  },
];
