import { apiPost } from "./http";
import type { CouponResetRequest, CouponResetResponse } from "../types/api";

/**
 * POST /internal/coupons/{couponId}/reset — 1차, 구현됨.
 * 부하 테스트 전용, 백엔드가 @Profile("!prod")로 prod에는 등록되지 않는다.
 */
export function resetLoadTestStock(couponId: number, body: CouponResetRequest = {}): Promise<CouponResetResponse> {
  return apiPost<CouponResetResponse>(`/internal/coupons/${couponId}/reset`, body);
}

// 최신 reset API가 DB 정리와 Redis 발급 상태 초기화를 함께 수행하고 redisStock을 반환한다.
