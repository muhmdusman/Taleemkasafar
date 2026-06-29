import type { Metadata } from "next";
import { Geist, Space_Grotesk, Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Taleem ka Safar",
  description: "Entry-test preparation — subject-wise MCQs, mock tests, analytics",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
        {/*
          Reveal Material Symbols only once the icon font has loaded, so the raw
          ligature text (e.g. "arrow_forward") never flashes. Inline + early so
          it runs before paint; falls back to revealing after a short timeout in
          case the Font Loading API is unavailable.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var F='24px "Material Symbols Outlined"';function show(){document.documentElement.classList.add('ms-loaded')}if(document.fonts&&document.fonts.load){document.fonts.load(F).then(function(){if(document.fonts.check(F))show()}).catch(function(){});document.fonts.ready.then(function(){if(document.fonts.check(F))show()})}})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${spaceGrotesk.variable} ${inter.variable} font-body antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
