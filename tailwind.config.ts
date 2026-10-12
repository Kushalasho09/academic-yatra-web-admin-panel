import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#0C9253",
          primaryHover: "#0A7D46",
          accent: "#0067E3",
          accentDark: "#0654A5",
          navy: "#0F172A",
          navyDeep: "#0B132B",
          navyGlow: "#1E293B",
          tint: "#E5F0FC",
          greenTint: "#E7F7EE",
          gold: "#F59E0B",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
