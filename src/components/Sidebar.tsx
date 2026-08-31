import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ArrowLeft, CaretDown, PawPrint } from "@phosphor-icons/react";
import { AREA_ROUTES, type AreaKey } from "../routes";

/**
 * 운영 화면(관리자·내부 운영) 전용 세로 내비.
 *
 * 공개·사용자 영역은 여기에 노출하지 않는다. 운영자는 서비스 화면을 거쳐 들어오지
 * 않고, 가로 헤더 두 줄(영역 전환 + 서브 내비)이 세로 공간을 108px씩 먹고 있었다.
 */
const STAFF_AREAS: AreaKey[] = ["admin", "internal"];

export function Sidebar({ area }: { area: AreaKey }) {
  // 하위 메뉴는 접어 두고 눌렀을 때만 펼친다. 다만 지금 보고 있는 영역까지 접혀
  // 있으면 현재 위치를 매번 클릭해서 확인해야 해서, 그쪽만 열어 둔 채 시작한다.
  const [openAreas, setOpenAreas] = useState<AreaKey[]>([area]);

  useEffect(() => {
    setOpenAreas((prev) => (prev.includes(area) ? prev : [...prev, area]));
  }, [area]);

  function toggle(key: AreaKey) {
    setOpenAreas((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  }

  return (
    <aside
      data-ops-sidebar
      // 최소 너비는 좁은 화면에서만 낮춘다(200 → 176). 20% 비율은 그대로라 넓은 화면에서는
      // 예전과 같고, 창을 줄였을 때만 오른쪽 본문에 폭을 더 내준다.
      className="w-full flex-none bg-ink px-3 py-4 text-white md:flex md:h-screen md:w-[20%] md:min-w-[176px] md:flex-col md:overflow-y-auto md:px-4 md:py-5 xl:min-w-[200px]"
    >
      {/* 관리자 홈은 거의 들어가지 않는다 — 로고는 운영 대시보드로 보낸다. */}
      <Link to={AREA_ROUTES.internal.home} className="mb-5 hidden items-center gap-2 text-[17px] font-semibold tracking-tight md:inline-flex">
        <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-white text-ink">
          <PawPrint weight="fill" className="h-4 w-4" aria-hidden="true" />
        </span>
        <span className="truncate">PetCoupon</span>
      </Link>

      {/* 모바일에서는 세로로 쌓으면 검은 판이 화면을 다 먹는다 — 가로 스크롤로 눕힌다. */}
      <nav aria-label="운영 메뉴" className="flex gap-4 overflow-x-auto md:flex-col md:gap-2 md:overflow-visible">
        {STAFF_AREAS.map((key) => {
          const cfg = AREA_ROUTES[key];
          const isOpen = openAreas.includes(key);
          return (
            <div key={key} className="flex-none md:flex-auto">
              <button
                type="button"
                onClick={() => toggle(key)}
                aria-expanded={isOpen}
                aria-controls={`ops-nav-${key}`}
                className={`flex min-h-9 w-full items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 text-base font-semibold transition-colors duration-150 hover:bg-white/10 ${
                  key === area ? "text-white" : "text-white/55"
                }`}
              >
                {cfg.label}
                <CaretDown
                  weight="bold"
                  aria-hidden="true"
                  className={`h-3.5 w-3.5 flex-none transition-transform duration-200 md:ml-auto ${isOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isOpen ? (
                <div id={`ops-nav-${key}`} className="mt-0.5 flex gap-1 md:flex-col md:gap-0.5">
                  {cfg.routes.map((route) => (
                    <NavLink
                      key={route.path}
                      to={route.path}
                      end
                      className="flex min-h-9 flex-none items-center whitespace-nowrap rounded-md px-2.5 text-[14px] font-medium text-white/70 transition-colors duration-150 hover:bg-white/10 hover:text-white md:pl-4"
                    >
                      {route.label}
                    </NavLink>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      {/* 운영 화면에서 서비스 쪽으로 빠져나가는 유일한 출구 — 사이드바 맨 아래에 둔다. */}
      <Link
        to="/"
        className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-md px-2.5 text-[14px] font-medium text-white/60 transition-colors duration-150 hover:bg-white/10 hover:text-white md:mt-auto"
      >
        <ArrowLeft weight="bold" className="h-4 w-4 flex-none" aria-hidden="true" />
        사용자 화면으로
      </Link>
    </aside>
  );
}
