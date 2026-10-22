import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  // The blog loader reads content/blog/*.md from disk. Posts are prerendered,
  // but the unknown-slug fallback (404) still runs the loader at request time,
  // so ship the Markdown with the serverless bundle. The loader also checks
  // that each post's cover exists under public/, so ship the covers too
  // (public/ is CDN-served and not traced into functions by default).
  outputFileTracingIncludes: {
    "/blog/*": ["./content/blog/**/*", "./public/blog/covers/**/*"],
  },
  // Legacy app URLs (pre 2026-10-22, when the app lived at the root) → the
  // /dashboard/* equivalents, so bookmarks and shared links keep working.
  // next.config redirects run before the proxy, so these 308 even when
  // signed out (the destination then applies the auth guard).
  async redirects() {
    return [
      { source: "/subjects", destination: "/dashboard/subjects", permanent: true },
      {
        source: "/subjects/:path*",
        destination: "/dashboard/subjects/:path*",
        permanent: true,
      },
      { source: "/mock", destination: "/dashboard/mock", permanent: true },
      {
        source: "/mock/:path*",
        destination: "/dashboard/mock/:path*",
        permanent: true,
      },
      {
        source: "/performance",
        destination: "/dashboard/performance",
        permanent: true,
      },
      // Short public aliases for the existing auth pages (see
      // .kiro/context/decisions.md). Temporary (307) so the targets can move
      // later without browsers caching the hop.
      { source: "/sign-in", destination: "/auth/login", permanent: false },
      { source: "/register", destination: "/auth/sign-up", permanent: false },
    ];
  },
};

export default nextConfig;
