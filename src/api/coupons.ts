import { apiGet, apiPatch, apiPost } from "./http";
import type {
  CouponCreateRequest,
  CouponCreateResponse,
  CouponPageResponse,
  CouponRealtimeStatusResponse,
  CouponStatus,
  CouponUpdateRequest,
  CouponUpdateResponse,
} from "../types/api";

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

/**
 * GET /admin/coupons — 쿠폰 전체 목록. eventId·status는 둘 다 선택 필터라 생략하면 전체 조회다.
 * 이벤트 하위가 아니라 최상위 경로인 이유는 백엔드 주석과 같다 — 이벤트를 몰라도 쿠폰을 찾을 수 있어야 해서다.
 * 재고 수치는 DB(coupon_stock) 기준이라 실시간 값과 다를 수 있다 — CouponListResponse 주석 참고.
 */
export function getCoupons(
  filter: { eventId?: number; status?: CouponStatus } = {},
  page = 0,
  size = 20,
  signal?: AbortSignal,
): Promise<CouponPageResponse> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (filter.eventId !== undefined) params.set("eventId", String(filter.eventId));
  if (filter.status !== undefined) params.set("status", filter.status);
  return apiGet<CouponPageResponse>(`/admin/coupons?${params.toString()}`, signal);
}

// 단건 조회(GET /admin/coupons/{id}) API는 아직 없다 — 수정 폼 초기값은 목록에서 가져온다.
