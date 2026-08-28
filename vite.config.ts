import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 0.0.0.0 바인딩 — ngrok 등 터널로 외부에서 접속하려면 필요하다.
    host: true,
    // Vite는 Host 헤더가 낯설면 403으로 막는다(DNS 리바인딩 방어).
    // 디자인 리뷰용 ngrok 터널 도메인만 열어둔다. .dev가 현재 무료 플랜
    // 도메인이고, .app/.io는 예전에 발급된 주소용이다.
    allowedHosts: [".ngrok-free.dev", ".ngrok.dev", ".ngrok-free.app", ".ngrok.app", ".ngrok.io"],
    // 개발 중 API 요청을 백엔드로 넘긴다.
    // 브라우저 입장에서는 같은 출처라 CORS 제약을 받지 않는다.
    // 예: fetch('/api/events/1') -> http://localhost:8080/events/1
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
