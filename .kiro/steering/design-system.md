# Design System — rounded, calm, one blue accent

ALWAYS follow this when building or reviewing UI. Source of truth:
**`.kiro/context/DESIGN.md` (committed)** — palette, contrast targets, components.
Layout references: `ui_design/<screen>/screen.png` + `code.html` (gitignored,
desktop + mobile variants). Port to React/Next components — never copy raw HTML.
The mockups are Soft Brutalism (sharp corners, hard shadows); that style is
RETIRED from the live UI (2026-10-30). Take layout from them, not the styling.

## Where it applies
One style everywhere: public site (`app/(marketing)/`, `components/marketing/`),
dashboard (`app/dashboard/`, `components/dashboard/`, `components/quiz/`) and
auth (`app/auth/`, `components/auth/`). Each area's layout sets `theme-public`
(app/globals.css), so they all share the same tokens.

## Non-negotiable rules
- **Tokens only for color.** Use `ink`, `on-ink`, `surface-*`, `on-surface*`,
  `brand*`, `on-brand`, `outline*`, `success*`, `danger*`. NEVER raw `black`,
  `white`, Tailwind palette colors (`red-500`), or hex/arbitrary values. Token
  values live as CSS variables in `app/globals.css`; palette changes happen there.
- **Eye comfort**: no pure #000 text, no pure #fff page. Text `on-surface`
  #1F2328 (15.3:1), page `surface` #FAFBFC, app canvas `surface-low` #F6F7F9,
  white only for cards/inputs. Keep body text ≥12:1, muted text ≥4.5:1.
- **No sharp corners**: cards `rounded-2xl`; buttons, inputs, options, tiles
  `rounded-xl`/`rounded-lg`; chips, avatars, progress bars `rounded-full`.
- **Soft depth**: 1px `border-outline-variant` + `shadow-soft` (hover
  `shadow-soft-lg`). NO `shadow-hard*`, NO 2px `ink` borders. Emphasis = 2px
  `border-brand` (or `border-brand/30`) + `shadow-soft-lg`.
- **No solid dark or saturated blocks**: no `bg-ink` panels/banners, no blue
  gradients. Banners and highlight panels use the light `bg-brand-fixed` tint
  with dark text; blue fills are only for buttons and small markers.
- **Blue only for** the main action of a screen/section, active nav, icon
  tiles, step markers, key numbers and progress fills. No blue hover effects,
  no blue dropdown icons. Hover = same element slightly deeper/neutral.
- **Controls need a visible edge**: inputs/options use `border-outline`
  (≥3:1); `outline-variant` is decorative only.
- **Focus**: visible brand ring on every interactive element (`focusRing`).
- **Motion**: guard hover lifts/transitions with `motion-reduce:`.
- **Light only** until dark mode is designed: `ThemeProvider` is forced to
  light and `:root { color-scheme: light }` keeps native inputs light.
- Never use color as the only signal (pair correct/wrong with icon or label).
- Left-aligned, editorial layouts; generous whitespace between sections.

## Shared building blocks (use these, don't hand-write class strings)
- `components/dashboard/styles.ts`: `card`, `cardInteractive`, `skeleton`,
  `focusRing`, `appButton({ variant: primary|secondary|ghost, size: sm|md|lg })`.
  Used by dashboard, quiz and auth.
- Public site buttons: `ButtonLink` / `marketingButton` (`primary`,
  `secondary`, `brand`, `ghost`) in `components/marketing/button-link.tsx`.
- Auth: `components/auth/auth-ui.tsx` (`AuthHeading`, `AuthCard`,
  `FormError` with `role="alert"`, `OrDivider`, `authInput`, `authLabel`) and
  `password-input.tsx` (show/hide toggle). Inputs keep `autoComplete`.
- Modals: `components/quiz/dialog.tsx` (native `<dialog>`).

## Area notes
- **Public site**: inner pages start with `PageHeader` (light blue banner,
  blue wordmark, dark h1). CTAs that change for signed-in visitors use
  `AuthAwareButton` (never read cookies on the server in public pages).
- **Dashboard**: every screen has ONE obvious next step. Home shows the
  `NextStepCard` (resume an unfinished chapter/mock → first-run checklist →
  keep going). Practice ends with a summary + "Next chapter"; mock submit asks
  for confirmation. Don't link to pages that don't exist yet.
- **Quiz feedback**: tinted `success-fixed` / `danger-fixed` + icon badge,
  never solid green/red blocks.

## Typography
- `font-headline` = Space Grotesk (headings, CTAs, labels). Bold weights,
  `tracking-tight`. Headings in sentence/title case; only small eyebrow
  labels are `uppercase tracking-widest`.
- `font-body` = Inter (body, inputs, paragraphs, all question text).

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
