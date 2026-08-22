/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        // Editorial cream + charcoal system (adapted from a real product's
        // marketing design language) — one neutral canvas, white lift-cards,
        // and a single accent reserved for the one thing worth noticing.
        canvas: "#f5f5f5",
        paper: "#ffffff",
        "surface-2": "#ebe7e1",
        ink: "#1a1a1a",
        "ink-muted": "#5c5c59",
        "ink-subtle": "#7b7b78",
        hairline: "#d3cec6",
        "hairline-soft": "#ebe7e1",
        "surface-soft": "#ebe7e1",
        accent: "#e35e1c",
        "accent-ink": "#ad4815",
        success: "#0bdf50",
        danger: "#c41c1c",
        // Internal ops dark theme
        "ops-bg": "#0f172a",
        "ops-ink": "#f1f5f9",
        "ops-border": "#334155",
        "ops-border-soft": "#263349",
        "ops-surface": "#1b2336",
        "ops-muted": "#94a3b8",
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
