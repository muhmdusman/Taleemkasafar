import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { absoluteUrl } from "@/config/site";
import { PracticeCta } from "@/components/marketing/practice-cta";
import { categorySlug, getAllPostSlugs, getPostBySlug, getRelatedPosts } from "@/lib/blog/loader";
import { formatPostDate, formatReadingTime } from "@/lib/blog/format";
import { buildMetadata } from "@/lib/seo/metadata";
import { routes } from "@/lib/routes";
import { Breadcrumbs } from "@/components/marketing/breadcrumbs";
import { ButtonLink } from "@/components/marketing/button-link";
import { Container } from "@/components/marketing/container";
import { CategoryBadge } from "@/components/marketing/blog/post-meta";
import { PostCard } from "@/components/marketing/blog/post-card";
import { JsonLd, articleJsonLd } from "@/components/seo/json-ld";

type Params = { slug: string };

/**
 * Every post is prerendered from the loader's slug list. `dynamicParams =
 * false` is not allowed with Cache Components, so unknown slugs 404 via
 * `notFound()` below (the loader reads synchronously; nothing streams first).
 */
export async function generateStaticParams(): Promise<Params[]> {
  return (await getAllPostSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return buildMetadata({
    title: post.title,
    description: post.description,
    path: routes.blogPost(post.slug),
    // Per-post PNG cards from app/blog/[slug]/{opengraph,twitter}-image.tsx.
    image: absoluteUrl(`${routes.blogPost(post.slug)}/opengraph-image`),
    twitterImage: absoluteUrl(`${routes.blogPost(post.slug)}/twitter-image`),
    type: "article",
    article: {
      publishedTime: post.date,
      modifiedTime: post.date,
      authors: [post.author],
      tags: post.tags,
      section: post.category,
    },
  });
}

export default async function BlogPostPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();
  const related = await getRelatedPosts(post.slug, 3);

  return (
    <>
      <JsonLd data={articleJsonLd(post)} />
      <article>
        <header className="border-b border-outline-variant bg-surface-low">
          <Container className="py-10 md:py-14">
            <Breadcrumbs
              items={[
                { name: "Home", path: routes.home },
                { name: "Blog", path: routes.blog },
                { name: post.title, path: routes.blogPost(post.slug) },
              ]}
            />
            <div className="mt-8 max-w-3xl">
              <Link
                href={`${routes.blog}#${categorySlug(post.category)}`}
                className="inline-flex rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-container focus-visible:ring-offset-2 focus-visible:ring-offset-surface-low"
                aria-label={`More posts in ${post.category}`}
              >
                <CategoryBadge category={post.category} />
              </Link>
              <h1 className="mt-5 font-headline text-4xl font-bold leading-tight tracking-tight text-on-surface sm:text-5xl">
                {post.title}
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-on-surface-variant">
                {post.description}
              </p>
              <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-on-surface-variant">
                <span>
                  By <span className="font-semibold text-on-surface">{post.author}</span>
                </span>
                <span aria-hidden="true">·</span>
                <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                <span aria-hidden="true">·</span>
                <span>{formatReadingTime(post.readingTimeMinutes)}</span>
              </p>
            </div>
          </Container>
        </header>

        <Container className="py-10 md:py-14">
          <div className="mx-auto max-w-3xl">
            <Image
              src={post.coverImage}
              alt={`Cover illustration for “${post.title}”`}
              width={1200}
              height={630}
              // LCP element: preload (replaces the deprecated `priority`).
              preload
              fetchPriority="high"
              // SVG cover: served as-is (the optimizer rejects SVG by default).
              unoptimized
              className="aspect-[1200/630] w-full rounded-2xl border border-outline-variant bg-surface-low object-cover shadow-soft"
            />
            <div
              className="article-body mt-10"
              // Safe: HTML is rendered on the server from repo Markdown with raw
              // HTML dropped and unsafe URLs stripped (lib/blog/parse.ts).
              dangerouslySetInnerHTML={{ __html: post.html }}
            />
            <ul aria-label="Tags" className="mt-10 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-surface-container px-3 py-1 text-sm font-medium text-on-surface-variant"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </article>

      <Container className="pb-12 md:pb-16">
        <PracticeCta
          id="post-cta-heading"
          className="mx-auto max-w-3xl md:flex-col md:items-start"
          title="Turn this plan into practice"
          description="Practise MCQs for NET, PU, UET, FAST and NAT with an explanation for every wrong answer, plus past papers and timed mock tests. Free for students."
        />
      </Container>

      {related.length > 0 ? (
        <section aria-labelledby="related-heading" className="bg-surface-low py-12 md:py-16">
          <Container>
            <h2
              id="related-heading"
              className="font-headline text-2xl font-bold tracking-tight text-on-surface sm:text-3xl"
            >
              Related posts
            </h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <li key={p.slug} className="flex">
                  <PostCard post={p} className="w-full" />
                </li>
              ))}
            </ul>
            <ButtonLink href={routes.blog} variant="secondary" className="mt-10">
              <ArrowLeft aria-hidden="true" />
              All blog posts
            </ButtonLink>
          </Container>
        </section>
      ) : null}
    </>
  );
}
