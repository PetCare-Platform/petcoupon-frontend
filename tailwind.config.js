/**
 * 색상·라디우스 토큰은 CSS 변수를 거친다. 기본값(:root)은 공개·사용자 영역의
 * 기존 값 그대로고, 관리자/내부 운영은 src/index.css 의 `.theme-geist` 에서
 * 같은 변수를 덮어써서 다른 테마로 보인다. 공용 프리미티브(ui.tsx)를
 * 영역별로 분기하지 않고 한 벌로 유지하기 위한 구조다.
 *
 * <alpha-value> 자리표시자 덕분에 bg-accent/10 같은 투명도 수식자도 그대로 동작한다.
 */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

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
        canvas: token("c-canvas"),
        paper: token("c-paper"),
        "surface-2": token("c-surface-2"),
        ink: token("c-ink"),
        "ink-muted": token("c-ink-muted"),
        "ink-subtle": token("c-ink-subtle"),
        hairline: token("c-hairline"),
        "hairline-soft": token("c-hairline-soft"),
        "surface-soft": token("c-surface-soft"),
        accent: token("c-accent"),
        "accent-ink": token("c-accent-ink"),
        clay: token("c-clay"),
        "clay-ink": token("c-clay-ink"),
        sky: "#bfe5ff",
        lemon: "#fff3af",
        success: token("c-success"),
        danger: token("c-danger"),
        // Internal dashboard dark theme
        "ops-bg": "#071722",
        "ops-ink": "#f5fbff",
        "ops-border": "#294553",
        "ops-border-soft": "#1b3542",
        "ops-surface": "#102631",
        "ops-muted": "#9aafba",
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
        // Geist 계열 — 관리자/내부 운영 영역 전용. 한글은 Geist에 없어서 Pretendard로 떨어진다.
        geist: ["Geist", "Pretendard Variable", "Pretendard", "Arial", "sans-serif"],
        "geist-mono": ["Geist Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        control: "var(--r-control)",
        block: "var(--r-block)",
        panel: "var(--r-panel)",
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
