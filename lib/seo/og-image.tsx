import { ImageResponse } from "next/og";
import { defaultOgImageAlt, siteConfig } from "@/config/site";

/**
 * Shared renderers for the Open Graph + Twitter images: the site default
 * (app/opengraph-image.tsx, app/twitter-image.tsx) and per blog post
 * (app/blog/[slug]/opengraph-image.tsx + twitter-image.tsx).
 *
 * Hex values are allowed here (an image route, not a component). They mirror
 * the v2 tokens in app/globals.css: keep them in sync on a palette change.
 */
const COLORS = {
  surface: "#F6F6F3",
  ink: "#2B3038",
  onInk: "#FDFDFB",
  muted: "#57606A",
  brand: "#2563EB",
  brandFixed: "#E1EAFF",
} as const;

export const ogSize = { width: 1200, height: 630 };
export const ogAlt = defaultOgImageAlt;

/** The geometric "TS" mark (same geometry as app/icon.svg). */
function Mark({ size }: { size: number }) {
  const s = size / 64;
  const bar = (x: number, y: number, w: number, h: number, fill: string) => (
    <div
      style={{
        position: "absolute",
        left: x * s,
        top: y * s,
        width: w * s,
        height: h * s,
        background: fill,
      }}
    />
  );
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: size,
        height: size,
        background: COLORS.ink,
        borderRadius: 18 * s,
        overflow: "hidden",
      }}
    >
      {bar(0, 55, 64, 9, COLORS.brand)}
      {bar(9, 16, 22, 7, COLORS.onInk)}
      {bar(16.5, 16, 7, 30, COLORS.onInk)}
      {bar(35, 16, 20, 7, COLORS.brand)}
      {bar(35, 16, 7, 14, COLORS.brand)}
      {bar(35, 27.5, 20, 7, COLORS.brand)}
      {bar(48, 32, 7, 14, COLORS.brand)}
      {bar(35, 39, 20, 7, COLORS.brand)}
    </div>
  );
}

/**
 * Per-post OG/Twitter card (app/blog/[slug]/opengraph-image.tsx):
 * brand row, category pill, post title, "Blog" + origin footer.
 */
export function renderArticleOgImage({ title, category }: { title: string; category: string }) {
  // Long titles step down so they stay inside the card (max ~3 lines).
  const titleSize = title.length > 70 ? 56 : title.length > 45 ? 64 : 72;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: COLORS.surface,
          padding: 72,
          color: COLORS.ink,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Mark size={72} />
          <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: -1 }}>
            {siteConfig.name}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              background: COLORS.brandFixed,
              color: COLORS.brand,
              fontSize: 28,
              fontWeight: 700,
              padding: "10px 22px",
              borderRadius: 999,
            }}
          >
            {category}
          </div>
          <div
            style={{
              fontSize: titleSize,
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: -2,
              maxWidth: 1050,
            }}
          >
            {title}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 26 }}>
          <div style={{ display: "flex", fontWeight: 700, color: COLORS.ink }}>Blog</div>
          <div style={{ display: "flex", color: COLORS.muted }}>
            {siteConfig.url.replace(/^https?:\/\//, "")}/blog
          </div>
        </div>
      </div>
    ),
    ogSize,
  );
}

export function renderOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: COLORS.surface,
          padding: 72,
          color: COLORS.ink,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Mark size={96} />
          <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>
            {siteConfig.name}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 980,
            }}
          >
            Entry test prep that explains every mistake.
          </div>
          <div style={{ fontSize: 32, color: COLORS.muted, maxWidth: 960 }}>
            NET, PU, UET, FAST and NAT. MCQs with explanations, mock tests
            and progress tracking for Pakistani students.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              background: COLORS.brand,
              color: COLORS.onInk,
              fontSize: 26,
              fontWeight: 700,
              padding: "12px 24px",
              borderRadius: 16,
            }}
          >
            Free for students
          </div>
          <div style={{ fontSize: 26, color: COLORS.muted }}>
            {siteConfig.url.replace(/^https?:\/\//, "")}
          </div>
        </div>
      </div>
    ),
    ogSize,
  );
}
