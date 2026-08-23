import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AREA_ROUTES, type AreaKey } from "../routes";

export function Header({ area, page }: { area: AreaKey; page: string }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  return (
    <>
      <a
        href="#main-content"
        className="fixed left-2 top-1.5 z-[1000] -translate-y-[160%] rounded-full bg-ink px-4 py-2 font-medium text-paper focus:translate-y-0"
      >
        본문으로 건너뛰기
      </a>

      <header className="sticky top-0 z-[100] px-3 pt-3 md:px-5">
        <div className="mx-auto max-w-[1280px] overflow-hidden rounded-[1.5rem] border border-hairline/70 bg-paper/80 shadow-[0_8px_32px_-16px_rgba(32,29,24,0.25)] backdrop-blur-xl dark:border-white/10 dark:bg-ops-surface/70">
          <div className="flex h-14 items-center gap-5 px-4 md:px-6">
            <Link to="/" aria-label="PetCoupon 홈" className="inline-flex flex-none items-center text-[20px] font-bold tracking-tight">
              PetCoupon
            </Link>
            <span className="inline-flex min-h-6 flex-none items-center rounded-full border border-hairline bg-surface-2 px-2.5 font-mono text-[10px] tracking-wide text-ink-muted dark:border-ops-border-soft dark:bg-ops-border-soft dark:text-ops-muted">
              PROTOTYPE
            </span>

            <nav aria-label="전체 영역" className="ml-2 hidden min-w-0 items-center gap-1 md:flex">
              {Object.entries(AREA_ROUTES).map(([key, cfg]) => {
                const isCurrentArea = key === area;
                return (
                  <div key={key} className="group relative">
                    <Link
                      to={cfg.home}
                      className="flex min-h-11 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[15px] font-medium transition-colors duration-300 ease-fluid hover:bg-surface-soft group-focus-within:bg-surface-soft dark:hover:bg-ops-bg dark:group-focus-within:bg-ops-bg"
                    >
                      <span className={isCurrentArea ? "underline decoration-accent/70 underline-offset-[5px]" : ""}>{cfg.label}</span>
                      <span aria-hidden="true" className="text-[10px] text-ink/50 transition-transform duration-300 ease-fluid group-hover:rotate-180 group-focus-within:rotate-180 dark:text-ops-muted">
                        ▾
                      </span>
                    </Link>
                    <div className="absolute left-0 top-full z-20 hidden pt-1.5 group-hover:block group-focus-within:block">
                      <div className="min-w-[172px] rounded-2xl border border-hairline bg-paper/95 p-1.5 shadow-[0_16px_32px_-16px_rgba(32,29,24,0.3)] backdrop-blur-xl dark:border-ops-border dark:bg-ops-surface/95">
                        {cfg.routes.map((route) => {
                          const isCurrentPage = isCurrentArea && page === route.page;
                          return (
                            <Link
                              key={route.path}
                              to={route.path}
                              className={`block rounded-xl px-3 py-2 text-[15px] font-medium transition-colors duration-300 ease-fluid ${
                                isCurrentPage
                                  ? "bg-accent text-ink dark:bg-ops-ink dark:text-ops-bg"
                                  : "text-ink hover:bg-surface-soft dark:text-ops-ink dark:hover:bg-ops-bg"
                              }`}
                            >
                              {route.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </nav>

            <button
              type="button"
              aria-controls="site-navigation"
              aria-expanded={open}
              aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
              onClick={() => setOpen((v) => !v)}
              className="relative ml-auto flex h-11 w-11 flex-none items-center justify-center rounded-full bg-surface-soft transition-colors duration-300 ease-fluid dark:bg-ops-bg md:hidden"
            >
              <span
                aria-hidden="true"
                className={`absolute h-[1.5px] w-4 bg-ink transition-all duration-300 ease-fluid dark:bg-ops-ink ${
                  open ? "translate-y-0 rotate-45" : "-translate-y-[3px] rotate-0"
                }`}
              />
              <span
                aria-hidden="true"
                className={`absolute h-[1.5px] w-4 bg-ink transition-all duration-300 ease-fluid dark:bg-ops-ink ${
                  open ? "translate-y-0 -rotate-45" : "translate-y-[3px] rotate-0"
                }`}
              />
            </button>
          </div>

          <nav
            aria-label={`${AREA_ROUTES[area].label} 메뉴`}
            className="flex min-h-12 items-center gap-1.5 overflow-x-auto border-t border-hairline-soft px-4 dark:border-ops-border-soft md:px-6"
          >
            {AREA_ROUTES[area].routes.map((route) => (
              <NavLink
                key={route.path}
                to={route.path}
                end
                className={({ isActive }) =>
                  `inline-flex min-h-9 flex-none items-center whitespace-nowrap rounded-full px-3 text-[15px] font-medium transition-colors duration-300 ease-fluid ${
                    isActive
                      ? "bg-accent text-ink dark:bg-ops-ink dark:text-ops-bg"
                      : "text-ink hover:bg-surface-soft dark:text-ops-ink dark:hover:bg-ops-surface"
                  }`
                }
              >
                {route.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <div
        id="site-navigation"
        className={`fixed inset-0 z-[90] bg-canvas/95 backdrop-blur-2xl transition-opacity duration-500 ease-fluid dark:bg-ops-bg/95 md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex h-full flex-col gap-5 overflow-y-auto px-6 pb-8 pt-32">
          {Object.entries(AREA_ROUTES).map(([key, cfg], groupIndex) => (
            <div key={key} className="border-b border-hairline-soft pb-5 dark:border-ops-border-soft">
              <p
                className={`text-[20px] font-semibold transition-all duration-500 ease-fluid ${key === area ? "text-accent-ink dark:text-ops-accent" : ""} ${
                  open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                }`}
                style={{ transitionDelay: open ? `${groupIndex * 60}ms` : "0ms" }}
              >
                {cfg.label}
              </p>
              <div className="mt-2 flex flex-col gap-0.5">
                {cfg.routes.map((route, i) => {
                  const isCurrentPage = key === area && page === route.page;
                  return (
                    <NavLink
                      key={route.path}
                      to={route.path}
                      onClick={() => setOpen(false)}
                      className={`flex min-h-11 items-center rounded-xl px-3 text-[17px] font-medium transition-all duration-500 ease-fluid ${
                        isCurrentPage ? "bg-accent text-ink dark:bg-ops-ink dark:text-ops-bg" : "text-ink/80 dark:text-ops-muted"
                      } ${open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
                      style={{ transitionDelay: open ? `${groupIndex * 60 + (i + 1) * 40}ms` : "0ms" }}
                    >
                      {route.label}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
