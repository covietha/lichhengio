/** @type {import('tailwindcss').Config} */
const c = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  // Màu đổi theo hệ thống bằng biến CSS trong index.css, nên không cần tiền tố dark:.
  darkMode: "media",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', "system-ui", "-apple-system", '"Segoe UI"', "Roboto", "sans-serif"],
        display: ['"Bricolage Grotesque"', '"Be Vietnam Pro"', "system-ui", "sans-serif"],
      },
      colors: {
        paper: c("paper"),
        surface: c("surface"),
        ink: c("ink"),
        muted: c("muted"),
        line: c("line"),
        pen: c("pen"),
        "pen-soft": c("pen-soft"),
        "on-pen": c("on-pen"),
        margin: c("margin"),
        "margin-soft": c("margin-soft"),
        amber: c("amber"),
        "amber-soft": c("amber-soft"),
        ok: c("ok"),
        "ok-soft": c("ok-soft"),
      },
    },
  },
  plugins: [],
};
