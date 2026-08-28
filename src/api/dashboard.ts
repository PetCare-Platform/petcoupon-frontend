import { apiGet } from "./http";
import type {
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
