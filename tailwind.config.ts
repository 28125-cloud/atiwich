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
        nightning: {
          900: "#0b0f19",
          800: "#111827",
          700: "#1f293d",
          600: "#2d3748",
          amber: "#f59e0b",
          red: "#ef4444",
          crimson: "#dc2626",
          gold: "#fbbf24",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "Prompt", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
