import { useEffect } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import type { AreaKey } from "../routes";

export function Layout({ area, page, children }: { area: AreaKey; page: string; children: ReactNode }) {
  // 관리자·내부 운영은 Geist(Vercel) 디자인 언어를 쓴다. 밝은 테마라 내부 운영의
  // 기존 다크(.dark)는 함께 걷힌다 — 공개·사용자 영역은 그대로다.
  const geist = area === "admin" || area === "internal";
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView();
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname, location.hash]);

  return (
    <div className={geist ? "theme-geist" : undefined}>
      <div className="min-h-screen overflow-x-hidden bg-canvas text-ink dark:bg-ops-bg dark:text-ops-ink dark:font-ops-sans">
        <Header area={area} page={page} />
        <main key={location.pathname} id="main-content" tabIndex={-1} className="w-full max-w-full animate-reveal-up overflow-x-hidden">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
