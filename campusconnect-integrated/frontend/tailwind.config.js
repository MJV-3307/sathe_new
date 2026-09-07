/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
      },
      colors: {
        background: "#f8f9ff",
        error: "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#410002",

        primary: "#3355a4",
        "primary-container": "#dae2ff",
        "primary-fixed": "#dae2ff",
        "primary-fixed-dim": "#b4c5ff",
        "on-primary": "#ffffff",
        "on-primary-fixed": "#001849",

        secondary: "#585e71",
        "secondary-container": "#dce1f9",
        "secondary-fixed": "#dce1f9",
        "on-secondary": "#ffffff",
        "on-secondary-fixed": "#151b2c",
        "on-secondary-fixed-variant": "#404659",

        surface: "#f8f9ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f2f3fb",
        "surface-container": "#eceef5",
        "surface-container-high": "#e6e8ef",
        "surface-container-highest": "#e1e2e9",

        "on-surface": "#191c20",
        "on-surface-variant": "#44474e",

        outline: "#75777f",
        "outline-variant": "#c5c6d0",
      },
      fontSize: {
        "display-sm": ["2.25rem", { lineHeight: "2.75rem", fontWeight: "700" }],
        "headline-lg": ["2rem", { lineHeight: "2.5rem", fontWeight: "800" }],
        "headline-md": ["1.75rem", { lineHeight: "2.25rem", fontWeight: "800" }],
        "headline-sm": ["1.5rem", { lineHeight: "2rem", fontWeight: "700" }],
        "title-md": ["1rem", { lineHeight: "1.5rem", fontWeight: "700" }],
        "body-md": ["0.875rem", { lineHeight: "1.25rem", fontWeight: "400" }],
        "body-sm": ["0.8125rem", { lineHeight: "1.125rem", fontWeight: "400" }],
        "label-lg": ["0.9375rem", { lineHeight: "1.25rem", fontWeight: "600" }],
        "label-md": ["0.8125rem", { lineHeight: "1.125rem", fontWeight: "600" }],
        "label-sm": ["0.75rem", { lineHeight: "1rem", fontWeight: "600" }],
      },
      boxShadow: {
        "stitch-sm": "0 1px 2px rgba(16, 24, 60, 0.06)",
        "stitch-md": "0 4px 12px rgba(16, 24, 60, 0.10)",
        "stitch-card": "0 2px 8px rgba(16, 24, 60, 0.08)",
        xs: "0 1px 1px rgba(16, 24, 60, 0.05)",
      },
    },
  },
  plugins: [],
};
