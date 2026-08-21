import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AREA_ROUTES, type AreaKey } from "../routes";

export function Header({ area, page }: { area: AreaKey; page: string }) {
  const [open, setOpen] = useState(false);
  const config = AREA_ROUTES[area];

  return (
    <>
      <a
        href="#main-content"
        className="fixed left-2 top-1.5 z-[1000] -translate-y-[160%] rounded-full bg-ink px-4 py-2 font-medium text-paper focus:translate-y-0"
      >
        본문으로 건너뛰기
      </a>

      <header className="sticky top-0 z-[100] h-14 border-b border-hairline bg-paper dark:border-ops-border dark:bg-ops-bg">
        <div className="mx-auto flex h-full max-w-[1280px] items-center gap-5 px-6 md:px-10">
          <Link to="/" aria-label="PetCoupon 홈" className="inline-flex flex-none items-center text-[22px] font-bold tracking-tight">
            PetCoupon
          </Link>
          <span className="inline-flex min-h-6 flex-none items-center rounded-full bg-lime px-2.5 font-mono text-[10px] tracking-wide text-[#0f172a] dark:bg-lime">
            PROTOTYPE
          </span>

          <nav aria-label="전체 영역" className="ml-2 hidden min-w-0 items-center gap-1 md:flex">
            {Object.entries(AREA_ROUTES).map(([key, cfg]) => (
              <NavLink
                key={key}
                to={cfg.home}
                className={({ isActive }) =>
                  `inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-2.5 text-[16px] font-medium transition-colors hover:bg-surface-soft dark:hover:bg-ops-surface ${
                    isActive ? "underline underline-offset-[5px]" : ""
                  }`
                }
              >
                {cfg.label}
              </NavLink>
            ))}
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

        {open ? (
          <div
            id="site-navigation"
            className="fixed inset-x-0 top-14 bottom-0 z-[110] flex flex-col gap-0 overflow-y-auto bg-paper px-6 py-4 dark:bg-ops-bg md:hidden"
          >
            {Object.entries(AREA_ROUTES).map(([key, cfg]) => (
              <NavLink
                key={key}
                to={cfg.home}
                onClick={() => setOpen(false)}
                className="flex min-h-[52px] w-full items-center border-b border-hairline-soft text-[22px] font-semibold dark:border-ops-border-soft"
              >
                {cfg.label}
              </NavLink>
            ))}
          </div>
        ) : null}
      </header>

      <nav
        aria-label={`${config.label} 메뉴`}
        className="sticky top-14 z-[90] flex min-h-12 items-center gap-1.5 overflow-x-auto border-b border-hairline bg-paper px-6 dark:border-ops-border dark:bg-ops-bg md:px-10"
      >
        {config.routes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            end
            className={({ isActive }) =>
              `inline-flex min-h-9 flex-none items-center whitespace-nowrap rounded-full px-3 text-[15px] font-medium transition-colors ${
                isActive
                  ? "bg-ink text-paper dark:bg-ops-ink dark:text-ops-bg"
                  : "text-ink hover:bg-surface-soft dark:text-ops-ink dark:hover:bg-ops-surface"
              }`
            }
          >
            {route.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
