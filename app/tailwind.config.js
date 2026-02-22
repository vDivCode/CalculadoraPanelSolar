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
        solar: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        dark: {
          900: "#050810",
          800: "#0a0f1e",
          700: "#0f1628",
          600: "#141d35",
          500: "#1a2540",
          400: "#243050",
        },
      },
      backgroundImage: {
        "gradient-solar":
          "linear-gradient(135deg, #f59e0b 0%, #fcd34d 50%, #d97706 100%)",
        "gradient-dark": "linear-gradient(135deg, #050810 0%, #0a0f1e 100%)",
      },
      boxShadow: {
        solar: "0 0 40px rgba(245, 158, 11, 0.15)",
        "solar-lg": "0 0 60px rgba(245, 158, 11, 0.25)",
        "solar-btn": "0 4px 20px rgba(245, 158, 11, 0.35)",
      },
      animation: {
        "fade-in-up": "fadeInUp 0.4s ease",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 3s linear infinite",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
