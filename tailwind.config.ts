import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["Fraunces", "ui-serif", "Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "Menlo", "monospace"],
      },
      colors: {
        ink: {
          50: "#f8f7f4",
          100: "#f0ede4",
          200: "#d9d4c3",
          300: "#b8b09a",
          400: "#8a8069",
          500: "#5a513e",
          600: "#3f3828",
          700: "#2a2417",
          800: "#1a160d",
          900: "#0d0a05",
          950: "#050402",
        },
        accent: {
          50: "#fef2f2",
          100: "#fde6e3",
          200: "#facec8",
          300: "#f4a89d",
          400: "#ec7867",
          500: "#dc4a34",
          600: "#c5331f",
          700: "#a4281a",
          800: "#872519",
          900: "#70231a",
          DEFAULT: "#c5331f",
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "72ch",
            color: "inherit",
            a: { color: "inherit", textUnderlineOffset: "3px" },
          },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out",
        "slide-up": "slideUp 0.6s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
