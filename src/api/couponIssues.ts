import { apiGet, apiPost } from "./http";
import type {
  CouponIssueCancelRequest,
  CouponIssueCreateResponse,
  CouponIssueDetailResponse,
  CouponIssueRequestResponse,
  CouponIssueStatusResponse,
  CouponIssueUseRequest,
} from "../types/api";

/** POST /coupons/{couponId}/issues — 1차, 구현됨 (응답에 status/couponIssueId 없음, 타입 주석 참고) */
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

/** GET /coupon-issues/{couponIssueId}/status — 1차, 구현됨 */
export function getCouponIssueStatus(
  couponIssueId: number,
  signal?: AbortSignal,
): Promise<CouponIssueStatusResponse> {
  return apiGet<CouponIssueStatusResponse>(`/coupon-issues/${couponIssueId}/status`, signal);
}

/** POST /coupon-issues/{couponIssueId}/use — 1차, 구현됨. 응답 result 는 항상 null */
export function useCouponIssue(couponIssueId: number, body: CouponIssueUseRequest): Promise<null> {
  return apiPost<null>(`/coupon-issues/${couponIssueId}/use`, body);
}

/** POST /coupon-issues/{couponIssueId}/cancel — 1차, 구현됨. 응답 result 는 항상 null */
export function cancelCouponIssue(couponIssueId: number, body: CouponIssueCancelRequest): Promise<null> {
  return apiPost<null>(`/coupon-issues/${couponIssueId}/cancel`, body);
}
