import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  // Support BOTH attribute-based and class-based theme switching.
  // `data-theme="dark"|"light"` is the new contract; `.dark`/`.light` retained
  // for backwards compatibility with components that already use it.
  darkMode: ["class", "[data-theme='dark']"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Newsreader", "ui-serif", "Georgia", "serif"],
        sans: ["'Inter Tight Variable'", "'Inter Tight'", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "Menlo", "monospace"],
        code: ["'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      colors: {
        graphite: {
          50: "#f4f5f6",
          100: "#e6e8ea",
          200: "#c8ccd0",
          300: "#969ba2",
          400: "#5e636b",
          500: "#3d4148",
          600: "#292c31",
          700: "#1a1c20",
          800: "#121417",
          900: "#0b0d0f",
          950: "#07080a",
        },
        oxide: {
          50: "#fbf3ef",
          100: "#f5dfd2",
          200: "#f1cdbe",
          300: "#e3a48a",
          400: "#d18260",
          500: "#b8623f",
          600: "#964d31",
          700: "#743923",
          800: "#5a2c1c",
          900: "#3f2014",
          DEFAULT: "#b8623f",
        },
        signal: {
          ok: "#6a8f6e",
          warn: "#c89a4a",
        },
        // Warm-neutral scale for light theme surfaces (NEW)
        stone: {
          50: "#fafaf7",
          100: "#f4f3ef",
          200: "#e7e5dd",
          300: "#d3d0c4",
          400: "#a39e8c",
          500: "#736f63",
          600: "#544f47",
          700: "#3a3631",
          800: "#23211d",
          900: "#100e0c",
          950: "#070605",
        },
        // CSS-variable-driven semantic tokens (NEW — Phase 2 contract)
        surface: {
          bg: "rgb(var(--surface-bg) / <alpha-value>)",
          1: "rgb(var(--surface-1-rgb) / <alpha-value>)",
          2: "rgb(var(--surface-2-rgb) / <alpha-value>)",
        },
        ink: {
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          secondary: "rgb(var(--text-secondary) / <alpha-value>)",
          mono: "rgb(var(--text-mono) / <alpha-value>)",
          muted: "rgb(var(--text-muted) / <alpha-value>)",
        },
        // Migration aliases (existing components still reference accent.*)
        accent: {
          50: "#fbf3ef",
          100: "#f5dfd2",
          200: "#f1cdbe",
          300: "#e3a48a",
          400: "#d18260",
          500: "#b8623f",
          600: "#964d31",
          700: "#743923",
          DEFAULT: "#b8623f",
        },
      },
      spacing: {
        "4.5": "1.125rem",
        "13": "3.25rem",
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
      },
      maxWidth: {
        reading: "68ch",
        page: "1320px",
        wide: "1480px",
      },
      transitionDuration: {
        "180": "180ms",
        "280": "280ms",
        "420": "420ms",
        "640": "640ms",
        "1200": "1200ms",
      },
      transitionTimingFunction: {
        "out-soft": "cubic-bezier(0.22, 1, 0.36, 1)",
        "in-out-quad": "cubic-bezier(0.45, 0, 0.55, 1)",
        spring: "cubic-bezier(0.34, 1.20, 0.64, 1)",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "68ch",
            color: "inherit",
            a: { color: "inherit", textUnderlineOffset: "3px" },
          },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.42s cubic-bezier(0.22, 1, 0.36, 1)",
        "reveal-up": "revealUp 0.42s cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        revealUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
} satisfies Config;
