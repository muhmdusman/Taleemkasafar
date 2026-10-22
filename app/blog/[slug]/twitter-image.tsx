import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { getAllPostSlugs, getPostBySlug } from "@/lib/blog/loader";
import { ogSize, renderArticleOgImage } from "@/lib/seo/og-image";

// Per-post Twitter/X card image: post title + category on the shared brand card
// (SVG covers are not reliable as social images).
//
// Lives OUTSIDE the (marketing) route group on purpose: Next appends a hash
// suffix to metadata image routes under a route group
// (/blog/<slug>/opengraph-image-<hash>). Here the URL is the stable
// /blog/<slug>/{opengraph,twitter}-image, which the post page's metadata and
// Article JSON-LD reference directly (app/(marketing)/blog/[slug]/page.tsx).
export const alt = `${siteConfig.name} blog post`;
export const size = ogSize;
export const contentType = "image/png";

export async function generateStaticParams() {
  return (await getAllPostSlugs()).map((slug) => ({ slug }));
}

export default async function TwitterImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  // Unknown slug: 404 like the post page (no soft-200 default card).
  if (!post) notFound();
  return renderArticleOgImage({ title: post.title, category: post.category });
}
