import type { Tone } from "@/lib/subject-tone";

/**
 * Class names per soft tone (literal strings so Tailwind can see them).
 * - `tile`: tinted square behind an icon or number
 * - `chip`: tinted pill with tone text
 * - `text` / `bar`: deep tone for text and progress fills
 * - `border` / `hoverBorder`: tinted card edges
 * - `solid`: deep fill with white text (current/active markers)
 * - `panel`: large soft background with a tinted edge
 */
export type ToneClasses = {
  tile: string;
  chip: string;
  text: string;
  bar: string;
  border: string;
  hoverBorder: string;
  topBorder: string;
  solid: string;
  panel: string;
};

export const toneClasses: Record<Tone, ToneClasses> = {
  blue: {
    tile: "bg-tone-blue-soft text-tone-blue",
    chip: "bg-tone-blue-soft text-tone-blue",
    text: "text-tone-blue",
    bar: "bg-tone-blue",
    border: "border-tone-blue/25",
    hoverBorder: "hover:border-tone-blue/50",
    topBorder: "border-t-tone-blue/60",
    solid: "bg-tone-blue text-on-brand",
    panel: "border-tone-blue/15 bg-tone-blue-soft",
  },
  violet: {
    tile: "bg-tone-violet-soft text-tone-violet",
    chip: "bg-tone-violet-soft text-tone-violet",
    text: "text-tone-violet",
    bar: "bg-tone-violet",
    border: "border-tone-violet/25",
    hoverBorder: "hover:border-tone-violet/50",
    topBorder: "border-t-tone-violet/60",
    solid: "bg-tone-violet text-on-brand",
    panel: "border-tone-violet/15 bg-tone-violet-soft",
  },
  teal: {
    tile: "bg-tone-teal-soft text-tone-teal",
    chip: "bg-tone-teal-soft text-tone-teal",
    text: "text-tone-teal",
    bar: "bg-tone-teal",
    border: "border-tone-teal/25",
    hoverBorder: "hover:border-tone-teal/50",
    topBorder: "border-t-tone-teal/60",
    solid: "bg-tone-teal text-on-brand",
    panel: "border-tone-teal/15 bg-tone-teal-soft",
  },
  amber: {
    tile: "bg-tone-amber-soft text-tone-amber",
    chip: "bg-tone-amber-soft text-tone-amber",
    text: "text-tone-amber",
    bar: "bg-tone-amber",
    border: "border-tone-amber/25",
    hoverBorder: "hover:border-tone-amber/50",
    topBorder: "border-t-tone-amber/60",
    solid: "bg-tone-amber text-on-brand",
    panel: "border-tone-amber/15 bg-tone-amber-soft",
  },
  rose: {
    tile: "bg-tone-rose-soft text-tone-rose",
    chip: "bg-tone-rose-soft text-tone-rose",
    text: "text-tone-rose",
    bar: "bg-tone-rose",
    border: "border-tone-rose/25",
    hoverBorder: "hover:border-tone-rose/50",
    topBorder: "border-t-tone-rose/60",
    solid: "bg-tone-rose text-on-brand",
    panel: "border-tone-rose/15 bg-tone-rose-soft",
  },
};

/** Tones for app areas, so the nav, section headings and pages agree. */
export const areaTone = {
  home: "blue",
  subjects: "teal",
  mocks: "violet",
  progress: "amber",
} as const satisfies Record<string, Tone>;
