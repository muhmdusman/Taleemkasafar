/**
 * Pure blog parsing: frontmatter validation, reading time and Markdown → HTML.
 * No filesystem access (that lives in loader.ts), so everything here is
 * unit-testable with fixture strings and reusable when posts come from a DB.
 *
 * INTERNAL to lib/blog: pages import from lib/blog/loader.ts only.
 */
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import {
  BLOG_CATEGORIES,
  BlogContentError,
  type BlogCategory,
  type BlogPost,
} from "./types";

/** Frontmatter keys: EXACTLY these, no more, no fewer. */
export const FRONTMATTER_KEYS = [
  "title",
  "slug",
  "description",
  "date",
  "author",
  "tags",
  "coverImage",
  "category",
] as const;

export const COVER_IMAGE_PREFIX = "/blog/covers/";
const COVER_IMAGE_RE = /^\/blog\/covers\/[a-z0-9]+(?:-[a-z0-9]+)*\.(?:svg|png|jpe?g|webp|avif)$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
export const WORDS_PER_MINUTE = 200;

type Frontmatter = Omit<BlogPost, "body" | "html" | "readingTimeMinutes">;

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim() !== "";
}

/** Real calendar date check for `yyyy-mm-dd` (rejects 2026-02-30). */
function isIsoDate(value: string): boolean {
  const m = DATE_RE.exec(value);
  if (!m) return false;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return d.toISOString().slice(0, 10) === value;
}

/**
 * Validates parsed frontmatter against the schema in content/blog/README.md.
 * Collects every issue and throws one BlogContentError listing them all.
 */
export function validateFrontmatter(
  data: Record<string, unknown>,
  fileSlug: string,
  file: string = `${fileSlug}.md`,
): Frontmatter {
  const issues: string[] = [];
  const keys = Object.keys(data);
  const missing = FRONTMATTER_KEYS.filter((k) => !keys.includes(k));
  const extra = keys.filter((k) => !(FRONTMATTER_KEYS as readonly string[]).includes(k));
  if (missing.length) issues.push(`missing frontmatter key(s): ${missing.join(", ")}`);
  if (extra.length) issues.push(`unknown frontmatter key(s): ${extra.join(", ")}`);

  for (const key of ["title", "description", "author"] as const) {
    if (key in data && !isNonEmptyString(data[key])) {
      issues.push(`"${key}" must be a non-empty string`);
    }
  }

  const { slug, date, tags, coverImage, category } = data;
  if ("slug" in data) {
    if (!isNonEmptyString(slug) || !SLUG_RE.test(slug)) {
      issues.push(`"slug" must be lowercase kebab-case (got ${JSON.stringify(slug)})`);
    } else if (slug !== fileSlug) {
      issues.push(`"slug" (${slug}) must equal the filename (${fileSlug})`);
    }
  }

  // Dates must be QUOTED strings. An unquoted YAML date becomes a Date object
  // built with Date.UTC, which rolls impossible dates over (2026-02-30 →
  // 2026-03-02), so it can't be validated reliably and is rejected outright.
  if ("date" in data) {
    if (date instanceof Date) {
      issues.push(`"date" must be a quoted "yyyy-mm-dd" string (got an unquoted YAML date)`);
    } else if (typeof date !== "string" || !isIsoDate(date)) {
      issues.push(`"date" must be a real ISO date yyyy-mm-dd (got ${JSON.stringify(date)})`);
    }
  }

  if (
    "tags" in data &&
    (!Array.isArray(tags) || tags.length === 0 || !tags.every(isNonEmptyString))
  ) {
    issues.push(`"tags" must be a non-empty list of strings`);
  }

  if ("coverImage" in data) {
    if (typeof coverImage !== "string" || !coverImage.startsWith(COVER_IMAGE_PREFIX)) {
      issues.push(`"coverImage" must be a path under ${COVER_IMAGE_PREFIX} (got ${JSON.stringify(coverImage)})`);
    } else if (!COVER_IMAGE_RE.test(coverImage)) {
      issues.push(
        `"coverImage" must be ${COVER_IMAGE_PREFIX}<kebab-name>.(svg|png|jpg|webp|avif) (got ${JSON.stringify(coverImage)})`,
      );
    }
  }

  if (
    "category" in data &&
    !(typeof category === "string" && (BLOG_CATEGORIES as readonly string[]).includes(category))
  ) {
    issues.push(
      `"category" must be one of ${BLOG_CATEGORIES.map((c) => `"${c}"`).join(", ")} (got ${JSON.stringify(category)})`,
    );
  }

  if (issues.length) throw new BlogContentError(file, issues);

  return {
    title: (data.title as string).trim(),
    slug: slug as string,
    description: (data.description as string).trim(),
    date: date as string,
    author: (data.author as string).trim(),
    tags: (tags as string[]).map((t) => t.trim()),
    coverImage: coverImage as string,
    category: category as BlogCategory,
  };
}

/** Markdown lines outside fenced code blocks. */
function proseLines(markdown: string): string[] {
  const out: string[] = [];
  let fenced = false;
  for (const line of markdown.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      continue;
    }
    if (!fenced) out.push(line);
  }
  return out;
}

/** Body rules: not empty, and no H1 (the page title is the only h1). */
export function validateBody(body: string, file: string): void {
  const issues: string[] = [];
  if (body.trim() === "") issues.push("body is empty");
  if (proseLines(body).some((line) => /^#\s/.test(line) || /^=+\s*$/.test(line))) {
    issues.push("body must not contain an H1 (`# ...`); start sections at `##`");
  }
  if (issues.length) throw new BlogContentError(file, issues);
}

/** Reading time in whole minutes (~200 wpm, minimum 1). */
export function readingTimeMinutes(markdown: string): number {
  const text = proseLines(markdown)
    .join("\n")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1") // keep link text, drop URLs
    .replace(/[#>*_`|~-]+/g, " ");
  const words = text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

// --- Markdown → HTML (server only) -----------------------------------------

/** Minimal hast shapes used by the plugin below. */
type HastNode = {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
  value?: string;
};

const SAFE_URL = /^(?:https?:|mailto:|tel:|\/(?![/\\])|#|\.{1,2}\/)/i;

/** Only http(s), mailto, tel, site-relative and fragment URLs survive. */
export function isSafeUrl(url: string): boolean {
  return SAFE_URL.test(url.trim());
}

/**
 * Hardening + layout for rendered posts:
 * - drops unsafe `href`/`src` (e.g. `javascript:`), since content may later
 *   come from a DB / admin editor;
 * - external links get rel="noopener noreferrer";
 * - every <table> is wrapped in a focusable, labelled scroll region so wide
 *   tables scroll horizontally on mobile (keyboard-scrollable too).
 */
function rehypeBlogHardening() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (!node.children) return;
      node.children = node.children.map((child) => {
        if (child.type === "element") {
          const props = (child.properties ??= {});
          for (const attr of ["href", "src"]) {
            const value = props[attr];
            if (typeof value === "string" && !isSafeUrl(value)) delete props[attr];
          }
          if (child.tagName === "a" && typeof props.href === "string" && /^https?:/i.test(props.href)) {
            props.rel = ["noopener", "noreferrer"];
          }
          walk(child);
          if (child.tagName === "table") {
            return {
              type: "element",
              tagName: "div",
              properties: {
                className: ["table-scroll"],
                role: "region",
                ariaLabel: "Table (scrolls sideways on small screens)",
                tabIndex: 0,
              },
              children: [child],
            };
          }
        }
        return child;
      });
    };
    walk(tree);
  };
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  // allowDangerousHtml stays OFF: raw HTML in Markdown is dropped, never
  // passed through, so the pipeline is safe for DB/admin-authored content.
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(rehypeBlogHardening)
  .use(rehypeStringify);

/** Renders post Markdown to sanitised HTML. Synchronous (no I/O). */
export function renderMarkdown(markdown: string): string {
  return String(processor.processSync(markdown));
}

function rejectJsFrontmatter(): never {
  throw new Error("JavaScript frontmatter is not allowed");
}

/**
 * gray-matter options: YAML only.
 * - gray-matter's default `javascript` engine `eval`s the frontmatter of any
 *   source whose fence opens with `---js` / `---javascript`. Overriding it
 *   (the `js` alias resolves to this key) means it can never run, which keeps
 *   this module safe for DB/admin-authored sources.
 * - A non-empty options object also disables gray-matter's content-keyed
 *   cache (it returns shared mutable objects otherwise).
 */
const MATTER_OPTIONS = {
  language: "yaml",
  engines: { javascript: rejectJsFrontmatter },
};

/**
 * Splits frontmatter from the body. Only plain `---` YAML fences are
 * accepted; any `---<language>` fence (js, json, coffee, …) is rejected with a
 * BlogContentError before an engine runs.
 */
function parseFrontmatter(source: string, file: string): { data: Record<string, unknown>; content: string } {
  const fence = /^---([^\r\n]*)\r?\n/.exec(source);
  if (fence && fence[1].trim() !== "") {
    throw new BlogContentError(file, [
      `frontmatter must be YAML in a plain "---" fence (got "---${fence[1].trim()}")`,
    ]);
  }
  try {
    const { data, content } = matter(source, MATTER_OPTIONS);
    return { data, content };
  } catch (e) {
    throw new BlogContentError(file, [
      `frontmatter could not be parsed: ${e instanceof Error ? e.message : String(e)}`,
    ]);
  }
}

/**
 * Parses one post source (frontmatter + Markdown). `fileSlug` is the filename
 * without `.md`; the frontmatter slug must match it.
 */
export function parsePostSource(source: string, fileSlug: string): BlogPost {
  const file = `content/blog/${fileSlug}.md`;
  const { data, content } = parseFrontmatter(source, file);
  const meta = validateFrontmatter(data, fileSlug, file);
  const body = content.replace(/^\s*\n/, "");
  validateBody(body, file);
  return {
    ...meta,
    readingTimeMinutes: readingTimeMinutes(body),
    body,
    html: renderMarkdown(body),
  };
}
