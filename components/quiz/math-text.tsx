import { parseMath } from "@/lib/quiz/math";

/**
 * Renders question/option text with proper math typography: superscripts
 * (x², eⁿ), subscripts (H₂O), and symbol substitution (√, ≤, π, ×...).
 * Server-renderable (no client JS). For full LaTeX later, swap the internals
 * here without touching callers.
 */
export function MathText({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const segments = parseMath(children);
  return (
    <span className={className}>
      {segments.map((seg, i) => {
        if (seg.type === "sup") {
          return (
            <sup key={i} className="text-[0.7em] font-semibold">
              {seg.value}
            </sup>
          );
        }
        if (seg.type === "sub") {
          return (
            <sub key={i} className="text-[0.7em] font-semibold">
              {seg.value}
            </sub>
          );
        }
        return <span key={i}>{seg.value}</span>;
      })}
    </span>
  );
}
