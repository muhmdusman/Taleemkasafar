/**
 * Pure contact-form validation (no React, no I/O). Shared by the client form
 * today and by the future server action, so both apply the same rules.
 * Shape mirrors a future `contact_messages` table:
 * name, email, phone (nullable), topic, message.
 */

export const CONTACT_TOPICS = [
  { value: "general", label: "General" },
  { value: "students", label: "Students" },
  { value: "academies", label: "Academies / Partnerships" },
  { value: "technical", label: "Technical support" },
  { value: "feedback", label: "Feedback" },
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number]["value"];

export const NAME_MIN = 2;
export const NAME_MAX = 80;
export const EMAIL_MAX = 254;
export const MESSAGE_MIN = 20;
export const MESSAGE_MAX = 2000;

/** Field order = DOM order, used to focus the first invalid field. */
export const CONTACT_FIELDS = ["name", "email", "phone", "topic", "message"] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];

export type ContactInput = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  topic?: string | null;
  message?: string | null;
  /** Honeypot: hidden from people; bots tend to fill it. */
  website?: string | null;
};

export type ContactValues = {
  name: string;
  email: string;
  /** Normalised to digits with a leading + or 0, or null when not given. */
  phone: string | null;
  topic: ContactTopic;
  message: string;
};

export type ContactValidation =
  | { ok: true; values: ContactValues }
  | { ok: false; errors: Partial<Record<ContactField, string>> };

// Pragmatic check (one @, a dot in the domain, no spaces); the real check is
// a confirmation reply once a backend exists.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Pakistani phone numbers after removing spaces, dashes, dots and brackets:
 * mobile 03xx-xxxxxxx / +92 3xx xxxxxxx / 0092..., and landlines such as
 * 042-xxxxxxxx. Country code (+92 / 0092) or trunk 0, then either a mobile
 * number (3 + 9 digits) or a landline (area code not starting with 0/3,
 * 9-10 digits in total).
 */
const PK_PHONE_RE = /^(?:\+92|0092|0)(?:3\d{9}|[124-9]\d{8,9})$/;

export function normalizePhone(raw: string): string {
  return raw.replace(/[\s\-().]/g, "");
}

export function isValidPakistaniPhone(raw: string): boolean {
  return PK_PHONE_RE.test(normalizePhone(raw));
}

function isTopic(value: string): value is ContactTopic {
  return CONTACT_TOPICS.some((t) => t.value === value);
}

/** True when the honeypot was filled (treat as spam, show success, send nothing). */
export function isLikelySpam(input: ContactInput): boolean {
  return Boolean(input.website && input.website.trim() !== "");
}

export function validateContact(input: ContactInput): ContactValidation {
  const errors: Partial<Record<ContactField, string>> = {};

  const name = (input.name ?? "").trim();
  if (name === "") errors.name = "Enter your name.";
  else if (name.length < NAME_MIN) errors.name = `Name must be at least ${NAME_MIN} characters.`;
  else if (name.length > NAME_MAX) errors.name = `Name can't be more than ${NAME_MAX} characters.`;

  const email = (input.email ?? "").trim();
  if (email === "") errors.email = "Enter your email address.";
  else if (email.length > EMAIL_MAX || !EMAIL_RE.test(email)) {
    errors.email = "Enter a valid email address, like name@example.com.";
  }

  const phoneRaw = (input.phone ?? "").trim();
  const phone = phoneRaw === "" ? null : normalizePhone(phoneRaw);
  if (phone !== null && !PK_PHONE_RE.test(phone)) {
    errors.phone = "Enter a Pakistani number like 0300-1234567 or +92 300 1234567, or leave it empty.";
  }

  const topic = (input.topic ?? "").trim();
  if (topic === "") errors.topic = "Choose a topic.";
  else if (!isTopic(topic)) errors.topic = "Choose a topic from the list.";

  const message = (input.message ?? "").trim();
  if (message === "") errors.message = "Enter your message.";
  else if (message.length < MESSAGE_MIN) {
    errors.message = `Message must be at least ${MESSAGE_MIN} characters.`;
  } else if (message.length > MESSAGE_MAX) {
    errors.message = `Message can't be more than ${MESSAGE_MAX} characters.`;
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    values: { name, email, phone, topic: topic as ContactTopic, message },
  };
}

/** First invalid field in form order (for focus management). */
export function firstInvalidField(
  errors: Partial<Record<ContactField, string>>,
): ContactField | undefined {
  return CONTACT_FIELDS.find((f) => errors[f]);
}
