import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AREA_ROUTES, type AreaKey } from "../routes";

export function Header({ area, page }: { area: AreaKey; page: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <a
        href="#main-content"
        className="fixed left-2 top-1.5 z-[1000] -translate-y-[160%] rounded-full bg-ink px-4 py-2 font-medium text-paper focus:translate-y-0"
      >
        본문으로 건너뛰기
      </a>

      <header className="sticky top-0 z-[100] min-h-14 border-b border-hairline bg-canvas dark:border-ops-border dark:bg-ops-bg">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-5 px-6 md:px-10">
          <Link to="/" aria-label="PetCoupon 홈" className="inline-flex flex-none items-center text-[22px] font-bold tracking-tight">
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
                    className="flex min-h-11 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[16px] font-medium transition-colors hover:bg-surface-soft group-focus-within:bg-surface-soft dark:hover:bg-ops-surface dark:group-focus-within:bg-ops-surface"
                  >
                    <span className={isCurrentArea ? "underline underline-offset-[5px]" : ""}>{cfg.label}</span>
                    <span aria-hidden="true" className="text-[10px] text-ink/50 transition-transform group-hover:rotate-180 group-focus-within:rotate-180 dark:text-ops-muted">
                      ▾
                    </span>
                  </Link>
                  <div className="absolute left-0 top-full z-20 hidden pt-1.5 group-hover:block group-focus-within:block">
                    <div className="min-w-[172px] rounded-control border border-hairline bg-paper p-1.5 shadow-[0_16px_32px_-16px_rgba(0,0,0,0.22)] dark:border-ops-border dark:bg-ops-surface">
                      {cfg.routes.map((route) => {
                        const isCurrentPage = isCurrentArea && page === route.page;
                        return (
                          <Link
                            key={route.path}
                            to={route.path}
                            className={`block rounded-control px-3 py-2 text-[15px] font-medium transition-colors ${
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
            className="ml-auto flex h-11 w-11 flex-none items-center justify-center rounded-full bg-surface-soft dark:bg-ops-surface md:hidden"
          >
            메뉴
          </button>
        </div>

        <nav aria-label="전체 영역" className="flex items-center gap-1 overflow-x-auto px-6 pb-2.5 md:hidden">
          {Object.entries(AREA_ROUTES).map(([key, cfg]) => {
            const isCurrentArea = key === area;
            return (
              <Link
                key={key}
                to={cfg.home}
                className={`inline-flex min-h-9 flex-none items-center whitespace-nowrap rounded-full px-3 text-[15px] font-medium transition-colors ${
                  isCurrentArea ? "bg-accent text-ink" : "text-ink hover:bg-surface-soft dark:text-ops-ink dark:hover:bg-ops-surface"
                }`}
              >
                {cfg.label}
              </Link>
            );
          })}
        </nav>

        <nav
          aria-label={`${AREA_ROUTES[area].label} 메뉴`}
          className="flex min-h-12 items-center gap-1.5 overflow-x-auto border-t border-hairline-soft px-6 dark:border-ops-border-soft md:px-10"
        >
          {AREA_ROUTES[area].routes.map((route) => (
            <NavLink
              key={route.path}
              to={route.path}
              end
              className={({ isActive }) =>
                `inline-flex min-h-9 flex-none items-center whitespace-nowrap rounded-full px-3 text-[15px] font-medium transition-colors ${
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

        {open ? (
          <div
            id="site-navigation"
            className="fixed inset-x-0 top-[150px] bottom-0 z-[110] flex flex-col gap-5 overflow-y-auto bg-canvas px-6 py-5 dark:bg-ops-bg md:hidden"
          >
            {Object.entries(AREA_ROUTES).map(([key, cfg]) => (
              <div key={key} className="border-b border-hairline-soft pb-5 dark:border-ops-border-soft">
                <p className={`text-[20px] font-semibold ${key === area ? "text-accent" : ""}`}>{cfg.label}</p>
                <div className="mt-2 flex flex-col gap-0.5">
                  {cfg.routes.map((route) => {
                    const isCurrentPage = key === area && page === route.page;
                    return (
                      <NavLink
                        key={route.path}
                        to={route.path}
                        onClick={() => setOpen(false)}
                        className={`flex min-h-11 items-center rounded-control px-3 text-[17px] font-medium ${
                          isCurrentPage ? "bg-accent text-ink dark:bg-ops-ink dark:text-ops-bg" : "text-ink/80 dark:text-ops-muted"
                        }`}
                      >
                        {route.label}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </header>
    </>
  );
}
