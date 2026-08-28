import { apiGet } from "./http";
import type {
  CouponFailureReasonResponse,
  CouponIssueTimeSeriesResponse,
  CouponLoadTestStatusResponse,
  CouponPipelineDrainStatusResponse,
  DashboardSummaryResponse,
  IssueStatisticsResponse,
  ReconciliationReportSummaryResponse,
  SystemHealthResponse,
} from "../types/api";

export function getDashboardSummary(signal?: AbortSignal): Promise<DashboardSummaryResponse> {
  return apiGet<DashboardSummaryResponse>("/admin/dashboard/summary", signal);
}

export function getIssueStatistics(signal?: AbortSignal): Promise<IssueStatisticsResponse> {
  return apiGet<IssueStatisticsResponse>("/admin/coupon-issue/statistics", signal);
}

export function getReconciliationReports(
  couponId: number,
  limit = 30,
  signal?: AbortSignal,
): Promise<ReconciliationReportSummaryResponse[]> {
  return apiGet<ReconciliationReportSummaryResponse[]>(
    `/admin/coupons/${couponId}/reconciliation-reports?limit=${limit}`,
    signal,
  );
}

export function getSystemHealth(signal?: AbortSignal): Promise<SystemHealthResponse> {
  return apiGet<SystemHealthResponse>("/admin/system/health", signal);
}

/** GET /admin/coupons/{couponId}/pipeline-drain-status — 백엔드 #193 */
export function getPipelineDrainStatus(
  couponId: number,
  signal?: AbortSignal,
): Promise<CouponPipelineDrainStatusResponse> {
  return apiGet<CouponPipelineDrainStatusResponse>(`/admin/coupons/${couponId}/pipeline-drain-status`, signal);
}

/**
 * GET /admin/coupons/{couponId}/issue-timeseries — 백엔드 #198
 *
 * windowSeconds는 1~3600, bucketSeconds는 1~300만 허용된다(백엔드 @Min/@Max).
 * 부하 테스트는 수십 초~수 분이라 기본값(90초 창 · 5초 버킷)이면 소진 순간이 보인다.
 */
export function getIssueTimeSeries(
  couponId: number,
  windowSeconds = 90,
  bucketSeconds = 5,
  signal?: AbortSignal,
): Promise<CouponIssueTimeSeriesResponse> {
  return apiGet<CouponIssueTimeSeriesResponse>(
    `/admin/coupons/${couponId}/issue-timeseries?windowSeconds=${windowSeconds}&bucketSeconds=${bucketSeconds}`,
    signal,
  );
}

/** GET /admin/coupons/{couponId}/load-test-status — 백엔드 #195 */
export function getLoadTestStatus(
  couponId: number,
  signal?: AbortSignal,
): Promise<CouponLoadTestStatusResponse> {
  return apiGet<CouponLoadTestStatusResponse>(`/admin/coupons/${couponId}/load-test-status`, signal);
}

/** GET /admin/coupons/{couponId}/failure-reasons — 백엔드 #195 */
export function getFailureReasons(
  couponId: number,
  signal?: AbortSignal,
): Promise<CouponFailureReasonResponse> {
  return apiGet<CouponFailureReasonResponse>(`/admin/coupons/${couponId}/failure-reasons`, signal);
}
