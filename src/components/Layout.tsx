import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";
import type { AreaKey } from "../routes";

export function Layout({ area, children }: { area: AreaKey; children: ReactNode }) {
  // 관리자·내부 운영은 Geist(Vercel) 디자인 언어를 쓴다. 밝은 테마라 내부 운영의
  // 기존 다크(.dark)는 함께 걷힌다 — 공개·사용자 영역은 그대로다.
  const geist = area === "admin" || area === "internal";
  const location = useLocation();
  // 운영 화면은 문서가 아니라 본문 칸이 스크롤된다 — 초기화 대상도 그쪽이다.
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (location.hash) {
      document.getElementById(location.hash.slice(1))?.scrollIntoView();
      return;
    }
    mainRef.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname, location.hash]);

  // 운영 화면은 가로 헤더 대신 검은 세로 사이드바(2 : 8)를 쓴다. 헤더 두 줄이 먹던
  // 세로 공간이 본문으로 넘어오고, 푸터의 영역 링크(서비스·사용자)도 함께 걷힌다.
  //
  // md 이상에서는 문서 스크롤을 막고(h-screen + overflow-hidden) 본문 칸만
  // 스크롤시킨다. 그래야 목록이 길어져도 왼쪽 메뉴가 밀려 올라가지 않는다.
  if (geist) {
    return (
      <div className="theme-geist">
        <div className="flex min-h-screen flex-col overflow-x-hidden bg-canvas text-ink md:h-screen md:min-h-0 md:flex-row md:overflow-hidden">
          <Sidebar area={area} />
          <main
            ref={mainRef}
            key={location.pathname}
            id="main-content"
            tabIndex={-1}
            className="min-w-0 flex-1 animate-reveal-up overflow-x-hidden md:h-screen md:overflow-y-auto"
          >
            {children}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-screen overflow-x-hidden bg-canvas text-ink dark:bg-ops-bg dark:text-ops-ink dark:font-ops-sans">
        <Header />
        <main key={location.pathname} id="main-content" tabIndex={-1} className="w-full max-w-full animate-reveal-up overflow-x-hidden">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
