import { ogAlt, ogSize, renderOgImage } from "@/lib/seo/og-image";

// Default Open Graph image for every route (pages may override).
export const alt = ogAlt;
export const size = ogSize;
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderOgImage();
}
