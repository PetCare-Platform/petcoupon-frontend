import { apiGet, apiPatch, apiPost } from "./http";
import type { CouponCreateRequest, CouponCreateResponse, CouponRealtimeStatusResponse, CouponUpdateRequest, CouponUpdateResponse } from "../types/api";

/** POST /admin/events/{eventId}/coupons — 1차, 구현됨 */
export function createCoupon(eventId: number, body: CouponCreateRequest): Promise<CouponCreateResponse> {
  return apiPost<CouponCreateResponse>(`/admin/events/${eventId}/coupons`, body);
}

export function updateCoupon(eventId: number, couponId: number, body: CouponUpdateRequest): Promise<CouponUpdateResponse> {
  return apiPatch<CouponUpdateResponse>(`/admin/events/${eventId}/coupons/${couponId}`, body);
}

export function getCouponRealtimeStatus(couponId: number, signal?: AbortSignal): Promise<CouponRealtimeStatusResponse> {
  return apiGet<CouponRealtimeStatusResponse>(`/coupons/${couponId}/status`, signal);
}

// 목록·단건 조회 API는 아직 없지만 실시간 재고 조회와 발급 전 부분 수정은 지원한다.
