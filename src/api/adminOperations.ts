import { apiGet, apiPost } from "./http";
import type { CouponIssueDlqReprocessResponse, CouponIssueDlqResponse, ReconciliationTriggerResponse } from "../types/api";

export function listDlqMessages(signal?: AbortSignal): Promise<CouponIssueDlqResponse[]> {
  return apiGet<CouponIssueDlqResponse[]>("/admin/coupon-issue/dlq", signal);
}

export function reprocessDlqMessage(messageId: number): Promise<CouponIssueDlqReprocessResponse> {
  return apiPost<CouponIssueDlqReprocessResponse>(`/admin/coupon-issue/dlq/${messageId}/reprocess`);
}

// POST /admin/coupon-issue/dlq/{messageId}/abandon(재시도 포기) 은 의도적으로 두지 않는다.
// 되돌릴 수 없는 작업이라 운영 정책상 지금은 허용하지 않기로 했다 — 필요해지면 재처리와
// 같은 패턴으로 추가한다.

export function triggerReconciliation(couponId: number): Promise<ReconciliationTriggerResponse> {
  return apiPost<ReconciliationTriggerResponse>(`/admin/coupons/${couponId}/reconcile`);
}
