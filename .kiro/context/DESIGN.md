# Design System — Soft Brutalism, Calm Edition

Source of truth for Taleem ka Safar UI. Supersedes `ui_design/design_scheme/DESIGN.md`
(gitignored, original mockup spec — kept only as historical reference).
Short rules for agents live in `.kiro/steering/design-system.md`.

> **Status (2026-10-22):** palette **v2 is applied** in `app/globals.css`
> (app-wide). It is the agreed baseline; it may still be tuned from the user's
> color schemes. Structure, shape, type, and token architecture are final.
> The public website uses a rounded variant of the brand (§11).
>
> **Update (2026-10-30):** the dashboard (§12) and the auth pages (§13) now use
> the same rounded variant and palette (`.theme-public`) as the public site, and
> the palette was softened for eye comfort (§13). Soft Brutalism (§5–6) is
> retired from the live UI; it stays here as history and in the mockups.

---

## 1. North star
"The Architectural Playground": Brutalist structure (0px radius, 2px borders,
hard offset shadows) tempered by generous whitespace and one blue accent.

**v2 change: calm, not loud.** Students sit on this for hours. v1 used pure
`#000` on pure `#fff` (21:1 contrast), which causes glare and halation on long
reading sessions. v2 keeps the exact same shapes and layout but softens the
palette: charcoal instead of black, paper off-white instead of pure white, a
less saturated blue. The brand should still read as bold and structured.

## 2. Token architecture (how colors work in code)
- Colors are **semantic tokens** defined once as CSS variables in
  `app/globals.css` and exposed to Tailwind in `tailwind.config.ts`.
- Components use **tokens only**: `bg-ink`, `border-ink`, `bg-surface-lowest`,
  `text-on-surface`, `bg-brand`, `text-on-brand`, etc.
- **Never** use raw `black`, `white`, Tailwind palette colors (`red-500`,
  `green-600`), or hex/arbitrary values (`bg-[#...]`) in components.
- Changing the palette (or adding dark mode later) = edit the CSS variables
  only. No component changes.

## 3. Palette

| Token | Role | v1 (history, replaced) | v2 (applied 2026-10-22) |
|---|---|---|---|
| `ink` | Borders, primary button fill, hard shadows | `#000000` | `#1F2328` charcoal |
| `on-ink` | Text/icons on `ink` fills | `#FFFFFF` | `#FDFDFB` |
| `surface` | Page background | `#F9F9F9` | `#F6F6F3` paper |
| `surface-lowest` | Cards, inputs, secondary buttons | `#FFFFFF` | `#FDFDFB` |
| `surface-low` | Quiet regions | `#F3F3F4` | `#F0F0EC` |
| `surface-container` | Panels, tracks | `#EEEEEE` | `#EAEAE5` |
| `surface-high` | Progress track, hover fills | `#E8E8E8` | `#E3E3DE` |
| `surface-variant` | Subtle separators by fill | `#E2E2E2` | `#DCDCD6` |
| `on-surface` | Headlines + body text | `#1A1C1C` | `#1F2328` |
| `on-surface-variant` | Muted text | `#424754` | `#57606A` |
| `outline` | Input default border, icons | `#727785` | `#7A7F88` |
| `outline-variant` | Ghost borders (non-interactive) | `#C2C6D6` | `#C9CCD3` |
| `brand` | Action + progress accent | `#0058BE` | `#2D5DB5` softened blue |
| `on-brand` | Text on `brand` fills | `#FFFFFF` | `#FDFDFB` |
| `brand-container` | Brand hover/secondary fill | `#2170E4` | `#4A78CC` |
| `brand-fixed` | Gamified card background | `#D8E2FF` | `#E3EAF8` |
| `success` | Correct answer | (ad hoc) | `#1F7A4D` |
| `success-fixed` | Correct answer tint | (ad hoc) | `#E3F2EA` |
| `danger` | Errors, wrong answer | `#BA1A1A` | `#B42318` |
| `danger-fixed` | Wrong answer tint | (ad hoc) | `#FBE7E6` |

shadcn/ui HSL variables (`--background`, `--primary`, `--ring`, ...) in
`app/globals.css` mirror these tokens (background = `surface`, primary =
`ink`, ring = `brand`, border/input = `outline-variant`, muted-foreground =
`on-surface-variant`, accent = `brand-fixed`), so shadcn components match.

### Contrast targets (measured for v2, WCAG 2.x ratios)
- Body/question text on surfaces: **≥ 12:1** (v2: 14.6 page, 15.5 card). High
  enough for AAA, low enough to avoid glare.
- Muted text: **≥ 4.5:1** (v2: 5.9 page, 6.3 card).
- Text on `brand` / `ink` fills: **≥ 4.5:1** (v2: 6.2 / 15.5).
- Text on tinted fills (`brand-fixed`, `success-fixed`, `danger-fixed`): ≥ 12:1
  (v2: 13.1 / 13.7 / 13.3).
- Interactive borders/icons vs background: **≥ 3:1** (v2 `outline`: 3.7 page,
  4.0 card). `outline-variant` (1.5:1) is decorative only, never the sole
  boundary of an input or control.
- Brand as text/link on surfaces: ≥ 4.5:1 (v2: 5.8 page, 6.2 card, 5.2 on
  `brand-fixed`). Avoid `on-brand` text on `brand-container` (4.25:1).
- Any final scheme must be re-measured against these targets before shipping.

## 4. Typography
- `font-headline` — Space Grotesk. Headings, CTAs, labels. Bold/black weights,
  `tracking-tight`/`tracking-tighter`, often uppercase.
- `font-body` — Inter. Default for body, inputs, and **all question text**.
- Long-reading comfort: question/explanation text `text-base`–`text-lg`,
  `leading-relaxed` (~1.6), line length ≤ ~70ch. Never uppercase body copy.

## 5. Shape, borders, depth
- **0px radius** everywhere. `rounded-full` only for avatars/pills when needed.
- **2px borders** in `ink` on interactive elements and cards. No 1px lines.
- **Hard shadows only** (solid offset, no blur), drawn in `ink` or `brand`:
  `shadow-hard` (4px), `shadow-hard-sm` (2px), `shadow-hard-primary`.
- Press state: `active:translate-x-[2px] active:translate-y-[2px] active:shadow-none`.
- Ghost border for secondary data cards: `outline-variant`.

## 6. Components
- **Primary button**: `bg-ink text-on-ink border-2 border-ink shadow-hard
  hover:bg-brand hover:border-brand` + press state. Square, uppercase headline font.
- **Secondary button**: `bg-surface-lowest text-on-surface border-2 border-ink` + press state.
- **Card**: `bg-surface-lowest border-2 border-ink` (+ `shadow-hard` for
  emphasis). Gamified cards use `bg-brand-fixed`. No internal dividers; separate with spacing.
- **Input**: `border-2 border-ink`; focus `border-brand shadow-hard-primary`;
  error `border-danger`.
- **Progress bar**: track `bg-surface-high border-2 border-ink`, fill solid `bg-brand`. No gradients.
- **Quiz feedback**: correct = `bg-success-fixed border-success`, wrong =
  `bg-danger-fixed border-danger`. Pair color with an icon/label (never color alone).

## 7. Layout
- Left-aligned, editorial layouts. Avoid centered marketing layouts (the
  landing page hero may center a single CTA block if needed, but sections stay editorial).
- Generous whitespace between major sections (`py-16`–`py-28` on landing).
- Responsive from the start: mobile and desktop variants exist per screen.

## 8. Dark mode (planned, not in scope yet)
`next-themes` is installed. Because components use tokens only, dark mode is a
second set of CSS variable values under `.dark`. Design it after the light
palette is final.

## 9. Do / Don't
- Do: tokens only; 2px borders; hard shadows; whitespace; one accent color.
- Don't: pure `#000`/`#fff`; soft blurred shadows; gradients; 1px hairlines;
  pastel overload; color as the only signal.

## 10. Brand
Product name in UI is **"Taleem ka Safar"** (never "TEST_ARCHITECT" from the
mockups). Logo mark: the geometric "TS" (`app/icon.svg`).

## 11. Public site variant (rounded) — user override 2026-10-22
Applies to the public website: `app/(marketing)/` + `components/marketing/`
(landing, merit calculator, blog, contact, academies). Since 2026-10-30 the
dashboard uses it too (§12).
- **Radius**: cards `rounded-2xl`, buttons/inputs `rounded-xl`, pills/avatars
  `rounded-full`. No sharp corners. (Global `--radius` is NOT changed; rounding
  is applied by class so the dashboard stays square.)
- **Cards**: `bg-surface-lowest`, 1px `border-outline-variant` allowed,
  `shadow-soft` (tokenized: `rgb(var(--ink) / low alpha)`), gentle hover lift
  (`hover:-translate-y-0.5 hover:shadow-soft-lg`).
- **Emphasis** (featured pricing plan, merit result): 2px `brand` border (or
  `brand/30`) + `shadow-soft-lg`. Hard shadows were removed 2026-10-30 (§13).
- **Inputs**: border in `outline` (≥3:1), focus ring in `brand`.
- **Focus**: visible `focus-visible` ring in `brand` on every interactive element.
- Same color tokens, same fonts (Space Grotesk headlines, Inter body), lucide
  icons only (no Material Symbols on public pages).

## 12. Dashboard variant (rounded, public palette) — user override 2026-10-30
Applies to `app/dashboard/` + `components/dashboard/` + `components/quiz/`
(home, subjects, chapters, practice/past-paper runner, mocks, results,
performance). Owner: the brutalist dashboard (sharp corners, solid charcoal
and blue blocks) felt harsh; match the landing page instead.
- **Palette**: `app/dashboard/layout.tsx` sets `theme-public`, so the
  dashboard uses the exact landing tokens (blue #0768D0, charcoal #2B2F36,
  white cards, near-black text, §13). Canvas is `bg-surface-low` (#F6F7F9) so white
  cards separate without heavy borders; practice/past-paper screens too.
- **Shared styles** live in `components/dashboard/styles.ts`: `card`,
  `cardInteractive`, `skeleton`, `focusRing` and the `appButton()` cva
  (`primary` blue, `secondary` neutral, `ghost`; sizes `sm`/`md`/`lg`). Use
  these instead of hand-writing card/button classes.
- **Radius**: cards/panels `rounded-2xl`; buttons, inputs, options, tiles
  `rounded-xl`/`rounded-lg`; chips, avatars, progress bars `rounded-full`.
- **Borders/depth**: 1px `border-outline-variant` + `shadow-soft`; hover lift
  `shadow-soft-lg`. No `shadow-hard`, no 2px `ink` borders, no `bg-ink`
  blocks. Controls that need a visible edge (MCQ options) use `border-outline`
  (≥3:1).
- **Blue**: primary action of a screen/bar, active nav (`bg-brand-fixed
  text-brand-container`), icon tiles, key numbers, progress fills, the
  current question chip. Hover on neutral elements stays neutral.
- **Quiz feedback**: tinted fills with a solid icon badge, never solid
  green/red blocks: correct `border-success bg-success-fixed`, wrong
  `border-danger bg-danger-fixed`, missed correct answer `border-success` on
  white. Status chips and palette chips follow the same tints.
- **Type**: headings in sentence/title case (no all-caps), Space Grotesk
  bold; small eyebrow labels may stay `uppercase tracking-widest`.
- **A11y**: `focusRing` on every interactive element; `motion-reduce:` guards
  on hover lifts/transitions; icon-only buttons keep an `sr-only` label.
- **User journey (2026-10-30)**: one obvious next step per screen.
  - Home: greeting + `NextStepCard` (`getJourney()` in
    `lib/queries/dashboard.ts`): a running mock first (its timer doesn't
    stop), else the chapter the user last ANSWERED in if that sitting is
    still open → else a 3-step "Get started" checklist (test chosen, first
    practice answers, first mock) → else "Keep going". The old "Choose your
    challenge" section (duplicate links) was removed.
  - Practice: End/Finish opens a session summary (answered, correct,
    accuracy) with "Next chapter" (`nextChapter` on the practice data).
  - Mock: "Submit test" asks for confirmation (answered / unanswered /
    marked for review). While a mock is open (`getOpenMock()`), the mock
    page shows "Resume mock" and hides "Start Mock Test", because a second
    paper would leave the first one ungraded.
  - No dead ends: Settings (404) is out of the nav, Help goes to the contact
    page, the no-op header search was removed, mobile "Profile" → "Progress".

## 13. Eye-comfort pass + auth pages — user override 2026-10-30
Owner: avoid very sharp colors and sharp corners that tire the eyes, fix the
landing page, and fix login contrast while typing credentials.
- **Palette (`.theme-public`)**: text `on-surface` #000 → **#1F2328** (15.3:1
  on the page; inside the ≥12:1 calm target, below 21:1 glare); page
  `surface` #FFF → **#FAFBFC**; cards/inputs stay #FFF (`surface-lowest`).
  shadcn `--input` mirrors `outline` so any shadcn input has a ≥3:1 edge.
- **No hard shadows or charcoal blocks anywhere**: pricing cards, hero
  progress card, merit result, contact success and academies plan use soft
  shadows (emphasis = 2px brand edge). The home final CTA, academies CTA and
  inner-page `PageHeader` are light `brand-fixed` panels with dark text (were
  charcoal / blue gradient with white text). Step markers and the merit
  "aggregate" pill use `brand-fixed` + `brand-container` instead of `ink`.
  The dark-banner button variants were removed.
- **Light only**: `ThemeProvider` is `forcedTheme="light"` and `:root` sets
  `color-scheme: light`. Root cause of the login bug: with `defaultTheme=
  "system"`, dark-OS users got the shadcn `.dark` variables and a dark
  color-scheme, so native inputs rendered dark behind our dark text.
- **Auth pages** (`app/auth/`, `components/auth/`, password-reset forms):
  `theme-public` on a `surface-low` canvas, rounded cards (`AuthCard`), white
  inputs with `border-outline`, placeholder at 4.6:1, brand focus ring,
  `FormError` (`role="alert"`), `autoComplete` on every field, lucide icons
  (the auth layout no longer loads the Material Symbols font).
