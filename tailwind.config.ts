import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: {
          deep: "var(--bg-deep)",
          page: "var(--bg-page)",
          card: "var(--bg-card)",
          raised: "var(--bg-raised)",
        },
        ink: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        hairline: {
          DEFAULT: "var(--border-hairline)",
          strong: "var(--border-hairline-strong)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          soft: "var(--accent-soft)",
        },
        positive: "var(--positive)",
        negative: "var(--negative)",
      },
      boxShadow: {
        "top-highlight": "inset 0 1px 0 rgba(255, 255, 255, 0.08)",
      },
      transitionTimingFunction: {
        unslop: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
