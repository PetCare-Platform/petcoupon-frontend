import { apiPost } from "./http";
import type { CouponCreateRequest, CouponCreateResponse } from "../types/api";

/** POST /admin/events/{eventId}/coupons — 1차, 구현됨 */
export function createCoupon(eventId: number, body: CouponCreateRequest): Promise<CouponCreateResponse> {
  return apiPost<CouponCreateResponse>(`/admin/events/${eventId}/coupons`, body);
}

/**
 * 쿠폰 재고 조회(GET /admin/coupons/{id}/stock)와 쿠폰 실시간 요청 현황 조회
 * (GET /coupons/{id}/status)는 1차 범위지만 실제 백엔드에 컨트롤러가 없다
 * (2026-08-25 조사 기준). 없는 API를 있는 것처럼 호출하지 않기 위해 의도적으로
 * 함수를 만들지 않았다 — 백엔드 추가 후 이 파일에 이어서 구현한다.
 */
