import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0a0a09",
        graphite: {
          950: "#0b0b0a",
          900: "#121110",
          800: "#1a1917",
          700: "#252320",
          600: "#37342f",
          500: "#4d4941",
        },
        bone: {
          50: "#faf8f4",
          100: "#f2ede4",
          200: "#e6dcca",
          300: "#d6c7ab",
        },
        brass: {
          400: "#c9a15f",
          500: "#b6884a",
          600: "#96703b",
        },
      },
      fontFamily: {
        serif: ["var(--font-editorial)", "Georgia", "serif"],
        sans: ["var(--font-body)", "Helvetica Neue", "Arial", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.35em",
      },
      transitionTimingFunction: {
        cinematic: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        grain: {
          "0%, 100%": { transform: "translate(0,0)" },
          "10%": { transform: "translate(-2%,-4%)" },
          "30%": { transform: "translate(3%,2%)" },
          "50%": { transform: "translate(-4%,3%)" },
          "70%": { transform: "translate(2%,-3%)" },
          "90%": { transform: "translate(-3%,1%)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 1.2s cubic-bezier(0.16,1,0.3,1) forwards",
        grain: "grain 8s steps(8) infinite",
      },
    },
  },
  plugins: [],
};
export default config;
