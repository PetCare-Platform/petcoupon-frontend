import { apiGet, apiPost } from "./http";
import type { CouponIssueDlqReprocessResponse, CouponIssueDlqResponse, ReconciliationTriggerResponse } from "../types/api";

export function listDlqMessages(signal?: AbortSignal): Promise<CouponIssueDlqResponse[]> {
  return apiGet<CouponIssueDlqResponse[]>("/admin/coupon-issue/dlq", signal);
}

export function reprocessDlqMessage(messageId: number): Promise<CouponIssueDlqReprocessResponse> {
  return apiPost<CouponIssueDlqReprocessResponse>(`/admin/coupon-issue/dlq/${messageId}/reprocess`);
}

export function triggerReconciliation(couponId: number): Promise<ReconciliationTriggerResponse> {
  return apiPost<ReconciliationTriggerResponse>(`/admin/coupons/${couponId}/reconcile`);
}
