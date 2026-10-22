import Image from "next/image";
import Link from "next/link";
import type { BlogPostMeta } from "@/lib/blog/types";
import { formatPostDate, formatReadingTime } from "@/lib/blog/format";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { CategoryBadge } from "@/components/marketing/blog/post-meta";

type PostCardProps = {
  post: BlogPostMeta;
  /** Heading level of the card title (h3 under a section h2 by default). */
  headingLevel?: "h2" | "h3";
  className?: string;
};

/**
 * Blog listing card (server component). The title link is the card's one
 * descriptive link; its ::after overlay makes the whole card clickable
 * without nesting interactive elements.
 */
export function PostCard({ post, headingLevel: Heading = "h3", className }: PostCardProps) {
  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-lowest shadow-soft transition-[transform,box-shadow] duration-200 focus-within:ring-2 focus-within:ring-brand-container focus-within:ring-offset-2 focus-within:ring-offset-surface hover:-translate-y-0.5 hover:shadow-soft-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        className,
      )}
    >
      <Image
        src={post.coverImage}
        alt={`Cover illustration for “${post.title}”`}
        width={1200}
        height={630}
        // SVG covers: served as-is (the optimizer rejects SVG by default).
        unoptimized
        className="aspect-[1200/630] w-full border-b border-outline-variant bg-surface-low object-cover"
      />
      <div className="flex flex-1 flex-col p-6">
        <CategoryBadge category={post.category} />
        <Heading className="mt-4 font-headline text-xl font-bold leading-snug tracking-tight text-on-surface">
          <Link
            href={routes.blogPost(post.slug)}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-hover:text-brand-container"
          >
            {post.title}
          </Link>
        </Heading>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{post.description}</p>
        <p className="mt-auto pt-5 text-sm text-on-surface-variant">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          <span aria-hidden="true"> · </span>
          <span>{formatReadingTime(post.readingTimeMinutes)}</span>
        </p>
        <ul aria-label="Tags" className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-surface-container px-2.5 py-0.5 text-xs font-medium text-on-surface-variant"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
