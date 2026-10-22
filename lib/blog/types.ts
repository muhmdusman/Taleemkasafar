/**
 * Blog types, shaped like a future `blog_posts` table row so the Markdown
 * loader (lib/blog/loader.ts) can be swapped for a DB fetch without touching
 * pages. Column mapping (camelCase here → snake_case in the DB):
 *   slug, title, description, date (→ published_at date), author,
 *   tags (text[]), coverImage (→ cover_image), category, body (markdown).
 * `html` and `readingTimeMinutes` are computed at read time, not stored.
 */

/** Allowed categories, in display order. Add one here before using it. */
export const BLOG_CATEGORIES = [
  "Merit & Admissions",
  "Entry Test Guides",
  "Study Strategy",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

/** Everything a listing card needs (no body). */
export type BlogPostMeta = {
  /** URL slug; equals the Markdown filename without `.md`. */
  slug: string;
  title: string;
  /** Meta description + card summary (plain text). */
  description: string;
  /** Publication date, ISO `yyyy-mm-dd`. Also used as dateModified. */
  date: string;
  author: string;
  tags: string[];
  /** Site path under /blog/covers/ (public/blog/covers/<slug>.svg). */
  coverImage: string;
  category: BlogCategory;
  /** Computed from the body word count (~200 words per minute, min 1). */
  readingTimeMinutes: number;
};

/** A full post: metadata + Markdown source + server-rendered HTML. */
export type BlogPost = BlogPostMeta & {
  /** Markdown source (no H1: the page title is the only h1). */
  body: string;
  /** Sanitised HTML rendered on the server (no raw HTML passthrough). */
  html: string;
};

/** Thrown when a post's frontmatter or body breaks the content rules. */
export class BlogContentError extends Error {
  constructor(
    readonly file: string,
    readonly issues: string[],
  ) {
    super(`Invalid blog post ${file}:\n${issues.map((i) => `  - ${i}`).join("\n")}`);
    this.name = "BlogContentError";
  }
}
