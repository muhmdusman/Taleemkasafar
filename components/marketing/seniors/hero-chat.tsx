import { BadgeCheck, GraduationCap, MapPin } from "lucide-react";

/**
 * Decorative "sample conversation" between a student and a senior, built in
 * JSX (no images). Fictional sample content only, so it is hidden from
 * assistive tech; the page text carries the real message.
 */
export function HeroChat() {
  const messages = [
    {
      from: "student" as const,
      text: "How did you manage FSc and NET preparation at the same time?",
    },
    {
      from: "senior" as const,
      text: "I kept two hours a day for NET from January and sat one timed mock every weekend. Happy to share my plan.",
    },
    {
      from: "student" as const,
      text: "And what is hostel life like in first year?",
    },
  ];

  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="rounded-2xl bg-surface-lowest p-5 text-on-surface shadow-soft-lg sm:p-6">
        <div className="flex items-center justify-between gap-3 border-b border-outline-variant pb-4">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-ink font-headline text-sm font-bold text-on-ink">
              SA
            </span>
            <div>
              <p className="flex items-center gap-1.5 font-headline text-sm font-semibold">
                Senior · BS Mechanical
                <BadgeCheck className="size-4 text-brand" />
              </p>
              <p className="flex items-center gap-1 text-xs text-on-surface-variant">
                <MapPin className="size-3" />
                NUST, Islamabad
              </p>
            </div>
          </div>
          <span className="shrink-0 whitespace-nowrap rounded-full bg-surface-container px-2.5 py-1 text-xs font-medium text-on-surface-variant">
            Sample chat
          </span>
        </div>

        <ul className="mt-4 flex flex-col gap-3 text-sm leading-relaxed">
          {messages.map((m, i) => (
            <li key={i} className={m.from === "student" ? "flex justify-end" : "flex justify-start"}>
              <p
                className={
                  m.from === "student"
                    ? "max-w-[85%] rounded-2xl rounded-br-md bg-brand px-4 py-2.5 text-on-brand"
                    : "max-w-[85%] rounded-2xl rounded-bl-md bg-surface-container px-4 py-2.5 text-on-surface"
                }
              >
                {m.text}
              </p>
            </li>
          ))}
          <li className="flex justify-start">
            <span className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-surface-container px-4 py-3">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="size-1.5 animate-pulse rounded-full bg-on-surface-variant motion-reduce:animate-none"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </span>
          </li>
        </ul>
      </div>

      <div className="relative -mt-5 ml-auto flex w-fit items-center gap-3 rounded-xl border-2 border-ink bg-surface-lowest px-4 py-3 text-on-surface shadow-hard sm:-mr-4">
        <span className="flex size-9 items-center justify-center rounded-lg bg-brand-fixed text-brand">
          <GraduationCap className="size-5" />
        </span>
        <div>
          <p className="font-headline text-sm font-bold">Matched by university</p>
          <p className="text-xs text-on-surface-variant">FSc student, Lahore → NUST senior</p>
        </div>
      </div>
    </div>
  );
}
