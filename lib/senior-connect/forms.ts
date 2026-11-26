/**
 * Senior Connect (Beta) sign-up forms: field definitions + pure validation.
 * No React, no I/O, so the same rules can run in a future server action.
 *
 * Two audiences:
 * - "student": someone preparing for entry tests / seeking admission (waitlist).
 * - "senior":  a bachelor student who wants to guide juniors (mentor sign-up).
 *
 * Shape mirrors future DB tables (`senior_connect_students`,
 * `senior_connect_seniors`); during the beta, submissions go to the team's
 * inbox through Web3Forms (lib/senior-connect/web3forms.ts) and are added to
 * the listing by hand.
 */
import { isValidEmail, isValidPakistaniPhone, normalizePhone } from "@/lib/contact/validate";

export type SignupKind = "student" | "senior";

type FieldRule = "name" | "email" | "phone" | "text" | "choice" | "consent";

export type SignupField = {
  name: string;
  label: string;
  rule: FieldRule;
  required: boolean;
  /** Choice options (rule "choice"). */
  options?: readonly { value: string; label: string }[];
  /** Offer the university list as suggestions (free text still allowed). */
  universitySuggestions?: boolean;
  autoComplete?: string;
  placeholder?: string;
  hint?: string;
  /** Spans both columns in the two-column layout. */
  wide?: boolean;
  /** Error shown when a required field is empty. */
  requiredMessage?: string;
};

export const TEXT_MAX = 120;
export const NAME_MIN = 2;
export const NAME_MAX = 80;

export const ENTRY_TEST_OPTIONS = [
  { value: "net", label: "NET (NUST)" },
  { value: "pu", label: "PU entry test" },
  { value: "ecat", label: "ECAT (UET)" },
  { value: "fast", label: "FAST-NUCES (NU test)" },
  { value: "nat", label: "NTS NAT" },
  { value: "mdcat", label: "MDCAT" },
  { value: "other", label: "Other / not sure yet" },
] as const;

const CONSENT = {
  name: "consent",
  rule: "consent",
  required: true,
  wide: true,
} as const;

export const SIGNUP_FORMS: Record<SignupKind, { fields: readonly SignupField[] }> = {
  student: {
    fields: [
      { name: "fullName", label: "Full name", rule: "name", required: true, autoComplete: "name", requiredMessage: "Enter your full name." },
      { name: "email", label: "Email", rule: "email", required: true, autoComplete: "email", requiredMessage: "Enter your email address." },
      {
        name: "phone",
        label: "WhatsApp number",
        rule: "phone",
        required: true,
        autoComplete: "tel",
        placeholder: "0300-1234567",
        hint: "We use it only to introduce you to your senior.",
        requiredMessage: "Enter your WhatsApp number.",
      },
      {
        name: "entryTest",
        label: "Entry test you're preparing for",
        rule: "choice",
        required: true,
        options: ENTRY_TEST_OPTIONS,
        requiredMessage: "Choose the entry test you're preparing for.",
      },
      {
        name: "targetUniversity",
        label: "Dream university",
        rule: "text",
        required: true,
        universitySuggestions: true,
        placeholder: "e.g. NUST, UET Lahore, FAST",
        wide: true,
        requiredMessage: "Enter the university you want to get into.",
      },
      {
        ...CONSENT,
        label: "I agree that Taleem ka Safar may contact me on WhatsApp or email about Senior Connect.",
      },
    ],
  },
  senior: {
    fields: [
      { name: "fullName", label: "Full name", rule: "name", required: true, autoComplete: "name", requiredMessage: "Enter your full name." },
      {
        name: "email",
        label: "Email",
        rule: "email",
        required: true,
        autoComplete: "email",
        hint: "Your university email helps us verify you faster.",
        requiredMessage: "Enter your email address.",
      },
      {
        name: "phone",
        label: "WhatsApp number",
        rule: "phone",
        required: true,
        autoComplete: "tel",
        placeholder: "0300-1234567",
        requiredMessage: "Enter your WhatsApp number.",
      },
      {
        name: "university",
        label: "University",
        rule: "text",
        required: true,
        universitySuggestions: true,
        placeholder: "e.g. NUST",
        requiredMessage: "Enter your university.",
      },
      {
        name: "campus",
        label: "Campus",
        rule: "text",
        required: true,
        placeholder: "e.g. H-12 Islamabad",
        requiredMessage: "Enter your campus.",
      },
      {
        name: "program",
        label: "Degree programme (optional)",
        rule: "text",
        required: false,
        placeholder: "e.g. BS Computer Science, 3rd year",
      },
      {
        ...CONSENT,
        label: "I agree that Taleem ka Safar may contact me and share my name, university and programme with students I'm matched with.",
      },
    ],
  },
};

export type SignupInput = Record<string, string | undefined>;
export type SignupValues = Record<string, string>;
export type SignupErrors = Record<string, string>;

export type SignupValidation =
  | { ok: true; values: SignupValues }
  | { ok: false; errors: SignupErrors };

/** Field value for a consent checkbox when ticked. */
export const CONSENT_YES = "yes";

/** Validate one sign-up form. Values are trimmed; phones are normalised. */
export function validateSignup(kind: SignupKind, input: SignupInput): SignupValidation {
  const errors: SignupErrors = {};
  const values: SignupValues = {};

  for (const field of SIGNUP_FORMS[kind].fields) {
    const raw = (input[field.name] ?? "").trim();

    if (field.rule === "consent") {
      if (raw !== CONSENT_YES) errors[field.name] = "Please tick this box to continue.";
      else values[field.name] = CONSENT_YES;
      continue;
    }

    if (raw === "") {
      if (field.required) {
        errors[field.name] = field.requiredMessage ?? "This field is required.";
      } else {
        values[field.name] = "";
      }
      continue;
    }

    switch (field.rule) {
      case "name":
        if (raw.length < NAME_MIN) errors[field.name] = `Name must be at least ${NAME_MIN} characters.`;
        else if (raw.length > NAME_MAX) errors[field.name] = `Name can't be more than ${NAME_MAX} characters.`;
        else values[field.name] = raw;
        break;
      case "email":
        if (!isValidEmail(raw)) errors[field.name] = "Enter a valid email address, like name@example.com.";
        else values[field.name] = raw;
        break;
      case "phone":
        if (!isValidPakistaniPhone(raw)) {
          errors[field.name] = "Enter a Pakistani number like 0300-1234567 or +92 300 1234567.";
        } else values[field.name] = normalizePhone(raw);
        break;
      case "choice":
        if (!field.options?.some((o) => o.value === raw)) errors[field.name] = "Choose an option from the list.";
        else values[field.name] = raw;
        break;
      case "text":
        if (raw.length > TEXT_MAX) errors[field.name] = `Keep this under ${TEXT_MAX} characters.`;
        else values[field.name] = raw;
        break;
    }
  }

  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, values };
}

/** First invalid field in form order (for focus management). */
export function firstInvalidField(kind: SignupKind, errors: SignupErrors): string | undefined {
  return SIGNUP_FORMS[kind].fields.find((f) => errors[f.name])?.name;
}

/** Display label for a stored choice value (e.g. "net" -> "NET (NUST)"). */
export function choiceLabel(field: SignupField, value: string): string {
  return field.options?.find((o) => o.value === value)?.label ?? value;
}
