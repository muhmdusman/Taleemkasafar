# Design System — "Soft Brutalism, Calm Edition"

ALWAYS follow this when building or reviewing UI. Source of truth:
**`.kiro/context/DESIGN.md` (committed)** — palette, contrast targets, components.
Layout references: `ui_design/<screen>/screen.png` + `code.html` (gitignored,
desktop + mobile variants). Port to React/Next components — never copy raw HTML.

## Non-negotiable rules
- **Tokens only for color.** Use `ink`, `on-ink`, `surface-*`, `on-surface*`,
  `brand*`, `on-brand`, `outline*`, `success*`, `danger*`. NEVER raw `black`,
  `white`, Tailwind palette colors (`red-500`), or hex/arbitrary values. Token
  values live as CSS variables in `app/globals.css`; palette changes happen there.
- **Calm palette**: no pure #000 / #fff. Students read for hours; keep body
  text contrast high (≥12:1) but below max glare. Targets in `.kiro/context/DESIGN.md` §3.
- **0px border-radius** everywhere (buttons, cards, inputs). Exception: `rounded-full`
  only for pills/avatars if explicitly needed.
- **2px solid borders in `ink`** (`border-2 border-ink`) on interactive elements
  and cards. NEVER 1px hairlines.
- **Hard shadows, never blur**: `shadow-hard`, `shadow-hard-sm`,
  `shadow-hard-primary`. No soft/SaaS drop shadows.
- **Left-aligned, editorial layouts**. Avoid centered marketing layouts.
- **Generous whitespace** between sections.
- Never use color as the only signal (pair correct/wrong with icon or label).

## Public site variant (`app/(marketing)/` + `components/marketing/`) — user override 2026-10-22
The public website (landing, merit calculator, blog, contact, academies) uses a
**rounded, modern** variant of the brand. On these pages the 0px-radius and
2px-only-border rules above do NOT apply:
- Generous radius: cards `rounded-2xl`, buttons/inputs `rounded-xl`. No sharp corners.
- Cards: `bg-surface-lowest`, 1px `border-outline-variant` allowed, `shadow-soft`
  (subtle, tokenized), gentle hover lift. Emphasis cards (featured pricing,
  final CTA) may use a 2px `ink`/`brand` border + `shadow-hard` as a brand accent.
- Same color tokens, same fonts (Space Grotesk headlines, Inter body), lucide icons.
- **Public palette (`.theme-public` in app/globals.css): blue #0768D0 on white
  backgrounds (`brand`), #296FBB on charcoal (`brand-ondark`, button variant
  `primary-dark`), white backgrounds, solid black text, charcoal #2B2F36 only for dark
  banners/posters.** Use blue ONLY for the main CTA of a section and key
  highlights (the one highlighted offer, icon tiles, step markers, banners).
  NO blue hover effects, no blue dropdown icons, no blue washes or gradients
  on cards. Hover = same element slightly deeper/neutral, nothing decorative.
- Pricing cards use brutalist 2px borders + hard shadows with `rounded-xl`.
- Inner pages start with `PageHeader`: sky-blue banner, big white
  "Taleemkasafar" wordmark + h1.
- CTAs that should change for signed-in visitors use `AuthAwareButton`
  (never read cookies on the server in public pages).
- The dashboard keeps Soft Brutalism until the dashboard UI/UX phase decides.

## Colors
See `.kiro/context/DESIGN.md` §3 for the token table (v2 calm palette applied 2026-10-22;
v1 kept for history). Public-site rounded variant: `.kiro/context/DESIGN.md` §11.
Palette is charcoal/paper neutrals + one blue accent; `success`/`danger` only
for status and quiz feedback.

## Typography
- `font-headline` = Space Grotesk (headings, CTAs, labels). Bold/black weights,
  tight tracking (`tracking-tighter`/`tracking-tight`), often `uppercase`.
- `font-body` = Inter (body, inputs, paragraphs). This is the default body font.

## Component patterns
- **Primary button**: `bg-ink text-on-ink border-2 border-ink shadow-hard
  hover:bg-brand hover:border-brand` + active press (`active:translate-x-[2px]
  active:translate-y-[2px] active:shadow-none`). Square, uppercase headline font.
- **Secondary button**: `bg-surface-lowest text-on-surface border-2 border-ink` + same hover/press.
- **Card**: `bg-surface-lowest border-2 border-ink` (+ `shadow-hard` for emphasis).
  Gamified cards use `bg-brand-fixed`. No internal dividers — separate with spacing.
- **Input**: `border-2 border-ink` default; focus = brand border + hard-primary
  shadow (`focus:border-brand focus:shadow-hard-primary`). Error = `border-danger`.
- **Progress bar**: track `bg-surface-high border-2 border-ink`, fill solid `bg-brand`,
  no gradient.
- **Quiz feedback**: correct `bg-success-fixed border-success`, wrong
  `bg-danger-fixed border-danger`.

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
