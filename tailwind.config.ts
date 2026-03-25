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
        brand: {
          50:  "#F1F8E9",
          100: "#DCEDC8",
          200: "#C5E1A5",
          300: "#AED581",
          400: "#9CCC65",
          500: "#8BC34A",
          600: "#7CB342",
          700: "#558B2F",
          800: "#2E7D32",
          900: "#1B5E20",
          950: "#0D3B13",
        },
        sport: {
          volleyball: "#f97316",
          basketball: "#ef4444",
          soccer:     "#22c55e",
          baseball:   "#3b82f6",
        },
        gold: "#FFB300",
        "gold-light": "#FFE082",
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["Trebuchet MS", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
