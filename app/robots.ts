import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";
import { routes } from "@/lib/routes";

/** /robots.txt: crawl the public site, keep the app and auth flows out. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [routes.dashboard, "/auth"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
