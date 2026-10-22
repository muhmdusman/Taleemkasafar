import type { FaqItem } from "@/config/faq";
import { absoluteUrl, siteConfig } from "@/config/site";
import type { BlogPostMeta } from "@/lib/blog/types";
import { routes } from "@/lib/routes";

/**
 * JSON-LD structured data. Server component: renders a
 * <script type="application/ld+json"> with no client JS.
 *
 * `<` is escaped to \u003c so a value containing "</script>" can never
 * break out of the script element (script-injection guard). JSON stays valid.
 */

type JsonLdObject = Record<string, unknown>;

export function serializeJsonLd(data: JsonLdObject | JsonLdObject[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  return (
    <script
      type="application/ld+json"
      // Safe: serializeJsonLd escapes "<", and data comes from typed config.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

const ORG_ID = `${siteConfig.url}/#organization`;
const WEBSITE_ID = `${siteConfig.url}/#website`;

export function organizationJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": ORG_ID,
    name: siteConfig.name,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/icon.svg"),
    description: siteConfig.description,
    areaServed: { "@type": "Country", name: "Pakistan" },
  };
}

export function websiteJsonLd(): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: siteConfig.name,
    url: absoluteUrl("/"),
    description: siteConfig.description,
    inLanguage: siteConfig.language,
    publisher: { "@id": ORG_ID },
  };
}

export function faqPageJsonLd(items: FaqItem[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export type Breadcrumb = { name: string; path: string };

export function breadcrumbJsonLd(items: Breadcrumb[]): JsonLdObject {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export type ArticleJsonLdInput = Pick<
  BlogPostMeta,
  "slug" | "title" | "description" | "date" | "author" | "category" | "tags"
>;

/**
 * Article JSON-LD for /blog/[slug]. `image` is the per-post PNG OG image
 * (SVG covers are not reliable for rich results). dateModified = date until
 * posts carry an updated date. A "<Brand> Team" byline is an Organization.
 */
export function articleJsonLd(post: ArticleJsonLdInput): JsonLdObject {
  const url = absoluteUrl(routes.blogPost(post.slug));
  const isTeam = post.author === `${siteConfig.name} Team`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: [`${url}/opengraph-image`],
    datePublished: post.date,
    dateModified: post.date,
    author: isTeam
      ? { "@type": "Organization", name: post.author, url: absoluteUrl("/") }
      : { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      "@id": ORG_ID,
      name: siteConfig.name,
      url: absoluteUrl("/"),
      logo: { "@type": "ImageObject", url: absoluteUrl("/icon.svg") },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    articleSection: post.category,
    keywords: post.tags.join(", "),
    inLanguage: siteConfig.language,
  };
}
