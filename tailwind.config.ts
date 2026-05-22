import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold:  { DEFAULT:"#C9A554", light:"#F0D880", dark:"#9A7030" },
        navy:  { DEFAULT:"#080C1E", card:"rgba(20,25,60,0.7)" },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Noto Serif JP", "serif"],
        sans:  ["var(--font-sans)",  "Noto Sans JP",  "sans-serif"],
      },
      maxWidth: { app: "480px" },
      animation: {
        "spin-slow": "spin 60s linear infinite",
        "fade-up":   "fadeUp .5s ease forwards",
      },
    },
  },
  plugins: [],
}
export default config
