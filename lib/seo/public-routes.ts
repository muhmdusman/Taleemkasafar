import type { MetadataRoute } from "next";
import { routes } from "@/lib/routes";

/**
 * Central list of STATIC public routes for app/sitemap.ts.
 * Dynamic entries (blog posts, /merit-calculator/[university]) are appended
 * by their own phases: export a `get...SitemapEntries()` next to their data
 * and spread it into the sitemap.
 */
export type PublicRoute = {
  path: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]["changeFrequency"]>;
  priority: number;
};

export const staticPublicRoutes: PublicRoute[] = [
  { path: routes.home, changeFrequency: "weekly", priority: 1 },
  { path: routes.meritCalculator, changeFrequency: "monthly", priority: 0.9 },
  { path: routes.blog, changeFrequency: "weekly", priority: 0.8 },
  { path: routes.academies, changeFrequency: "monthly", priority: 0.6 },
  { path: routes.contact, changeFrequency: "yearly", priority: 0.5 },
];
