/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        ink: "#000000",
        paper: "#ffffff",
        hairline: "#e6e6e6",
        "hairline-soft": "#f1f1f1",
        "surface-soft": "#f7f7f5",
        lime: "#dceeb1",
        lilac: "#c5b0f4",
        cream: "#f4ecd6",
        mint: "#c8e6cd",
        pink: "#efd4d4",
        coral: "#f3c9b6",
        navy: "#1f1d3d",
        magenta: "#ff3d8b",
        success: "#1ea64a",
        danger: "#a3372c",
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
        block: "24px",
        panel: "18px",
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
      },
      animation: {
        "reveal-up": "reveal-up 220ms cubic-bezier(0.16,1,0.3,1) backwards",
        "live-pulse": "live-pulse 2.4s cubic-bezier(0.16,1,0.3,1) infinite",
      },
    },
  },
  plugins: [],
};
