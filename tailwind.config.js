/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "Inter", "sans-serif"],
      },
      colors: {
        // Primary accent: bold blue
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
        // Navy dark backgrounds
        navy: {
          950: "#060b18",
          900: "#0b1120",
          800: "#101828",
          700: "#152032",
          600: "#1b2b42",
          500: "#223552",
        },
        // Keep solar for result accents
        solar: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.05)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.08)",
        "brand-sm": "0 2px 8px rgba(59,130,246,0.25)",
        brand: "0 4px 16px rgba(59,130,246,0.30)",
      },
      animation: {
        "fade-in": "fadeIn 0.35s ease both",
        "slide-up": "slideUp 0.35s ease both",
        "spin-slow": "spin 2s linear infinite",
        "pulse-slow": "pulse 2.5s cubic-bezier(0.4,0,0.6,1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
