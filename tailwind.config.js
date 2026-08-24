/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        // Soft-structuralism neutral system: near-white/silver-grey canvas
        // (no yellow cast) with a forest-green primary accent and a
        // terracotta secondary — pet-native warmth carried by the accents,
        // not by a dingy cream base.
        canvas: "#fbfbfa",
        paper: "#ffffff",
        "surface-2": "#eeede9",
        ink: "#1d1d1b",
        "ink-muted": "#57564f",
        "ink-subtle": "#79776f",
        hairline: "#dddad3",
        "hairline-soft": "#eeede9",
        "surface-soft": "#eeede9",
        accent: "#85c167",
        "accent-ink": "#345921",
        clay: "#c1714e",
        "clay-ink": "#b63f0c",
        success: "#0bdf50",
        danger: "#c1442c",
        // Internal ops dark theme
        "ops-bg": "#0b1210",
        "ops-ink": "#f2f6f0",
        "ops-border": "#2b3b32",
        "ops-border-soft": "#1c2822",
        "ops-surface": "#141f1a",
        "ops-muted": "#93a89c",
        "ops-accent": "#c1714e",
      },
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "Noto Sans KR",
          "system-ui",
          "sans-serif",
        ],
        mono: ["SFMono-Regular", "SF Mono", "Menlo", "monospace"],
        "ops-sans": ["Fira Sans", "Pretendard Variable", "sans-serif"],
        "ops-mono": ["Fira Code", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        control: "8px",
        block: "12px",
        panel: "16px",
      },
      transitionTimingFunction: {
        fluid: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "reveal-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "live-pulse": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.45", transform: "scale(0.85)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "reveal-up": "reveal-up 220ms cubic-bezier(0.16,1,0.3,1) backwards",
        "live-pulse": "live-pulse 2.4s cubic-bezier(0.16,1,0.3,1) infinite",
        float: "float 5s cubic-bezier(0.45,0,0.55,1) infinite",
      },
    },
  },
  plugins: [],
};
