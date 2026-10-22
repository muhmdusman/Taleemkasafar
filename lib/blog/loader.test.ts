import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  categorySlug,
  getAllPostSlugs,
  getAllPosts,
  getBlogSitemapEntries,
  getPostBySlug,
  getPostsByCategory,
  getRelatedPosts,
  readAllPosts,
  sortPosts,
} from "./loader";
import { isSafeUrl, parsePostSource, readingTimeMinutes, renderMarkdown } from "./parse";
import { BLOG_CATEGORIES, BlogContentError } from "./types";
import { getUniversitySlugs } from "@/data/merit-formulas";
import { routes } from "@/lib/routes";
import { staticPublicRoutes } from "@/lib/seo/public-routes";

const EXPECTED_SLUGS = [
  "how-university-merit-is-calculated-in-pakistan",
  "nust-net-preparation-guide",
  "ecat-preparation-strategy-uet-lahore",
  "mdcat-preparation-and-merit-guide",
  "punjab-university-entry-test-guide",
  "how-to-use-mock-tests-effectively",
];

/** Fixture post with overridable frontmatter lines. */
function fixture(overrides: Record<string, string | null> = {}, body = "## Intro\n\nHello world.") {
  const fields: Record<string, string> = {
    title: '"A test post"',
    slug: '"a-test-post"',
    description: '"A description."',
    date: '"2026-10-01"',
    author: '"Taleem ka Safar Team"',
    tags: '["NET"]',
    coverImage: '"/blog/covers/a-test-post.svg"',
    category: '"Study Strategy"',
  };
  for (const [k, v] of Object.entries(overrides)) {
    if (v === null) delete fields[k];
    else fields[k] = v;
  }
  const fm = Object.entries(fields)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
  return `---\n${fm}\n---\n\n${body}\n`;
}

function issuesOf(source: string, fileSlug = "a-test-post"): string[] {
  try {
    parsePostSource(source, fileSlug);
  } catch (e) {
    if (e instanceof BlogContentError) return e.issues;
    throw e;
  }
  return [];
}

describe("blog loader (real content)", () => {
  it("parses all 6 posts, newest first", async () => {
    const posts = await getAllPosts();
    expect(posts.map((p) => p.slug)).toEqual(EXPECTED_SLUGS);
    for (let i = 1; i < posts.length; i++) {
      expect(posts[i - 1].date >= posts[i].date).toBe(true);
    }
  });

  it("listing metadata does not include the body or HTML", async () => {
    const [first] = await getAllPosts();
    expect(first).not.toHaveProperty("body");
    expect(first).not.toHaveProperty("html");
  });

  it("every post has a real cover file, a known category and no H1", async () => {
    for (const slug of await getAllPostSlugs()) {
      const post = (await getPostBySlug(slug))!;
      expect(fs.existsSync(path.join(process.cwd(), "public", post.coverImage))).toBe(true);
      expect(BLOG_CATEGORIES).toContain(post.category);
      expect(post.html).not.toMatch(/<h1[\s>]/);
      expect(post.html).toMatch(/<h2 id="/);
      expect(post.readingTimeMinutes).toBeGreaterThanOrEqual(3);
    }
  });

  it("renders GFM tables inside a focusable scroll region", async () => {
    const post = (await getPostBySlug("how-university-merit-is-calculated-in-pakistan"))!;
    expect(post.html).toMatch(
      /<div class="table-scroll" role="region" aria-label="[^"]+" tabindex="0"><table>/,
    );
  });

  it("returns null for an unknown slug", async () => {
    expect(await getPostBySlug("does-not-exist")).toBeNull();
  });

  it("slug list matches the content folder", async () => {
    const files = fs
      .readdirSync(path.join(process.cwd(), "content", "blog"))
      .filter((f) => f.endsWith(".md") && f !== "README.md")
      .map((f) => f.replace(/\.md$/, ""))
      .sort();
    expect([...(await getAllPostSlugs())].sort()).toEqual(files);
  });

  it("groups by category in BLOG_CATEGORIES order and finds related posts", async () => {
    const groups = await getPostsByCategory();
    expect(groups.map((g) => g.category)).toEqual([...BLOG_CATEGORIES]);
    expect(groups.reduce((n, g) => n + g.posts.length, 0)).toBe(6);
    expect(categorySlug("Merit & Admissions")).toBe("merit-admissions");

    const related = await getRelatedPosts("nust-net-preparation-guide");
    expect(related).toHaveLength(3);
    expect(related.every((p) => p.category === "Entry Test Guides")).toBe(true);
    expect(related.map((p) => p.slug)).not.toContain("nust-net-preparation-guide");

    // A category with one post is filled from the newest other posts.
    const filled = await getRelatedPosts("how-to-use-mock-tests-effectively");
    expect(filled).toHaveLength(3);
    expect(await getRelatedPosts("does-not-exist")).toEqual([]);
  });

  it("builds one sitemap entry per post with lastModified = date", async () => {
    const entries = await getBlogSitemapEntries();
    expect(entries).toHaveLength(6);
    expect(entries[0]).toMatchObject({
      url: expect.stringMatching(/\/blog\/how-university-merit-is-calculated-in-pakistan$/),
      lastModified: "2026-10-22",
    });
  });

  it("every site-relative link in post bodies points at a real page", async () => {
    const known = new Set<string>([
      ...staticPublicRoutes.map((r) => r.path),
      routes.login,
      routes.signUp,
      ...(await getAllPostSlugs()).map(routes.blogPost),
      ...getUniversitySlugs().map(routes.meritUniversity),
    ]);
    let checked = 0;
    for (const slug of await getAllPostSlugs()) {
      const { html } = (await getPostBySlug(slug))!;
      for (const [, href] of html.matchAll(/href="(\/[^"]*)"/g)) {
        const target = href.replace(/[?#].*$/, "").replace(/\/$/, "") || "/";
        expect(known.has(target), `${slug}: broken internal link ${href}`).toBe(true);
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(0);
  });

  it("readAllPosts throws a clear error for a bad file in a directory", () => {
    const dir = fs.mkdtempSync(path.join(process.cwd(), ".tmp-blog-"));
    try {
      fs.writeFileSync(path.join(dir, "wrong-name.md"), fixture());
      expect(() => readAllPosts(dir)).toThrow(/"slug" \(a-test-post\) must equal the filename \(wrong-name\)/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it("readAllPosts fails when a post's cover file is missing", () => {
    const dir = fs.mkdtempSync(path.join(process.cwd(), ".tmp-blog-"));
    const publicDir = path.join(dir, "public");
    try {
      fs.writeFileSync(path.join(dir, "a-test-post.md"), fixture());
      fs.mkdirSync(path.join(publicDir, "blog", "covers"), { recursive: true });
      expect(() => readAllPosts(dir, publicDir)).toThrow(
        /"coverImage" file not found: public\/blog\/covers\/a-test-post\.svg/,
      );
      // Any allowed format is fine once the file exists (not just <slug>.svg).
      fs.writeFileSync(path.join(dir, "a-test-post.md"), fixture({ coverImage: '"/blog/covers/other.png"' }));
      fs.writeFileSync(path.join(publicDir, "blog", "covers", "other.png"), "");
      expect(readAllPosts(dir, publicDir).map((p) => p.coverImage)).toEqual(["/blog/covers/other.png"]);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe("blog frontmatter validation", () => {
  it("accepts a valid fixture", () => {
    const post = parsePostSource(fixture(), "a-test-post");
    expect(post).toMatchObject({ slug: "a-test-post", date: "2026-10-01", tags: ["NET"] });
    expect(post.html).toBe('<h2 id="intro">Intro</h2>\n<p>Hello world.</p>');
  });

  it("rejects unquoted YAML dates (they roll over: 2026-02-30 → 2026-03-02)", () => {
    for (const date of ["2026-10-01", "2026-02-30"]) {
      expect(issuesOf(fixture({ date }))).toEqual([
        '"date" must be a quoted "yyyy-mm-dd" string (got an unquoted YAML date)',
      ]);
    }
  });

  it("never evaluates JS frontmatter and rejects non-YAML fences", () => {
    const g = globalThis as { __blogPwned?: boolean };
    delete g.__blogPwned;
    for (const lang of ["js", "javascript", "JS", "json", "coffee"]) {
      const source = `---${lang}\n{ title: (globalThis.__blogPwned = true, "x") }\n---\n\n## Intro\n\nText.\n`;
      expect(() => parsePostSource(source, "a-test-post")).toThrow(BlogContentError);
      expect(issuesOf(source)[0]).toMatch(/must be YAML in a plain "---" fence/);
    }
    // A BOM hides the fence from the pre-check; gray-matter strips it and
    // picks the js engine, which is overridden to throw instead of eval.
    const bom = `\uFEFF---js\n{ title: (globalThis.__blogPwned = true, "x") }\n---\n\n## A\n\nText.\n`;
    expect(issuesOf(bom)[0]).toMatch(/JavaScript frontmatter is not allowed/);
    expect(g.__blogPwned).toBeUndefined();
  });

  it("reports missing and unknown keys", () => {
    expect(issuesOf(fixture({ author: null, draft: "true" }))).toEqual([
      "missing frontmatter key(s): author",
      "unknown frontmatter key(s): draft",
    ]);
  });

  it("rejects slug != filename and non-kebab slugs", () => {
    expect(issuesOf(fixture(), "other-name")).toEqual([
      '"slug" (a-test-post) must equal the filename (other-name)',
    ]);
    expect(issuesOf(fixture({ slug: '"A Test"' }))[0]).toMatch(/lowercase kebab-case/);
  });

  it("rejects bad dates", () => {
    for (const date of ['"2026-02-30"', '"22-10-2026"', '"October 1"', '""']) {
      expect(issuesOf(fixture({ date }))[0]).toMatch(/"date" must be a real ISO date/);
    }
  });

  it("rejects unknown categories", () => {
    expect(issuesOf(fixture({ category: '"News"' }))[0]).toMatch(/"category" must be one of/);
  });

  it("rejects cover images outside /blog/covers/", () => {
    expect(issuesOf(fixture({ coverImage: '"/images/x.svg"' }))[0]).toMatch(/under \/blog\/covers\//);
    expect(issuesOf(fixture({ coverImage: '"https://evil.example/x.svg"' }))[0]).toMatch(
      /under \/blog\/covers\//,
    );
    expect(issuesOf(fixture({ coverImage: '"/blog/covers/../x.svg"' }))[0]).toMatch(/kebab-name/);
  });

  it("rejects empty strings and bad tags", () => {
    expect(issuesOf(fixture({ title: '""', tags: "[]" }))).toEqual([
      '"title" must be a non-empty string',
      '"tags" must be a non-empty list of strings',
    ]);
  });

  it("rejects an H1 in the body", () => {
    expect(issuesOf(fixture({}, "# Title\n\nText"))[0]).toMatch(/must not contain an H1/);
    // "#" inside a code fence is fine.
    expect(issuesOf(fixture({}, "## A\n\n```\n# comment\n```"))).toEqual([]);
  });
});

describe("markdown rendering + reading time", () => {
  it("drops raw HTML and unsafe URLs", () => {
    const html = renderMarkdown(
      '<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n[bad](javascript:alert(1)) [ok](/blog) [ext](https://example.com)',
    );
    expect(html).not.toMatch(/<script|onerror|<img|javascript:/i);
    expect(html).toContain('<a href="/blog">ok</a>');
    expect(html).toContain('<a href="https://example.com" rel="noopener noreferrer">ext</a>');
    expect(isSafeUrl("JaVaScRiPt:alert(1)")).toBe(false);
    expect(isSafeUrl("//evil.example")).toBe(false);
    expect(isSafeUrl("#section")).toBe(true);
  });

  it("computes reading time at ~200 wpm, minimum 1, ignoring URLs and code", () => {
    expect(readingTimeMinutes("Hello")).toBe(1);
    expect(readingTimeMinutes(Array(400).fill("word").join(" "))).toBe(2);
    expect(readingTimeMinutes(Array(401).fill("word").join(" "))).toBe(3);
    const linky = `[two words](https://example.com/a/very/long/url) ${Array(198).fill("w").join(" ")}`;
    expect(readingTimeMinutes(linky)).toBe(1);
    expect(readingTimeMinutes("```\n" + Array(500).fill("code").join(" ") + "\n```\nok")).toBe(1);
  });

  it("sorts newest first with a stable tie-break", () => {
    expect(
      sortPosts([
        { slug: "b", date: "2026-01-01" },
        { slug: "a", date: "2026-01-01" },
        { slug: "c", date: "2026-02-01" },
      ]).map((p) => p.slug),
    ).toEqual(["c", "a", "b"]);
  });
});
