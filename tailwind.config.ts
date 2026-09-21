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
        background: "#FAF9F7",
        foreground: "#1A1A1A",
        accent: "#FF6B4A",
        secondary: "#1E3A8A",
      },
    },
  },
  plugins: [],
};
export default config;
