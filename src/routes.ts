export type AreaKey = "public" | "user" | "admin" | "internal";

export interface RouteConfig {
  page: string;
  label: string;
  path: string;
}

export interface AreaConfig {
  label: string;
  home: string;
  dark?: boolean;
  routes: RouteConfig[];
}

// Single source of truth for navigation — both the global area switcher and
// each area's sub-nav are generated from this map (merged in from the
// team's structure-wireframe review: one route config drives the header
// instead of hand-duplicating nav markup per page).
export const AREA_ROUTES: Record<AreaKey, AreaConfig> = {
  public: {
    label: "서비스",
    home: "/",
    routes: [
      { page: "index", label: "이벤트", path: "/" },
      { page: "event-detail", label: "이벤트 상세", path: "/event-detail" },
    ],
  },
  user: {
    label: "사용자",
    home: "/user",
    routes: [
      { page: "user", label: "사용자 정보", path: "/user" },
      { page: "my-coupons", label: "보유 쿠폰", path: "/user/my-coupons" },
      { page: "coupon-detail", label: "쿠폰 상세", path: "/user/coupon-detail" },
    ],
  },
  admin: {
    label: "관리자",
    home: "/admin",
    routes: [
      { page: "admin", label: "관리자 홈", path: "/admin" },
      { page: "events", label: "이벤트 목록", path: "/admin/events" },
      { page: "event-form", label: "이벤트 편집", path: "/admin/event-form" },
      { page: "coupons", label: "쿠폰 목록", path: "/admin/coupons" },
      { page: "coupon-form", label: "쿠폰 편집", path: "/admin/coupon-form" },
    ],
  },
  internal: {
    label: "내부 운영",
    home: "/internal/dashboard",
    dark: true,
    routes: [
      { page: "dashboard", label: "대시보드", path: "/internal/dashboard" },
      { page: "monitoring", label: "시스템 현황", path: "/internal/monitoring" },
      { page: "issues", label: "발급 처리 흐름", path: "/internal/issues" },
      { page: "failures", label: "실패 처리", path: "/internal/failures" },
      { page: "verification", label: "정합성 검증", path: "/internal/verification" },
      { page: "repo-issues", label: "GitHub 이슈", path: "/internal/repo-issues" },
    ],
  },
};

export const GITHUB_REPO = "PetCare-Platform/petcoupon-frontend";

export function areaForPath(pathname: string): AreaKey {
  if (pathname.startsWith("/user")) return "user";
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/internal")) return "internal";
  return "public";
}
