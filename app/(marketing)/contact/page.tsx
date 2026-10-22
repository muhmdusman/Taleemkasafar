import { Clock, Mail, MessageCircle, Phone, type LucideIcon } from "lucide-react";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo/metadata";
import { routes } from "@/lib/routes";
import { Container } from "@/components/marketing/container";
import { PageHeader } from "@/components/marketing/page-header";
import { ContactForm } from "@/components/marketing/contact/contact-form";

export const metadata = buildMetadata({
  title: "Contact Us",
  description: `Questions about entry test preparation, your account, or bringing ${siteConfig.name} to your academy? Send us a message and our team will help.`,
  path: routes.contact,
});

const { email, phone, phoneE164, whatsappUrl, responseTime } = siteConfig.contact;

const valueLinkClass =
  "rounded-md font-medium text-brand-container underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-container";

/** Email as a mailto link. */
function EmailValue() {
  return (
    <a href={`mailto:${email}`} className={valueLinkClass}>
      {email}
    </a>
  );
}

type InfoCard = { icon: LucideIcon; title: string; body: string; value: React.ReactNode };

const cards: InfoCard[] = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    body: "Fastest for quick questions, and the best way for academies to reach us.",
    value: (
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={valueLinkClass}>
        Chat on WhatsApp: {phone}
        <span className="sr-only"> (opens WhatsApp)</span>
      </a>
    ),
  },
  {
    icon: Phone,
    title: "Phone",
    body: "Prefer to talk? Give us a call.",
    value: (
      <a href={`tel:${phoneE164}`} className={valueLinkClass}>
        {phone}
      </a>
    ),
  },
  {
    icon: Mail,
    title: "Email",
    body: "Best for detailed questions, account issues and partnership requests.",
    value: <EmailValue />,
  },
  {
    icon: Clock,
    title: "Response time",
    body: "We read every message and reply quickly.",
    value: <span className="font-medium text-on-surface">{responseTime}</span>,
  },
];

/** /contact: info cards + contact form UI (no backend yet). */
export default function ContactPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { name: "Home", path: routes.home },
          { name: "Contact", path: routes.contact },
        ]}
        eyebrow="Contact"
        title="Get in touch"
        description="Have a question about your preparation, your account or working with us? Tell us what you need and we will point you in the right direction."
      />
      <Container className="grid items-start gap-8 py-12 md:py-16 lg:grid-cols-[1fr_1.6fr] lg:gap-12">
        <section aria-labelledby="contact-info-heading">
          <h2
            id="contact-info-heading"
            className="font-headline text-2xl font-bold tracking-tight text-on-surface"
          >
            Other ways to reach us
          </h2>
          <ul className="mt-6 flex flex-col gap-4">
            {cards.map(({ icon: Icon, title, body, value }) => (
              <li
                key={title}
                className="flex gap-4 rounded-2xl border border-outline-variant bg-surface-lowest p-5 shadow-soft"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-fixed text-brand-container">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-headline text-base font-bold text-on-surface">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">{body}</p>
                  <p className="mt-2 break-words text-sm">{value}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section
          aria-labelledby="contact-form-heading"
          className="rounded-2xl border border-outline-variant bg-surface-lowest p-5 shadow-soft sm:p-8"
        >
          <h2
            id="contact-form-heading"
            className="font-headline text-2xl font-bold tracking-tight text-on-surface"
          >
            Send us a message
          </h2>
          <div className="mt-6">
            <ContactForm
              emailSlot={<EmailValue />}
              whatsappSlot={
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={valueLinkClass}>
                  {phone}
                  <span className="sr-only"> (opens WhatsApp)</span>
                </a>
              }
            />
          </div>
        </section>
      </Container>
    </>
  );
}
