/**
 * 인증 시스템이 아직 없음(범위 밖 — 관리자 코드 인증 API는 삭제 확정).
 * userId 를 화면마다 하드코딩하는 대신 이 함수 하나로 모은다.
 * 실제 로그인이 붙으면 이 파일만 교체하면 된다.
 */
const DEMO_USER_ID_KEY = "petcoupon.demoUserId";
const DEFAULT_DEMO_USER_ID = 1;

export function getCurrentUserId(): number {
  const stored = window.localStorage.getItem(DEMO_USER_ID_KEY);
  const parsed = stored ? Number(stored) : NaN;
  if (Number.isInteger(parsed) && parsed > 0) return parsed;
  window.localStorage.setItem(DEMO_USER_ID_KEY, String(DEFAULT_DEMO_USER_ID));
  return DEFAULT_DEMO_USER_ID;
}
