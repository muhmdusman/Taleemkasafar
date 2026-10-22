import { getPostsByCategory } from "@/lib/blog/loader";
import { buildMetadata } from "@/lib/seo/metadata";
import { routes } from "@/lib/routes";
import { Container } from "@/components/marketing/container";
import { PageHeader } from "@/components/marketing/page-header";
import { PostCard } from "@/components/marketing/blog/post-card";

export const metadata = buildMetadata({
  title: "Blog: Entry Test and Admission Guides",
  description:
    "Guides for Pakistani students on university merit formulas, NUST NET, ECAT, MDCAT and PU entry test preparation, and study strategy that works.",
  path: routes.blog,
});

/**
 * /blog: posts grouped by category (static, server-rendered, zero client JS).
 * Category "filters" are plain in-page anchor links.
 */
export default async function BlogIndexPage() {
  const groups = await getPostsByCategory();
  const total = groups.reduce((n, g) => n + g.posts.length, 0);

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { name: "Home", path: routes.home },
          { name: "Blog", path: routes.blog },
        ]}
        eyebrow="Blog"
        title="Entry test and admission guides"
        description="Clear, practical guides on how merit is calculated, how each entry test works and how to prepare, written for Pakistani students. Always confirm dates and criteria in the official notification."
      >
        <nav aria-label="Blog categories" className="mt-8">
          <ul className="flex flex-wrap gap-2">
            {groups.map((g) => (
              <li key={g.slug}>
                <a
                  href={`#${g.slug}`}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-outline bg-surface-lowest px-4 font-headline text-sm font-semibold text-on-surface transition-colors hover:border-ink hover:bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-container focus-visible:ring-offset-2 focus-visible:ring-offset-surface-low"
                >
                  {g.category}
                  <span className="rounded-full bg-surface-container px-2 text-xs text-on-surface-variant">
                    {g.posts.length}
                    <span className="sr-only"> {g.posts.length === 1 ? "post" : "posts"}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <p className="sr-only">{total} posts in total.</p>
        </nav>
      </PageHeader>

      <Container className="flex flex-col gap-14 py-12 md:gap-20 md:py-16">
        {groups.map((g) => (
          <section key={g.slug} id={g.slug} aria-labelledby={`${g.slug}-heading`} className="scroll-mt-24">
            <h2
              id={`${g.slug}-heading`}
              className="font-headline text-2xl font-bold tracking-tight text-on-surface sm:text-3xl"
            >
              {g.category}
            </h2>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {g.posts.map((post) => (
                <li key={post.slug} className="flex">
                  <PostCard post={post} className="w-full" />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </Container>
    </>
  );
}
