import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Soft Brutalism: Space Grotesk for headlines, Inter for body.
        headline: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        // --- Soft Brutalism design-system palette (see .kiro/context/DESIGN.md §2-3) ---
        // Values are RGB-channel CSS variables in app/globals.css, so a palette
        // swap is a globals.css edit and opacity modifiers (`/50`) still work.
        ink: "rgb(var(--ink) / <alpha-value>)",
        "on-ink": "rgb(var(--on-ink) / <alpha-value>)",
        brand: {
          DEFAULT: "rgb(var(--brand) / <alpha-value>)", // primary / electric blue
          container: "rgb(var(--brand-container) / <alpha-value>)", // primary-container
          fixed: "rgb(var(--brand-fixed) / <alpha-value>)", // primary-fixed (gamified card bg)
        },
        "on-brand": "rgb(var(--on-brand) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          lowest: "rgb(var(--surface-lowest) / <alpha-value>)",
          low: "rgb(var(--surface-low) / <alpha-value>)",
          container: "rgb(var(--surface-container) / <alpha-value>)",
          high: "rgb(var(--surface-high) / <alpha-value>)",
          variant: "rgb(var(--surface-variant) / <alpha-value>)",
        },
        outline: {
          DEFAULT: "rgb(var(--outline) / <alpha-value>)",
          variant: "rgb(var(--outline-variant) / <alpha-value>)",
        },
        "on-surface": {
          DEFAULT: "rgb(var(--on-surface) / <alpha-value>)",
          variant: "rgb(var(--on-surface-variant) / <alpha-value>)",
        },
        success: {
          DEFAULT: "rgb(var(--success) / <alpha-value>)", // correct answer
          fixed: "rgb(var(--success-fixed) / <alpha-value>)", // correct tint
        },
        danger: {
          DEFAULT: "rgb(var(--danger) / <alpha-value>)", // error / wrong answer
          fixed: "rgb(var(--danger-fixed) / <alpha-value>)", // wrong tint
        },
        // --- shadcn tokens (kept for existing ui/ primitives) ---
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        // Soft Brutalism "hard shadow" — solid offset, no blur.
        hard: "4px 4px 0px 0px rgb(var(--ink))",
        "hard-primary": "4px 4px 0px 0px rgb(var(--brand))",
        "hard-sm": "2px 2px 0px 0px rgb(var(--ink))",
        // Public site variant only (app/(marketing), components/marketing):
        // subtle, tokenized soft shadows. Never use on the dashboard.
        soft: "0 1px 2px 0 rgb(var(--ink) / 0.05), 0 4px 12px -2px rgb(var(--ink) / 0.07)",
        "soft-lg":
          "0 2px 4px 0 rgb(var(--ink) / 0.05), 0 16px 32px -8px rgb(var(--ink) / 0.12)",
      },
      keyframes: {
        // Left-to-right sweep used by the quiz loaders (no blur, hard edge).
        loaderSweep: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(300%)" },
        },
        // Accordion-style open/close. Still referenced by the (unused, kept)
        // @esuiss components/ui/trace.tsx; shadcn accordion.tsx was removed.
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        loaderSweep: "loaderSweep 1s linear infinite",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
