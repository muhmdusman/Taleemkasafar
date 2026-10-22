/**
 * Blog loader: THE swap point for moving posts to a database.
 *
 * Pages, the sitemap and OG images import ONLY from this file (plus types).
 * Today posts are Markdown files in content/blog/*.md; to move them to a
 * `blog_posts` table, reimplement `readAllPosts()` (and optionally the
 * lookups) with a DB query, keep the exported signatures, and add
 * `"use cache"` + `cacheTag("blog")` to the exported functions (a DB fetch is
 * real I/O, so under Cache Components it must be cached to stay static).
 * parse.ts (validation + Markdown → HTML) can be reused as-is for DB rows.
 *
 * The exported API is async on purpose, so callers don't change when the
 * source becomes a network fetch. The file reads are synchronous today, which
 * keeps every /blog page prerendered (no uncached async I/O during render).
 */
import fs from "node:fs";
import path from "node:path";
import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";
import { routes } from "@/lib/routes";
import { parsePostSource } from "./parse";
import {
  BLOG_CATEGORIES,
  BlogContentError,
  type BlogCategory,
  type BlogPost,
  type BlogPostMeta,
} from "./types";

export const BLOG_CONTENT_DIR = path.join(process.cwd(), "content", "blog");
/** Where `coverImage` paths resolve (Next serves `public/` at the site root). */
export const PUBLIC_DIR = path.join(process.cwd(), "public");

/** Post files: every `*.md` except README.md. */
function postFiles(dir: string): string[] {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f.toLowerCase() !== "readme.md")
    .sort();
}

/** Newest first; ties broken by slug so the order is stable. */
export function sortPosts<T extends Pick<BlogPostMeta, "date" | "slug">>(posts: T[]): T[] {
  return [...posts].sort((a, b) =>
    a.date === b.date ? a.slug.localeCompare(b.slug) : a.date < b.date ? 1 : -1,
  );
}

/**
 * Reads + validates every post in `dir` (throws BlogContentError on bad
 * content, including a `coverImage` with no file under `publicDir`, so a
 * missing cover fails the build instead of shipping a broken image).
 */
export function readAllPosts(dir: string = BLOG_CONTENT_DIR, publicDir: string = PUBLIC_DIR): BlogPost[] {
  const posts = postFiles(dir).map((file) => {
    const fileSlug = file.replace(/\.md$/, "");
    const post = parsePostSource(fs.readFileSync(path.join(dir, file), "utf8"), fileSlug);
    if (!fs.existsSync(path.join(publicDir, post.coverImage))) {
      throw new BlogContentError(`content/blog/${file}`, [
        `"coverImage" file not found: public${post.coverImage}`,
      ]);
    }
    return post;
  });
  return sortPosts(posts);
}

// Content is immutable at runtime in production, so parse once per process.
// In dev, re-read on every call so edits show up without a restart.
let memo: BlogPost[] | null = null;
function posts(): BlogPost[] {
  if (process.env.NODE_ENV !== "production") return readAllPosts();
  return (memo ??= readAllPosts());
}

function toMeta(post: BlogPost): BlogPostMeta {
  // Pick metadata only: listing pages must not ship whole articles.
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    author: post.author,
    tags: post.tags,
    coverImage: post.coverImage,
    category: post.category,
    readingTimeMinutes: post.readingTimeMinutes,
  };
}

/** All posts (metadata only), newest first. */
export async function getAllPosts(): Promise<BlogPostMeta[]> {
  return posts().map(toMeta);
}

/** One full post (with rendered HTML), or null for an unknown slug. */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  return posts().find((p) => p.slug === slug) ?? null;
}

/** Every slug, newest first (generateStaticParams). */
export async function getAllPostSlugs(): Promise<string[]> {
  return posts().map((p) => p.slug);
}

/** URL-safe anchor id for a category, e.g. "Merit & Admissions" → "merit-admissions". */
export function categorySlug(category: BlogCategory): string {
  return category
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type CategoryGroup = { category: BlogCategory; slug: string; posts: BlogPostMeta[] };

/** Posts grouped by category (BLOG_CATEGORIES order); empty categories omitted. */
export async function getPostsByCategory(): Promise<CategoryGroup[]> {
  const all = await getAllPosts();
  return BLOG_CATEGORIES.map((category) => ({
    category,
    slug: categorySlug(category),
    posts: all.filter((p) => p.category === category),
  })).filter((g) => g.posts.length > 0);
}

/**
 * Up to `limit` related posts for `slug`: same category first (newest first),
 * then filled with the newest posts from other categories so the section is
 * never empty while a category has only one post.
 */
export async function getRelatedPosts(slug: string, limit = 3): Promise<BlogPostMeta[]> {
  const all = await getAllPosts();
  const current = all.find((p) => p.slug === slug);
  if (!current) return [];
  const others = all.filter((p) => p.slug !== slug);
  const same = others.filter((p) => p.category === current.category);
  const rest = others.filter((p) => p.category !== current.category);
  return [...same, ...rest].slice(0, limit);
}

/** Sitemap entries for every /blog/[slug] page (lastModified = post date). */
export async function getBlogSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const all = await getAllPosts();
  return all.map((p) => ({
    url: absoluteUrl(routes.blogPost(p.slug)),
    lastModified: p.date,
    changeFrequency: "monthly",
    priority: 0.7,
  }));
}
