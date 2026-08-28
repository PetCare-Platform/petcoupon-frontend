import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { PawPrint, UserCircle } from "@phosphor-icons/react";
import { getCurrentUserId, subscribeCurrentUserId } from "../api/currentUser";
import { getAdminSessionToken } from "../api/adminSession";
import { deleteAdminSession } from "../api/adminAuth";

/**
 * 공개 사용자에게 노출하는 주요 메뉴.
 *
 * 관리자·내부 운영은 이 헤더를 쓰지 않는다 — Layout이 그 영역에서는 Sidebar로
 * 갈아끼우므로, 여기에 운영 메뉴 분기를 둘 필요가 없다.
 */
const PUBLIC_LINKS = [
  { label: "이벤트", path: "/" },
  { label: "내 쿠폰", path: "/user/my-coupons" },
];

function AdminEntry({
  adminActive,
  onSignOut,
  busy,
  className = "",
}: {
  adminActive: boolean;
  onSignOut: () => void;
  busy: boolean;
  className?: string;
}) {
  if (adminActive) {
    return (
      <span className={`inline-flex items-center gap-2 text-[14px] font-medium ${className}`}>
        <Link to="/admin" className="rounded-full border border-hairline px-3 py-1.5 hover:border-ink">
          관리자 콘솔
        </Link>
        <button type="button" onClick={onSignOut} disabled={busy} className="rounded-full px-2 py-1.5 text-ink/60 underline underline-offset-4 hover:text-ink disabled:opacity-50">
          세션 해제
        </button>
      </span>
    );
  }
  return (
    <Link to="/admin/auth" className={`inline-flex items-center rounded-full border border-hairline px-3 py-1.5 text-[14px] font-medium hover:border-ink ${className}`}>
      관리자 로그인
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const [userId, setUserId] = useState<number | null>(() => getCurrentUserId());
  const [adminActive, setAdminActive] = useState(() => Boolean(getAdminSessionToken()));
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => subscribeCurrentUserId(() => setUserId(getCurrentUserId())), []);
  useEffect(() => {
    setUserId(getCurrentUserId());
    setAdminActive(Boolean(getAdminSessionToken()));
  }, [location.pathname]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function handleAdminSignOut() {
    setSigningOut(true);
    try {
      await deleteAdminSession();
    } catch {
      /* 서버 세션 폐기 확인에 실패해도 로컬 세션은 deleteAdminSession 내부에서 정리된다 */
    } finally {
      setAdminActive(false);
      setSigningOut(false);
      navigate("/");
    }
  }

  const userIdLabel = userId === null ? "미설정" : String(userId);

  return (
    <>
      <a
        href="#main-content"
        className="fixed left-2 top-1.5 z-[1000] -translate-y-[160%] rounded-full bg-ink px-4 py-2 font-medium text-paper focus:translate-y-0"
      >
        본문으로 건너뛰기
      </a>

      <header className="sticky top-0 z-[100] px-3 pt-3 md:px-5">
        <div className="mx-auto max-w-[1380px] rounded-[1.75rem] border border-white/80 bg-white/90 text-ink shadow-[0_18px_50px_-30px_rgba(23,36,58,0.35)] backdrop-blur-xl dark:border-ops-border dark:bg-ops-surface/90 dark:text-ops-ink">
          <div className="flex h-14 items-center gap-5 px-4 md:px-6">
            <Link to="/" aria-label="PetCoupon 홈" className="inline-flex flex-none items-center gap-2 text-[20px] font-bold tracking-tight">
              <span className="grid h-9 w-9 place-items-center rounded-2xl bg-accent text-ink">
                <PawPrint weight="fill" className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>PetCoupon</span>
            </Link>

            <nav aria-label="주요 메뉴" className="ml-2 hidden items-center gap-1 md:flex">
              {PUBLIC_LINKS.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === "/"}
                  className={({ isActive }) =>
                    `inline-flex min-h-11 items-center rounded-full px-3 text-[15px] font-medium transition-colors duration-300 ease-fluid ${
                      isActive ? "bg-accent text-ink" : "text-ink hover:bg-surface-soft"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="ml-auto hidden items-center gap-3 md:flex">
              <Link
                to="/user"
                className="inline-flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-[14px] font-medium hover:border-ink"
              >
                <UserCircle weight="bold" className="h-4 w-4 flex-none text-ink/60" aria-hidden="true" />
                사용자 ID: <span className="tabular-nums">{userIdLabel}</span>
              </Link>
              <AdminEntry adminActive={adminActive} onSignOut={handleAdminSignOut} busy={signingOut} />
            </div>

            <button
              ref={menuButtonRef}
              type="button"
              aria-controls="site-navigation"
              aria-expanded={open}
              aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
              onClick={() => setOpen((v) => !v)}
              className="relative flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-surface-soft transition-colors duration-300 ease-fluid hover:bg-accent/30 dark:bg-ops-bg md:hidden"
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
        </div>
      </header>

      <div
        id="site-navigation"
        aria-hidden={!open}
        className={`fixed inset-0 z-[90] bg-canvas/95 backdrop-blur-2xl transition-opacity duration-500 ease-fluid dark:bg-ops-bg/95 md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex h-full flex-col gap-5 overflow-y-auto px-6 pb-8 pt-32">
          <div className="flex flex-col gap-2">
            {PUBLIC_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex min-h-12 items-center rounded-xl px-3 text-[19px] font-semibold ${isActive ? "bg-accent text-ink" : "text-ink/80"}`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="mt-4 border-t border-hairline-soft pt-4">
              <Link to="/user" onClick={() => setOpen(false)} className="flex min-h-12 items-center gap-2 rounded-xl px-3 text-[17px] font-medium text-ink/80">
                <UserCircle weight="bold" className="h-5 w-5 flex-none text-ink/60" aria-hidden="true" />
                사용자 ID: <span className="tabular-nums">{userIdLabel}</span>
              </Link>
              <div className="px-3 pt-3">
                <AdminEntry adminActive={adminActive} onSignOut={handleAdminSignOut} busy={signingOut} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
