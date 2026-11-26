import type { FaqItem } from "@/config/faq";

/**
 * Senior Connect (Beta): all page copy in one place. Shape is plain data so it
 * can move to a CMS/DB later. Owner brief (2026-10-31): connect students
 * seeking university admission with bachelor students; static beta page,
 * collect sign-ups through Web3Forms, list seniors by hand later.
 */
export const seniorConnect = {
  name: "Senior Connect",
  badge: "Beta",
  hero: {
    // The h1 ("Talk to someone who already got in.") lives in the page so it
    // can be styled; keep the two in sync if you reword it.
    description:
      "Senior Connect introduces students preparing for entry tests to bachelor students already studying at the universities they want. Real answers about admissions, programmes and campus life, from people who were in your place last year.",
    highlights: ["Seniors from your dream university", "Free for students", "Every match made by our team"],
  },
  problem: {
    /**
     * OWNER-PROVIDED FIGURE (2026-10-31). Add `source` (survey/report name)
     * before publishing widely; it renders under the number when set.
     */
    stat: {
      value: "85%+",
      label:
        "of students seeking university admission in Pakistan are not aware of how admissions, programmes and campus life really work.",
      source: null as string | null,
    },
    title: "Big decisions, made on guesswork",
    body: "Choosing a university and a programme shapes the next four years. Yet most students decide from rumours, forwarded WhatsApp messages and a few videos, because nobody in their family has studied there.",
    points: [
      {
        icon: "users",
        title: "No one to ask",
        description:
          "If no cousin or elder sibling studies at your dream university, the honest answers stay out of reach.",
      },
      {
        icon: "messages",
        title: "Advice is scattered",
        description:
          "Test tips, merit talk and campus stories are spread across groups, pages and hearsay, and much of it is out of date.",
      },
      {
        icon: "compass",
        title: "Wrong choices are costly",
        description:
          "Students pick programmes and cities without knowing what the work, the hostel or the first year actually feel like.",
      },
    ],
  },
  steps: [
    {
      title: "Join the beta",
      description:
        "Students join the waitlist. Bachelor students sign up as seniors. It takes less than a minute.",
    },
    {
      title: "We match you",
      description:
        "Our team matches you with a senior from your dream university and, where possible, your programme.",
    },
    {
      title: "Ask what matters",
      description:
        "Talk through admissions, test preparation, programmes, hostels and first-year life with someone who knows.",
    },
  ],
  audiences: {
    student: {
      title: "For students seeking admission",
      points: [
        "Hear how seniors prepared for the test you are taking",
        "Understand a programme before you choose it",
        "Learn what campus, hostel and first-year life are really like",
        "Free for students",
      ],
      cta: "Join the student waitlist",
    },
    senior: {
      title: "For bachelor students",
      points: [
        "Give juniors the guidance you wish you had",
        "Help on your own schedule, from anywhere",
        "Share real experience, not sales pitches",
        "Be one of the first seniors on Taleem ka Safar",
      ],
      cta: "Become a senior",
    },
  },
  forms: {
    student: {
      eyebrow: "I'm preparing for admission",
      title: "Join the student waitlist",
      description: "Tell us where you want to go. We'll introduce you to a senior from there.",
      submit: "Join the waitlist",
      successTitle: (firstName: string) => `You're on the waitlist, ${firstName}.`,
      successBody:
        "We'll message you on WhatsApp as soon as we have a senior from your dream university for you.",
    },
    senior: {
      eyebrow: "I'm a bachelor student",
      title: "Become a senior",
      description: "Help one student make a better decision than you had to make alone.",
      submit: "Sign up as a senior",
      successTitle: (firstName: string) => `Thank you, ${firstName}. Welcome aboard.`,
      successBody:
        "Our team will contact you to confirm your details before we introduce you to any student.",
    },
  },
  privacy:
    "Your number stays private. We use your details only to arrange Senior Connect introductions, and we never publish phone numbers.",
  faq: [
    {
      id: "what-is-senior-connect",
      question: "What is Senior Connect?",
      answer:
        "A Taleem ka Safar beta that introduces students preparing for university entry tests to bachelor students at the universities they want to join, so they can ask real questions before they apply.",
    },
    {
      id: "is-it-free",
      question: "Is Senior Connect free?",
      answer: "Yes. Senior Connect is free for students.",
    },
    {
      id: "who-can-be-a-senior",
      question: "Who can join as a senior?",
      answer:
        "Any student currently enrolled in a bachelor programme at a Pakistani university. We check every senior's details before introducing them to anyone.",
    },
    {
      id: "how-matching-works",
      question: "How are matches made during the beta?",
      answer:
        "Our team reviews every sign-up and matches students with seniors by university and, where possible, programme. You will hear from us on WhatsApp or email.",
    },
    {
      id: "phone-privacy",
      question: "Will my phone number be shared?",
      answer:
        "Never publicly. We share contact details between a student and a senior only after both have agreed to the introduction.",
    },
    {
      id: "when-matched",
      question: "When will I be matched?",
      answer:
        "We are onboarding seniors now. Students on the waitlist are introduced as soon as a senior from their university joins.",
    },
  ] satisfies FaqItem[],
} as const;
