import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";
import { getUniversitySlugs } from "@/data/merit-formulas";
import { routes } from "@/lib/routes";

/** Sitemap entries for every /merit-calculator/[university] page. */
export function getMeritSitemapEntries(): MetadataRoute.Sitemap {
  return getUniversitySlugs().map((slug) => ({
    url: absoluteUrl(routes.meritUniversity(slug)),
    changeFrequency: "monthly",
    priority: 0.7,
  }));
}
