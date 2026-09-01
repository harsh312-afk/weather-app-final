/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      colors: {
        weather: {
          dark: "#0b132b",
          night: "#1c2541",
          day: "#0077b6",
          sun: "#f77f00",
          cloud: "#6c757d",
          rain: "#3a86ff",
          accent: "#38bdf8",
        },
      },
      animation: {
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 12s linear infinite",
        "bounce-subtle": "bounceSubtle 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(2deg)" },
        },
      },
      boxShadow: {
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.2)",
        "glass-glow": "0 0 25px rgba(56, 189, 248, 0.25)",
        "card-hover": "0 20px 40px -15px rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [],
};