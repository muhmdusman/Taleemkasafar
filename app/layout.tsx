import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

// Canonical site origin first (canonical URLs / OG images must point at the
// real domain, not the per-deployment *.vercel.app URL).
const defaultUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Taleem ka Safar",
  description: "Entry-test preparation — subject-wise MCQs, mock tests, analytics",
};

// Soft Brutalism: Space Grotesk (headlines) + Inter (body).
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  display: "swap",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/*
        The Material Symbols icon font is loaded by the dashboard layout only
        (components/material-symbols-font.tsx); the public site and auth pages
        use lucide-react and skip it.
      */}
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} font-body antialiased`}
      >
        {/*
          Light theme forced until dark mode is designed (DESIGN.md §8). With
          "system", dark-OS users got the `.dark` shadcn variables and a dark
          color-scheme on inputs while our brand tokens stayed light, so auth
          fields and cards rendered with unreadable contrast.
        */}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
