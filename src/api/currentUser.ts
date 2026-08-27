/**
 * 인증 시스템이 아직 없음(범위 밖 — 로그인/회원가입/토큰은 구현하지 않는다).
 * 프론트에 저장된 userId 하나를 "사용자 식별 컨텍스트"로만 사용한다.
 *
 * 예전에는 저장된 값이 없으면 자동으로 1번 사용자를 저장했지만(데모 편의),
 * 그 동작은 제거했다. 이제 미설정은 미설정 그대로 유지되고, 각 화면이
 * getCurrentUserId() === null 을 직접 처리한다.
 */
const DEMO_USER_ID_KEY = "petcoupon.demoUserId";

type Listener = () => void;
const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) listener();
}

/** userId 변경(설정/해제)을 구독한다. 헤더의 "사용자 ID" 표시를 즉시 갱신하는 용도. */
export function subscribeCurrentUserId(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** 저장된 userId. 없거나 형식이 잘못됐으면 null. 더 이상 기본값을 만들어 저장하지 않는다. */
export function getCurrentUserId(): number | null {
  const stored = window.localStorage.getItem(DEMO_USER_ID_KEY);
  const parsed = stored ? Number(stored) : NaN;
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function setCurrentUserId(userId: number): void {
  if (!Number.isInteger(userId) || userId <= 0) return;
  window.localStorage.setItem(DEMO_USER_ID_KEY, String(userId));
  emit();
}

export function clearCurrentUserId(): void {
  window.localStorage.removeItem(DEMO_USER_ID_KEY);
  emit();
}
