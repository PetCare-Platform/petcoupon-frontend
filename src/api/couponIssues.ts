import { apiGet, apiPost } from "./http";
import type {
  CouponIssueCancelRequest,
  CouponIssueCreateResponse,
  CouponIssueDetailResponse,
  CouponIssueRequestResponse,
  CouponIssueRequestStatusResponse,
  CouponIssueUseRequest,
} from "../types/api";

/** POST /coupons/{couponId}/issues — 1차, 구현됨 (응답 status는 항상 "WAITING", couponIssueId는 아직 없음, 타입 주석 참고) */
export function applyForCoupon(
  couponId: number,
  userId: number,
  idempotencyKey: string,
): Promise<CouponIssueCreateResponse> {
  return apiPost<CouponIssueCreateResponse>(
    `/coupons/${couponId}/issues`,
    { userId },
    { "Idempotency-Key": idempotencyKey },
  );
}

export function getCouponIssueRequestStatus(userId: number, idempotencyKey: string, signal?: AbortSignal): Promise<CouponIssueRequestStatusResponse> {
  return apiGet<CouponIssueRequestStatusResponse>(`/users/${userId}/coupon-issue-requests/status?idempotencyKey=${encodeURIComponent(idempotencyKey)}`, signal);
}

/** GET /users/{userId}/coupon-issue-requests — 1차, 구현됨. status 쿼리 필터는 백엔드 미구현이라 보내지 않는다 */
export function listUserCouponIssues(
  userId: number,
  signal?: AbortSignal,
): Promise<CouponIssueRequestResponse[]> {
  return apiGet<CouponIssueRequestResponse[]>(`/users/${userId}/coupon-issue-requests`, signal);
}

/** GET /coupon-issues/{couponIssueId} — 1차, 구현됨 */
export function getCouponIssueDetail(
  couponIssueId: number,
  signal?: AbortSignal,
): Promise<CouponIssueDetailResponse> {
  return apiGet<CouponIssueDetailResponse>(`/coupon-issues/${couponIssueId}`, signal);
}

// GET /coupon-issues/{couponIssueId}/status 는 status만 준다. getCouponIssueDetail이
// 그걸 포함해 더 많은 정보를 한 번에 주므로, 이 경량 버전을 쓰는 화면이 없어 함수를 두지 않는다.

/** POST /coupon-issues/{couponIssueId}/use — 1차, 구현됨. 응답 result 는 항상 null */
export function useCouponIssue(couponIssueId: number, body: CouponIssueUseRequest): Promise<null> {
  return apiPost<null>(`/coupon-issues/${couponIssueId}/use`, body);
}

/** POST /coupon-issues/{couponIssueId}/cancel — 1차, 구현됨. 응답 result 는 항상 null */
export function cancelCouponIssue(couponIssueId: number, body: CouponIssueCancelRequest): Promise<null> {
  return apiPost<null>(`/coupon-issues/${couponIssueId}/cancel`, body);
}
