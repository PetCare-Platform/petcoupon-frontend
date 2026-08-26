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
        canvas: "#f7fbff",
        paper: "#ffffff",
        "surface-2": "#edf8f5",
        ink: "#17243a",
        "ink-muted": "#56647a",
        "ink-subtle": "#748096",
        hairline: "#d8e4eb",
        "hairline-soft": "#eaf1f5",
        "surface-soft": "#edf8f5",
        accent: "#75d6bb",
        "accent-ink": "#176f61",
        clay: "#ff9f8d",
        "clay-ink": "#a83e31",
        sky: "#bfe5ff",
        lemon: "#fff3af",
        success: "#37b98c",
        danger: "#dc5f54",
        // Internal ops dark theme
        "ops-bg": "#eef8f6",
        "ops-ink": "#17243a",
        "ops-border": "#cfe1df",
        "ops-border-soft": "#deecea",
        "ops-surface": "#ffffff",
        "ops-muted": "#60726f",
        "ops-accent": "#ef7867",
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
        control: "14px",
        block: "22px",
        panel: "30px",
      },
      transitionTimingFunction: {
        fluid: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
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
        "paw-pop": {
          "0%": { transform: "translate(-50%, -50%) scale(0.4) rotate(var(--paw-rot, 0deg))", opacity: "0" },
          "20%": { opacity: "1" },
          "100%": {
            transform:
              "translate(calc(-50% + var(--paw-x, 0px)), calc(-50% + var(--paw-y, -40px))) scale(1) rotate(var(--paw-rot, 0deg))",
            opacity: "0",
          },
        },
      },
      animation: {
        "reveal-up": "reveal-up 220ms cubic-bezier(0.16,1,0.3,1) backwards",
        "live-pulse": "live-pulse 2.4s cubic-bezier(0.16,1,0.3,1) infinite",
        float: "float 5s cubic-bezier(0.45,0,0.55,1) infinite",
        "paw-pop": "paw-pop 750ms cubic-bezier(0.16,1,0.3,1) forwards",
      },
    },
  },
  plugins: [],
};
