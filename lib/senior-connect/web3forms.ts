/**
 * Web3Forms delivery for Senior Connect sign-ups (beta, no database yet).
 *
 * Web3Forms emails each submission to the inbox that owns the access key.
 * It must be called from the BROWSER on the free plan (server-side calls need
 * a paid plan + IP allow-listing), so the key is a public NEXT_PUBLIC_ value.
 * The access key is not a secret: it can only send email to its owner.
 * Free plan: 250 submissions / month.
 *
 * Docs: https://docs.web3forms.com/getting-started/api-reference
 */
import {
  SIGNUP_FORMS,
  choiceLabel,
  type SignupKind,
  type SignupValues,
} from "@/lib/senior-connect/forms";

export const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

const SUBJECTS: Record<SignupKind, (v: SignupValues) => string> = {
  student: (v) => `Senior Connect (Beta): student waitlist - ${v.fullName} (${v.targetUniversity})`,
  senior: (v) => `Senior Connect (Beta): new senior - ${v.fullName} (${v.university}, ${v.campus})`,
};

const FORM_LABEL: Record<SignupKind, string> = {
  student: "Student seeking admission (waitlist)",
  senior: "Bachelor student (senior mentor)",
};

/**
 * Request body for Web3Forms. Field labels are used as keys so the email
 * reads cleanly; `email` is a reserved key that sets the reply-to address.
 */
export function buildWeb3FormsPayload(
  kind: SignupKind,
  values: SignupValues,
  accessKey: string,
): Record<string, string | boolean> {
  const payload: Record<string, string | boolean> = {
    access_key: accessKey,
    subject: SUBJECTS[kind](values),
    from_name: "Taleem ka Safar - Senior Connect",
    botcheck: false,
    "Form": FORM_LABEL[kind],
  };
  for (const field of SIGNUP_FORMS[kind].fields) {
    const value = values[field.name] ?? "";
    if (field.rule === "consent") {
      payload["Consent to be contacted"] = value === "yes" ? "Yes" : "No";
    } else if (field.rule === "choice") {
      payload[field.label] = choiceLabel(field, value);
    } else if (field.rule === "email") {
      payload.email = value;
    } else {
      payload[field.label.replace(/ \(optional\)$/, "")] = value || "-";
    }
  }
  return payload;
}

export type SubmitResult =
  | { ok: true }
  | { ok: false; reason: "not_configured" | "rate_limited" | "rejected" | "network" };

/** Send a sign-up. Never throws; `fetchImpl` is injectable for tests. */
export async function submitSignup(
  kind: SignupKind,
  values: SignupValues,
  accessKey: string | undefined,
  fetchImpl: typeof fetch = fetch,
): Promise<SubmitResult> {
  if (!accessKey) return { ok: false, reason: "not_configured" };
  try {
    const res = await fetchImpl(WEB3FORMS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(buildWeb3FormsPayload(kind, values, accessKey)),
    });
    if (res.status === 429) return { ok: false, reason: "rate_limited" };
    const data = (await res.json().catch(() => null)) as { success?: boolean } | null;
    return res.ok && data?.success === true ? { ok: true } : { ok: false, reason: "rejected" };
  } catch {
    return { ok: false, reason: "network" };
  }
}
