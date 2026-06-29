/**
 * Lightweight plain-text math formatter (pure, no deps) — turns the ad-hoc
 * notation in our question bank (e.g. `x^2`, `H_2O`, `sqrt(3)`, `>=`, `pi`)
 * into nicely renderable segments. This is NOT a full LaTeX engine; it handles
 * the common cases present in the data so equations read like math instead of
 * raw symbols.
 */

export type MathSegment =
  | { type: "text"; value: string }
  | { type: "sup"; value: string }
  | { type: "sub"; value: string };

/** Whole-word symbol replacements (Greek letters, sqrt, operators). */
const WORD_SYMBOLS: [RegExp, string][] = [
  [/\bsqrt\b/g, "√"],
  [/\btheta\b/g, "θ"],
  [/\balpha\b/g, "α"],
  [/\bbeta\b/g, "β"],
  [/\bgamma\b/g, "γ"],
  [/\bdelta\b/g, "δ"],
  [/\blambda\b/g, "λ"],
  [/\bomega\b/g, "ω"],
  [/\bmu\b/g, "μ"],
  [/\bpi\b/g, "π"],
  [/\bphi\b/g, "φ"],
  [/\bInfinity\b/g, "∞"],
  [/\binfinity\b/g, "∞"],
];

/** Symbolic operator replacements (safe, non-word). Order matters. */
const OP_SYMBOLS: [RegExp, string][] = [
  [/<=>/g, "⇔"],
  [/<=/g, "≤"],
  [/>=/g, "≥"],
  [/!=/g, "≠"],
  [/\+\/-/g, "±"],
  [/\+-/g, "±"],
  [/-->/g, "→"],
  [/->/g, "→"],
  [/\bx\b\s/g, "x "], // keep variable x as-is (no replacement, placeholder)
  [/\*/g, "×"],
  [/\bdegrees?\b/g, "°"],
];

/** Apply symbol replacements to a raw string. */
export function applySymbols(text: string): string {
  let out = text;
  for (const [re, rep] of OP_SYMBOLS) out = out.replace(re, rep);
  for (const [re, rep] of WORD_SYMBOLS) out = out.replace(re, rep);
  return out;
}

/**
 * Parse a string into text / superscript / subscript segments.
 * - `^2`, `^n`, `^-1`, `^{n+1}` → superscript
 * - `_2`, `_n`, `_{i+1}` → subscript
 * The exponent/index run is `{...}` or a sign + alphanumerics.
 */
export function parseMath(input: string): MathSegment[] {
  const text = applySymbols(input);
  const segments: MathSegment[] = [];
  let buffer = "";
  let i = 0;

  const flush = () => {
    if (buffer) {
      segments.push({ type: "text", value: buffer });
      buffer = "";
    }
  };

  while (i < text.length) {
    const ch = text[i];
    if (ch === "^" || ch === "_") {
      const type = ch === "^" ? "sup" : "sub";
      let j = i + 1;
      let value = "";
      if (text[j] === "{") {
        // Braced group: take until matching close brace.
        j += 1;
        while (j < text.length && text[j] !== "}") {
          value += text[j];
          j += 1;
        }
        j += 1; // skip closing brace
      } else {
        // Optional sign then EITHER a run of digits (e.g. ^10, _2) OR a single
        // letter (e.g. e^n, a_i). This stops `H_2O` from eating the `O`.
        if (text[j] === "-" || text[j] === "+") {
          value += text[j];
          j += 1;
        }
        if (j < text.length && /[0-9]/.test(text[j])) {
          while (j < text.length && /[0-9.]/.test(text[j])) {
            value += text[j];
            j += 1;
          }
        } else if (j < text.length && /[a-zA-Z]/.test(text[j])) {
          value += text[j];
          j += 1;
        }
      }
      if (value) {
        flush();
        segments.push({ type, value });
        i = j;
        continue;
      }
    }
    buffer += ch;
    i += 1;
  }
  flush();
  return segments;
}

/** Whether a string likely contains math notation worth formatting. */
export function hasMath(text: string): boolean {
  return /[\^_]|sqrt|<=|>=|!=|\+-|\bpi\b|\btheta\b|\*/.test(text);
}
