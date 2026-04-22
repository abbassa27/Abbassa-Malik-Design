import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-montserrat)", "Montserrat", "Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
      },
      colors: {
        void: "#0A0A0A",
        ink: "#0D0D0D",
        cream: "#FAF8F5",
        charcoal: "#1A1A1A",
        gold: "#C9A963",
        "gold-light": "#E4D4A5",
        "gold-deep": "#8B6914",
        muted: "#9A9A9A",
        ivory: "#F4F1EA",
      },
      backgroundImage: {
        "gold-shine":
          "linear-gradient(120deg, #C9A963 0%, #F0E6C8 45%, #C9A963 90%)",
        "radial-gold": "radial-gradient(ellipse at 50% 0%, rgba(201,169,99,0.18) 0%, transparent 55%)",
      },
      animation: {
        "fade-in": "fadeIn 0.8s ease forwards",
        "slide-up": "slideUp 0.7s ease forwards",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
