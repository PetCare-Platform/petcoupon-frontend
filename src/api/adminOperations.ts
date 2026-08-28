import { ApiError, NetworkError, apiGet, apiPost } from "./http";
import type { CouponIssueDlqPageResponse, CouponIssueDlqReprocessResponse, CouponIssueDlqResponse, ReconciliationTriggerResponse } from "../types/api";

export async function listDlqMessages(page = 0, size = 20, signal?: AbortSignal): Promise<CouponIssueDlqPageResponse> {
  const result = await apiGet<CouponIssueDlqPageResponse | CouponIssueDlqResponse[]>(`/admin/coupon-issue/dlq?page=${page}&size=${size}`, signal);
  if (!Array.isArray(result)) return result;
  return { content: result, page: 0, size: result.length, totalElements: result.length, totalPages: 1, first: true, last: true };
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

/**
 * 검증 트리거 실패 문구. 백엔드 메시지를 그대로 보여주면 COUPON409-5가
 * "요청이 처리 중입니다"로만 나와서, 발급 요청이 밀린 건지 검증이 겹친 건지 구분이 안 된다.
 *
 * 이 코드는 자동 스케줄러와 겹쳤을 때(기다리면 풀림)와 배치 실행 기록이 STARTED로 굳었을 때
 * (기다려도 안 풀림) 둘 다에서 나오므로, 양쪽을 다 짚어준다.
 */
export function reconciliationErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.code === "COUPON409-5") {
    return "이미 이 쿠폰의 검증이 실행 중입니다. 자동 검증과 겹쳤다면 잠시 후 다시 시도하면 되고, 계속 같은 응답이면 이전 검증이 비정상 종료돼 실행 기록이 남은 경우입니다.";
  }
  if (error instanceof ApiError || error instanceof NetworkError) return error.message;
  return "정합성 검증을 실행하지 못했습니다.";
}
