import { cn } from "@/lib/utils";

/** Public-site content width + side padding (360px → 1440px). */
export function Container({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-6", className)} {...props} />;
}

type SectionHeadingProps = {
  id: string;
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
};

/** Left-aligned editorial section heading: eyebrow, h2, intro. */
export function SectionHeading({ id, eyebrow, title, description, className }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow ? (
        <p className="font-headline text-sm font-semibold uppercase tracking-widest text-on-surface-variant">
          {eyebrow}
        </p>
      ) : null}
      <h2
        id={id}
        className="mt-3 font-headline text-3xl font-bold tracking-tight text-on-surface sm:text-4xl"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">{description}</p>
      ) : null}
    </div>
  );
}
