import type { Metadata } from "next";
import { absoluteUrl, defaultOgImageAlt, siteConfig } from "@/config/site";

type BuildMetadataInput = {
  /**
   * Page title. Rendered through the marketing layout template
   * ("%s | Taleem ka Safar") unless `absoluteTitle` is set.
   */
  title: string;
  description: string;
  /** Site path, e.g. "/blog/my-post". Used for the canonical + og:url. */
  path: string;
  /**
   * Absolute OG image URL (1200×630 PNG). Defaults to app/opengraph-image.
   * Pair with `twitterImage` when a matching twitter-image route exists.
   */
  image?: string;
  /** Absolute Twitter card image URL. Defaults to `image`, else app/twitter-image. */
  twitterImage?: string;
  type?: "website" | "article";
  /** Open Graph article fields (only used with `type: "article"`). */
  article?: {
    publishedTime: string;
    modifiedTime?: string;
    authors?: string[];
    tags?: string[];
    section?: string;
  };
  noIndex?: boolean;
  /** Use `title` as-is (no template), e.g. for the home page. */
  absoluteTitle?: boolean;
};

/**
 * Per-page metadata for public pages: unique title + description, canonical
 * URL on the canonical origin, Open Graph and Twitter cards.
 */
export function buildMetadata({
  title,
  description,
  path,
  image,
  twitterImage,
  type = "website",
  article,
  noIndex = false,
  absoluteTitle = false,
}: BuildMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const socialTitle = absoluteTitle ? title : `${title} | ${siteConfig.name}`;
  // A page-level `openGraph`/`twitter` object replaces the parent's, which
  // drops the app/opengraph-image + app/twitter-image file-convention images.
  // So the defaults are set explicitly here.
  const ogImages = image
    ? [{ url: image, width: 1200, height: 630, alt: socialTitle }]
    : [{ url: absoluteUrl("/opengraph-image"), width: 1200, height: 630, alt: defaultOgImageAlt }];
  const twitterImages = [twitterImage ?? image ?? absoluteUrl("/twitter-image")];

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: socialTitle,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      images: ogImages,
      ...(type === "article"
        ? { type: "article" as const, ...(article ?? {}) }
        : { type: "website" as const }),
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: twitterImages,
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}
