"use client";

import { useId, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { seniorConnect } from "@/config/senior-connect";
import { siteConfig } from "@/config/site";
import {
  CONSENT_YES,
  SIGNUP_FORMS,
  TEXT_MAX,
  firstInvalidField,
  validateSignup,
  type SignupErrors,
  type SignupField,
  type SignupKind,
} from "@/lib/senior-connect/forms";
import { submitSignup, type SubmitResult } from "@/lib/senior-connect/web3forms";
import { marketingButton } from "@/components/marketing/button-link";
import { cn } from "@/lib/utils";

/** Public Web3Forms access key (inlined at build time; not a secret). */
const ACCESS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

const fieldClass =
  "w-full rounded-xl border border-outline bg-surface-lowest px-4 text-base text-on-surface placeholder:text-on-surface-variant/70 transition-colors focus-visible:border-brand-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-container aria-[invalid=true]:border-danger";

function joinIds(...ids: (string | false | undefined)[]): string | undefined {
  return ids.filter(Boolean).join(" ") || undefined;
}

function failureMessage(reason: Exclude<SubmitResult, { ok: true }>["reason"]): string {
  const whatsapp = `WhatsApp at ${siteConfig.contact.phone}`;
  switch (reason) {
    case "not_configured":
      return `Sign-ups aren't connected yet. Message us on ${whatsapp} and we'll add you.`;
    case "rate_limited":
      return "Lots of people are signing up right now. Please try again in a minute.";
    default:
      return `We couldn't send your sign-up. Check your connection and try again, or message us on ${whatsapp}.`;
  }
}

type Props = {
  kind: SignupKind;
  /** University names offered as suggestions (free text still allowed). */
  universities: string[];
};

/**
 * Senior Connect (Beta) sign-up form. Validates with lib/senior-connect/forms
 * and delivers through Web3Forms from the browser. A hidden honeypot drops
 * obvious bots without sending anything.
 */
export function SignupForm({ kind, universities }: Props) {
  const fields = SIGNUP_FORMS[kind].fields;
  const copy = seniorConnect.forms[kind];
  const baseId = useId();
  const id = (name: string) => `${baseId}-${name}`;
  const listId = id("universities");

  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<SignupErrors>({});
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState("");
  const [doneName, setDoneName] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const honeypot = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  function set(name: string, value: string) {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) {
      setErrors((e) => {
        const copyErrors = { ...e };
        delete copyErrors[name];
        return copyErrors;
      });
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setFailure("");
    const result = validateSignup(kind, values);
    if (!result.ok) {
      setErrors(result.errors);
      const count = Object.keys(result.errors).length;
      setStatus(`Please fix ${count} ${count === 1 ? "field" : "fields"}.`);
      const first = firstInvalidField(kind, result.errors);
      if (first) document.getElementById(id(first))?.focus();
      return;
    }
    setErrors({});
    const firstName = result.values.fullName.split(/\s+/)[0] ?? result.values.fullName;

    // Bots fill the hidden field: pretend success, send nothing.
    if (honeypot.current?.checked) {
      setDoneName(firstName);
      return;
    }

    setPending(true);
    setStatus("Sending your sign-up…");
    const sent = await submitSignup(kind, result.values, ACCESS_KEY);
    setPending(false);
    if (sent.ok) {
      setStatus("");
      setDoneName(firstName);
      requestAnimationFrame(() => successRef.current?.focus());
    } else {
      const message = failureMessage(sent.reason);
      setFailure(message);
      setStatus(message);
    }
  }

  if (doneName !== null) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="flex flex-col items-start rounded-xl bg-success-fixed p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-container"
      >
        <CheckCircle2 className="size-8 text-success" aria-hidden="true" />
        <h4 className="mt-4 font-headline text-xl font-bold tracking-tight text-on-surface">
          {copy.successTitle(doneName)}
        </h4>
        <p className="mt-2 leading-relaxed text-on-surface-variant">{copy.successBody}</p>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5" aria-busy={pending}>
      {fields.some((f) => f.universitySuggestions) ? (
        <datalist id={listId}>
          {universities.map((u) => (
            <option key={u} value={u} />
          ))}
        </datalist>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        {fields.map((field) => (
          <FieldControl
            key={field.name}
            field={field}
            id={id(field.name)}
            listId={field.universitySuggestions ? listId : undefined}
            value={values[field.name] ?? ""}
            error={errors[field.name]}
            onChange={(v) => set(field.name, v)}
          />
        ))}
      </div>

      {/* Honeypot: hidden from people and assistive tech; bots tick it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id("botcheck")}>Do not tick</label>
        <input ref={honeypot} id={id("botcheck")} type="checkbox" tabIndex={-1} autoComplete="off" />
      </div>

      {failure ? (
        <p className="flex items-start gap-2 rounded-xl bg-danger-fixed px-4 py-3 text-sm font-medium text-danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {failure}
        </p>
      ) : null}

      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>

      <button
        type="submit"
        disabled={pending}
        className={cn(
          marketingButton({ variant: "primary", size: "lg" }),
          "w-full disabled:cursor-wait disabled:opacity-80",
        )}
      >
        {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
        {pending ? "Sending…" : copy.submit}
      </button>
    </form>
  );
}

type FieldControlProps = {
  field: SignupField;
  id: string;
  listId?: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

function FieldControl({ field, id, listId, value, error, onChange }: FieldControlProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = joinIds(error && errorId, field.hint && hintId);
  const span = field.wide ? "sm:col-span-2" : undefined;

  if (field.rule === "consent") {
    return (
      <div className={cn("flex flex-col gap-2", span)}>
        <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-on-surface-variant">
          <input
            id={id}
            type="checkbox"
            checked={value === CONSENT_YES}
            onChange={(e) => onChange(e.target.checked ? CONSENT_YES : "")}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className="mt-0.5 size-5 shrink-0 cursor-pointer rounded accent-brand"
          />
          <span>{field.label}</span>
        </label>
        <FieldError id={errorId} message={error} />
      </div>
    );
  }

  const label = (
    <label htmlFor={id} className="text-sm font-medium text-on-surface">
      {field.label} {field.required ? <span aria-hidden="true">*</span> : null}
    </label>
  );

  const common = {
    id,
    value,
    required: field.required,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
  } as const;

  return (
    <div className={cn("flex flex-col gap-2", span)}>
      {label}
      {field.rule === "choice" ? (
        <select
          {...common}
          onChange={(e) => onChange(e.target.value)}
          className={cn(fieldClass, "h-12 appearance-auto")}
        >
          <option value="">Choose one</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...common}
          type={field.rule === "email" ? "email" : field.rule === "phone" ? "tel" : "text"}
          inputMode={field.rule === "phone" ? "tel" : field.rule === "email" ? "email" : undefined}
          autoComplete={field.autoComplete ?? "off"}
          placeholder={field.placeholder}
          list={listId}
          maxLength={field.rule === "text" ? TEXT_MAX : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={cn(fieldClass, "h-12")}
        />
      )}
      <FieldError id={errorId} message={error} />
      {field.hint ? (
        <p id={hintId} className="text-xs text-on-surface-variant">
          {field.hint}
        </p>
      ) : null}
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="flex items-start gap-1.5 text-sm font-medium text-danger">
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}
