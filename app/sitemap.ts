import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";
import { staticPublicRoutes } from "@/lib/seo/public-routes";
import { getMeritSitemapEntries } from "@/lib/seo/merit-sitemap";
import { getBlogSitemapEntries } from "@/lib/blog/loader";

/**
 * /sitemap.xml: static public routes + one entry per merit-calculator
 * university + one per blog post. Each dynamic section exports a `get...SitemapEntries()` next to
 * its data (see lib/seo/public-routes.ts) and is spread in below.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = staticPublicRoutes.map((r) => ({
    url: absoluteUrl(r.path),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  return [
    ...staticEntries,
    ...getMeritSitemapEntries(),
    ...(await getBlogSitemapEntries()),
  ];
}
