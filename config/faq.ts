/**
 * Home-page FAQ. Feeds BOTH the visible accordion and the FAQPage JSON-LD,
 * so the two always match (Google requires the marked-up Q&A to be visible).
 *
 * Shape mirrors a future `faqs` DB table: id, question, answer, sort order
 * (array index). Answers are plain text (no HTML) so they are safe in JSON-LD.
 * First-draft copy; refine during the content/SEO phase.
 */

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

/** /academies FAQ (visible list + FAQPage JSON-LD on that page). First draft. */
export const academiesFaq: FaqItem[] = [
  {
    id: "academy-tests",
    question: "Which entry tests can my students practise today?",
    answer:
      "Practice MCQs and past papers are live for the NUST Entry Test (NET) and Punjab University entry tests, and full-length timed mock tests are live for NET. PU mock tests are coming soon, and so is ECAT and MDCAT content.",
  },
  {
    id: "academy-pricing",
    question: "How much does it cost for an academy?",
    answer:
      "Academy pricing has not been decided yet. Every student can start with the 3-month free trial today, and we will agree a batch rate with you when academy plans launch.",
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
    id: "tests-covered",
    question: "Which entry tests can I prepare for?",
    answer:
      "Taleem ka Safar currently covers the NUST Entry Test (NET) and Punjab University entry tests, with practice in Maths, Physics and English. We are adding more tests such as ECAT, MDCAT, FAST and GIKI step by step, so check the dashboard for the latest list.",
  },
  {
    id: "free-trial",
    question: "How does the 3-month free trial work?",
    answer:
      "Create an account and you get full access for 3 months. No credit card or payment method is required to start, so nothing can be charged when the trial ends.",
  },
  {
    id: "mock-tests",
    question: "Are the mock tests timed like the real exam?",
    answer:
      "Yes. The full-length NET mock test follows the section pattern and time limit of the real test, so you can practise managing time before test day. Your results show where you lost marks. PU mock tests are coming soon.",
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
      "Practice questions show the correct answer right after you attempt them, along with an explanation where one is available, so you learn the concept instead of memorising answers.",
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
    answer:
      "Yes. We are building tools for academies and coaching centres to give their students structured practice and track batch progress. Get in touch through the contact page to discuss your needs.",
  },
];
