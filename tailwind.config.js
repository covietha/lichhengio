/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "media",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', "system-ui", "-apple-system", '"Segoe UI"', "Roboto", "sans-serif"],
      },
      colors: {
        paper: { DEFAULT: "#F6F7F4", dark: "#14181B" },
        ink: { DEFAULT: "#1E2A32", dark: "#E7ECEE" },
        brand: { DEFAULT: "#0F766E", dark: "#2DD4BF" },
      },
    },
  },
  plugins: [],
};
