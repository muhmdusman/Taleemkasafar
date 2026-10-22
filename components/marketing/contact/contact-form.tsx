"use client";

import { useId, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import {
  CONTACT_TOPICS,
  MESSAGE_MAX,
  MESSAGE_MIN,
  firstInvalidField,
  isLikelySpam,
  validateContact,
  type ContactField,
  type ContactInput,
} from "@/lib/contact/validate";
import { marketingButton } from "@/components/marketing/button-link";
import { cn } from "@/lib/utils";

const fieldClass =
  "w-full rounded-xl border border-outline bg-surface-lowest px-4 text-base text-on-surface placeholder:text-on-surface-variant transition-colors focus-visible:border-brand-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-container aria-[invalid=true]:border-danger";

type FormValues = { [K in keyof ContactInput]-?: string };

const EMPTY: FormValues = {
  name: "",
  email: "",
  phone: "",
  topic: "",
  message: "",
  website: "",
};

/** Space-separated id list for aria-describedby (undefined when empty). */
function joinIds(...ids: (string | false | undefined)[]): string | undefined {
  const list = ids.filter(Boolean).join(" ");
  return list || undefined;
}

type Props = {
  /** Contact email link (rendered by the server). */
  emailSlot: React.ReactNode;
  /** WhatsApp link (rendered by the server). */
  whatsappSlot: React.ReactNode;
};

/**
 * Contact form UI. NO backend yet: a valid submit shows an honest "not sent"
 * state that points to email. Validation lives in lib/contact/validate.ts.
 */
export function ContactForm({ emailSlot, whatsappSlot }: Props) {
  const baseId = useId();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>({});
  const [done, setDone] = useState(false);
  const [status, setStatus] = useState("");
  const successRef = useRef<HTMLDivElement>(null);

  const id = (field: string) => `${baseId}-${field}`;

  function set(field: keyof ContactInput, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    if (field !== "website" && errors[field]) {
      setErrors((e) => {
        const copy = { ...e };
        delete copy[field];
        return copy;
      });
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = validateContact(values);
    if (!result.ok) {
      setErrors(result.errors);
      const count = Object.keys(result.errors).length;
      setStatus(`Please fix ${count} ${count === 1 ? "field" : "fields"}.`);
      const first = firstInvalidField(result.errors);
      if (first) document.getElementById(id(first))?.focus();
      return;
    }
    setErrors({});
    if (!isLikelySpam(values)) {
      // TODO(backend): call a server action here (e.g. app/(marketing)/contact/actions.ts
      // `sendContactMessage(result.values)`) that re-runs validateContact on the
      // server, rate-limits, and stores/sends the message. Until then nothing is sent.
    }
    setDone(true);
    setStatus("");
    // Move focus to the confirmation so keyboard/screen-reader users hear it.
    requestAnimationFrame(() => successRef.current?.focus());
  }

  if (done) {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="rounded-2xl border-2 border-ink bg-surface-lowest p-6 shadow-hard focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-container sm:p-8"
      >
        <CheckCircle2 className="size-8 text-success" aria-hidden="true" />
        <h3 className="mt-4 font-headline text-2xl font-bold tracking-tight text-on-surface">
          Thanks, your message is ready
        </h3>
        <p className="mt-3 leading-relaxed text-on-surface-variant">
          Our contact form isn&apos;t connected yet, so this message has{" "}
          <strong className="font-semibold text-on-surface">not been sent</strong>. Please
          email us at {emailSlot} or message us on WhatsApp at {whatsappSlot} for now. Use
          &ldquo;Back to my message&rdquo; to copy what you wrote.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className={cn(marketingButton({ variant: "secondary", size: "md" }), "mt-6")}
        >
          Back to my message
        </button>
      </div>
    );
  }

  const messageLength = values.message.trim().length;

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
      <p className="text-sm text-on-surface-variant">
        Fields marked <span aria-hidden="true">*</span>
        <span className="sr-only">with an asterisk</span> are required.
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id={id("name")}
          label="Full name"
          required
          autoComplete="name"
          value={values.name}
          error={errors.name}
          onChange={(v) => set("name", v)}
        />
        <TextField
          id={id("email")}
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={values.email}
          error={errors.email}
          onChange={(v) => set("email", v)}
        />
        <TextField
          id={id("phone")}
          label="Phone or WhatsApp (optional)"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          hint="Pakistani numbers, e.g. 0300-1234567 or +92 300 1234567."
          value={values.phone}
          error={errors.phone}
          onChange={(v) => set("phone", v)}
        />
        <div className="flex flex-col gap-2">
          <label htmlFor={id("topic")} className="text-sm font-medium text-on-surface">
            Topic <span aria-hidden="true">*</span>
          </label>
          <select
            id={id("topic")}
            required
            value={values.topic}
            onChange={(e) => set("topic", e.target.value)}
            aria-invalid={errors.topic ? true : undefined}
            aria-describedby={errors.topic ? `${id("topic")}-error` : undefined}
            className={cn(fieldClass, "h-12 appearance-auto")}
          >
            <option value="">Choose a topic</option>
            {CONTACT_TOPICS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <FieldError id={`${id("topic")}-error`} message={errors.topic} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor={id("message")} className="text-sm font-medium text-on-surface">
          Message <span aria-hidden="true">*</span>
        </label>
        <textarea
          id={id("message")}
          required
          rows={6}
          maxLength={MESSAGE_MAX}
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={joinIds(errors.message && `${id("message")}-error`, `${id("message")}-hint`)}
          className={cn(fieldClass, "min-h-36 py-3 leading-relaxed")}
        />
        <FieldError id={`${id("message")}-error`} message={errors.message} />
        <p id={`${id("message")}-hint`} className="text-xs text-on-surface-variant">
          {MESSAGE_MIN} to {MESSAGE_MAX} characters. {messageLength} used.
        </p>
      </div>

      {/* Honeypot: hidden from people and assistive tech; bots fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id("website")}>Website</label>
        <input
          id={id("website")}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(e) => set("website", e.target.value)}
        />
      </div>

      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>

      <button
        type="submit"
        className={cn(marketingButton({ variant: "primary", size: "lg" }), "self-start")}
      >
        <Send aria-hidden="true" />
        Send message
      </button>
    </form>
  );
}

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  placeholder?: string;
};

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  required,
  type = "text",
  autoComplete,
  inputMode,
  placeholder,
}: TextFieldProps) {
  const describedBy = joinIds(error && `${id}-error`, hint && `${id}-hint`);
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-on-surface">
        {label} {required ? <span aria-hidden="true">*</span> : null}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(fieldClass, "h-12")}
      />
      <FieldError id={`${id}-error`} message={error} />
      {hint ? (
        <p id={`${id}-hint`} className="text-xs text-on-surface-variant">
          {hint}
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
