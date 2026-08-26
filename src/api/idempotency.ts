/**
 * 선착순 쿠폰 신청의 Idempotency-Key 생성·재사용.
 *
 * 백엔드(IdempotencyKeyServiceImpl)는 같은 키로 재시도하면 최초 결과를 그대로
 * replay 한다. 따라서 "같은 논리적 요청"인 동안은 같은 키를 재사용해야 하고,
 * 재시도할 때마다 새 키를 발급하면 안 된다. 요청이 최종 상태(성공 응답을 받음)
 * 에 도달하면 키를 지워 다음 신청 때 새 키를 쓰게 한다.
 */
const STORAGE_PREFIX = "petcoupon.idemKey.";

function storageKey(couponId: number, userId: number): string {
  return `${STORAGE_PREFIX}${couponId}.${userId}`;
}

export function getOrCreateIdempotencyKey(couponId: number, userId: number): string {
  const key = storageKey(couponId, userId);
  const existing = window.sessionStorage.getItem(key);
  if (existing) return existing;
  const fresh = crypto.randomUUID();
  window.sessionStorage.setItem(key, fresh);
  return fresh;
}

export function clearIdempotencyKey(couponId: number, userId: number): void {
  window.sessionStorage.removeItem(storageKey(couponId, userId));
}
