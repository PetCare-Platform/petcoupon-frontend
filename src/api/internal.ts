import { apiPost } from "./http";
import type { CouponResetRequest, CouponResetResponse } from "../types/api";

/**
 * POST /internal/coupons/{couponId}/reset — 1차, 구현됨.
 * 부하 테스트 전용, 백엔드가 @Profile("!prod")로 prod에는 등록되지 않는다.
 */
export function resetLoadTestStock(couponId: number, body: CouponResetRequest = {}): Promise<CouponResetResponse> {
  return apiPost<CouponResetResponse>(`/internal/coupons/${couponId}/reset`, body);
}

/**
 * Redis 쿠폰 재고 초기화(POST /internal/coupons/{id}/redis/init)는 1차 범위지만
 * 백엔드에 컨트롤러·DTO가 전혀 없다(2026-08-25 조사 기준). 없는 API를 있는 것처럼
 * 호출하지 않기 위해 의도적으로 함수를 만들지 않았다.
 */
