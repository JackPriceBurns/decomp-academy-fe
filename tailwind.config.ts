import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import { tailwindColors } from "./src/lib/theme";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      // Semantic colours are CSS-var references (see src/lib/theme.ts), so every
      // utility — and its /opacity modifier — resolves against the active theme.
      colors: tailwindColors,
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }], // 10px chips
        asm: ["0.78rem", { lineHeight: "1.7" }], // disassembly rows
      },
      transitionTimingFunction: {
        "out-quint": "cubic-bezier(0.22, 1, 0.36, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up-fade": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "row-settle": {
          "0%": { opacity: "0", transform: "translateX(-5px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-good": {
          "0%,100%": { boxShadow: "0 0 0 0 rgba(63,185,80,0.4)" },
          "50%": { boxShadow: "0 0 0 6px rgba(63,185,80,0)" },
        },
        "ring-burst": {
          "0%": { boxShadow: "0 0 0 0 rgba(63,185,80,0.5)" },
          "100%": { boxShadow: "0 0 0 24px rgba(63,185,80,0)" },
        },
        "count-pop": {
          "0%": { transform: "scale(0.82)" },
          "60%": { transform: "scale(1.08)" },
          "100%": { transform: "scale(1)" },
        },
        "success-sweep": {
          "0%": { transform: "translateX(-120%)", opacity: "0" },
          "35%": { opacity: "0.55" },
          "100%": { transform: "translateX(120%)", opacity: "0" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "draw-check": {
          "0%": { strokeDashoffset: "28" },
          "100%": { strokeDashoffset: "0" },
        },
        blink: {
          "0%,49%": { opacity: "1" },
          "50%,100%": { opacity: "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
        "slide-up-fade": "slide-up-fade 0.4s cubic-bezier(0.22,1,0.36,1) both",
        "row-settle": "row-settle 0.24s cubic-bezier(0.22,1,0.36,1) both",
        "pulse-good": "pulse-good 1.2s ease-out",
        "ring-burst": "ring-burst 0.7s ease-out",
        "count-pop": "count-pop 0.4s cubic-bezier(0.34,1.56,0.64,1)",
        "success-sweep": "success-sweep 0.9s ease-out",
        shimmer: "shimmer 1.5s infinite linear",
        "draw-check": "draw-check 0.5s ease-out 0.1s both",
        blink: "blink 1.1s step-end infinite",
      },
    },
  },
  plugins: [
    // Ancestor-scoped theme variants so a handful of surfaces (e.g. the diff
    // highlight) can diverge per theme without disturbing the other one.
    plugin(({ addVariant }) => {
      addVariant("theme-light", ':root[data-theme="light"] &');
      addVariant("theme-dark", ':root:not([data-theme="light"]) &');
    }),
  ],
};

export default config;
