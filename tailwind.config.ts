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
        // --- Soft Brutalism design-system palette (see ui_design/design_scheme) ---
        ink: "#000000",
        brand: {
          DEFAULT: "#0058be", // primary / electric blue
          container: "#2170e4", // primary-container
          fixed: "#d8e2ff", // primary-fixed (gamified card bg)
        },
        surface: {
          DEFAULT: "#f9f9f9",
          lowest: "#ffffff",
          low: "#f3f3f4",
          container: "#eeeeee",
          high: "#e8e8e8",
          variant: "#e2e2e2",
        },
        outline: {
          DEFAULT: "#727785",
          variant: "#c2c6d6",
        },
        "on-surface": {
          DEFAULT: "#1a1c1c",
          variant: "#424754",
        },
        danger: "#ba1a1a", // error
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
        hard: "4px 4px 0px 0px rgba(0,0,0,1)",
        "hard-primary": "4px 4px 0px 0px #0058be",
        "hard-sm": "2px 2px 0px 0px rgba(0,0,0,1)",
      },
      keyframes: {
        // Left-to-right sweep used by the quiz loaders (no blur, hard edge).
        loaderSweep: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(300%)" },
        },
      },
      animation: {
        loaderSweep: "loaderSweep 1s linear infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
