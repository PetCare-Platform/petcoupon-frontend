import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.PORT) || 5173,
    strictPort: Boolean(process.env.PORT),
    // 개발 중 API 요청을 백엔드로 넘긴다.
    // 브라우저 입장에서는 같은 출처라 CORS 제약을 받지 않는다.
    // 예: fetch('/api/events/1') -> http://localhost:8080/events/1
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
