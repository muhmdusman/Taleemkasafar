# Design System — "Soft Brutalism" (The Architectural Playground)

ALWAYS follow this when building or reviewing UI. Source of truth:
`ui_design/design_scheme/DESIGN.md` and the per-screen HTML in `ui_design/*/code.html`.
Reference designs: each `ui_design/<screen>/screen.png` + `code.html` (desktop +
mobile variants). Port these to React/Next components — never copy raw HTML.

## Non-negotiable rules
- **0px border-radius** everywhere (buttons, cards, inputs). Exception: `rounded-full`
  only for pills/avatars if explicitly needed.
- **2px solid black borders** (`border-2 border-black`) on interactive elements
  and cards. NEVER 1px or grey hairlines.
- **Hard shadows, never blur**: use `shadow-hard` (4px 4px solid black) or
  `shadow-hard-primary`. No soft/SaaS drop shadows.
- **Left-aligned, editorial layouts**. Avoid centered marketing layouts.
- **Generous whitespace** between sections.

## Colors (Tailwind tokens, defined in tailwind.config.ts)
- `ink` = #000000, `surface-lowest` (#fff), `surface` (#f9f9f9),
  `surface-container` (#eeeeee), `surface-low` (#f3f3f4), `surface-high` (#e8e8e8),
  `surface-variant` (#e2e2e2).
- `brand` = #0058be (electric blue, the action/progress accent),
  `brand-container` = #2170e4, `brand-fixed` = #d8e2ff (gamified card bg).
- `on-surface` = #1a1c1c (text), `on-surface-variant` = #424754 (muted text).
- `outline` = #727785, `outline-variant` = #c2c6d6.
- `danger` = #ba1a1a (errors only).
- Palette is strictly B&W + electric blue. No pastel overload.

## Typography
- `font-headline` = Space Grotesk (headings, CTAs, labels). Bold/black weights,
  tight tracking (`tracking-tighter`/`tracking-tight`), often `uppercase`.
- `font-body` = Inter (body, inputs, paragraphs). This is the default body font.

## Component patterns
- **Primary button**: `bg-black text-white border-2 border-black shadow-hard
  hover:bg-brand` + active press (`active:translate-x-[2px] active:translate-y-[2px]
  active:shadow-none`). Square, uppercase headline font.
- **Secondary button**: `bg-white text-black border-2 border-black` + same hover/press.
- **Card**: `bg-surface-lowest border-2 border-black` (+ `shadow-hard` for emphasis).
  Gamified cards use `bg-brand-fixed`. No internal dividers — separate with spacing.
- **Input**: `border-2 border-black` default; focus = brand border + hard-primary
  shadow (`focus:border-brand focus:shadow-hard-primary`). Error = `border-danger`.
- **Progress bar**: track `bg-surface-high border-2 border-black`, fill solid `bg-brand`,
  no gradient.

## Brand identity
- Header/brand text is **"Taleem ka Safar"** (NOT "TEST_ARCHITECT" from the mockups —
  the mockups are templates; use our real product name).

## Architecture rules (how we build it)
- Build with React + Next.js App Router components. Port the HTML designs into
  composable components under `components/` (primitives in `components/ui/`).
- **Business logic lives on the server**: use Server Components for data fetching
  and Server Actions / route handlers for mutations (auth, attempts, scoring).
  Client Components only for interactivity (form state, toggles).
- Responsiveness: desktop + mobile variants exist per screen. Build responsive
  with Tailwind breakpoints; we will refine mobile later but structure for it now.
- GitHub social button: render it (per design) but it is non-functional for now
  (only Google + email/password are wired).
