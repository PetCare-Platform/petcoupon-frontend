import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AREA_ROUTES, type AreaKey } from "../routes";

export function Layout({ area, page, children }: { area: AreaKey; page: string; children: ReactNode }) {
  const dark = AREA_ROUTES[area].dark;
  return (
    <div className={dark ? "dark" : undefined}>
      <div className="min-h-screen bg-paper text-ink dark:bg-ops-bg dark:text-ops-ink dark:font-ops-sans">
        <Header area={area} page={page} />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
