import { ogAlt, ogSize, renderOgImage } from "@/lib/seo/og-image";

// Default Twitter/X card image (same artwork as the Open Graph image).
export const alt = ogAlt;
export const size = ogSize;
export const contentType = "image/png";

export default function TwitterImage() {
  return renderOgImage();
}
