# Blog content

One Markdown file per post: `content/blog/<slug>.md`. Pages are built from these
files at build time by `lib/blog/loader.ts`. This README is skipped by the loader.

## Frontmatter (exactly these 8 keys, no others)

```yaml
---
title: "NUST NET Preparation Guide: Weightage, Plan and Practice"
slug: "nust-net-preparation-guide"        # must equal the filename, kebab-case
description: "One or two sentences (meta description + card summary)."
date: "2026-10-15"                        # ISO yyyy-mm-dd, quoted
author: "Taleem ka Safar Team"            # "<brand> Team" = Organization in JSON-LD
tags: ["NUST", "NET", "Study Plan"]       # at least one
coverImage: "/blog/covers/nust-net-preparation-guide.svg"
category: "Entry Test Guides"
---
```

Allowed categories (defined in `lib/blog/types.ts` → `BLOG_CATEGORIES`):
`Merit & Admissions`, `Entry Test Guides`, `Study Strategy`.
Add a new category there first, or the build fails.

Validation is strict and the build fails with a message naming the file and
every problem: missing or extra keys, slug not matching the filename, an
invalid or unquoted date, an unknown category, a cover outside `/blog/covers/`
(or a missing cover file), or a non-YAML frontmatter fence (`---js`, `---json`, …).
Frontmatter is YAML only; JavaScript frontmatter is never evaluated.

## Body rules

- Plain Markdown + GFM (tables, lists, links). Raw HTML is dropped, and so are
  unsafe link URLs (anything other than http(s), mailto, tel, `/…` or `#…`).
- No H1 (`# …`). The post title is the page's only h1. Use `##` for sections
  and `###` for subsections.
- Link internally with site paths (`/merit-calculator/nust`, `/blog/<slug>`).
  `lib/blog/loader.test.ts` fails if a site-relative link doesn't match a post
  slug, a merit-calculator slug or a static public/auth route, so renaming a
  slug means updating the posts that link to it.
- Merit numbers must match `data/merit-formulas.ts` (the PDF guide). Remind the
  reader to verify with the official university notification.
- Don't claim features that aren't live. Today: practice MCQs and past papers
  for NET and PU, and full-length timed mock tests for NET only. PU mocks,
  ECAT and MDCAT are coming soon.

## Cover images

- `public/blog/covers/<slug>.svg`, 1200×630, using the brand palette (see
  `.kiro/context/DESIGN.md`). Give it a `<title>`. Use no external fonts or images.
- Covers appear on cards and the post page. Social cards (Open Graph and
  Twitter) don't use them: they're PNGs generated per post by
  `app/blog/[slug]/opengraph-image.tsx` and `app/blog/[slug]/twitter-image.tsx`.
  These live OUTSIDE the `(marketing)` route group on purpose: inside a route
  group Next adds a hash suffix to metadata image URLs, which breaks the stable
  `/blog/<slug>/opengraph-image` URL the post metadata and JSON-LD reference.
- The loader fails the build if a post's `coverImage` file is missing under
  `public/`. SVG is the default; png/jpg/webp/avif are also accepted.

## Add a post

1. Create `content/blog/<slug>.md` with the frontmatter above.
2. Add `public/blog/covers/<slug>.svg`.
3. Run `npm run test` (the loader tests parse every real post) and `npm run build`.
   The post page, sitemap entry, JSON-LD and OG image are generated for you.

## Moving to a database later

`lib/blog/loader.ts` is the only swap point. The types in `lib/blog/types.ts`
mirror a `blog_posts` row (`cover_image`, `published_at`, …). Reimplement
`readAllPosts()` and the lookups with a DB query, and keep the exported
signatures. Add `"use cache"` + `cacheTag("blog")` so pages stay static under
Cache Components. `lib/blog/parse.ts` (validation + Markdown → HTML) works
unchanged on DB rows.
