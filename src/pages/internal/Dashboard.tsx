import { useCallback, useEffect, useState } from "react";
import { ArrowClockwise } from "@phosphor-icons/react";
import { Layout } from "../../components/Layout";
import { Eyebrow, StatusPill } from "../../components/ui";
import { SummaryCards } from "../../components/dashboard/SummaryCards";
import { ReconciliationPanel } from "../../components/dashboard/ReconciliationPanel";
import { ReconciliationLauncher } from "../../components/dashboard/ReconciliationLauncher";
import { LoadTestChart } from "../../components/dashboard/LoadTestChart";
import { FailureTable } from "../../components/dashboard/FailureTable";
import { listDlqMessages, triggerReconciliation } from "../../api/adminOperations";
import { getCoupons } from "../../api/coupons";
import {
  getDashboardSummary,
  getIssueStatistics,
  getIssueTimeSeries,
  getPipelineDrainStatus,
  getReconciliationReports,
  getSystemHealth,
} from "../../api/dashboard";
import { ApiError, NetworkError } from "../../api/http";
import type {
  CouponIssueDlqPageResponse,
  CouponIssueTimeSeriesResponse,
  CouponListResponse,
  CouponPipelineDrainStatusResponse,
  ReconciliationTriggerResponse,
  DashboardSummaryResponse,
  IssueStatisticsResponse,
  ReconciliationReportSummaryResponse,
  SystemHealthResponse,
} from "../../types/api";

const message = (error: unknown) =>
  error instanceof ApiError || error instanceof NetworkError ? error.message : "대시보드 데이터를 불러오지 못했습니다.";

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [statistics, setStatistics] = useState<IssueStatisticsResponse | null>(null);
  const [dlq, setDlq] = useState<CouponIssueDlqPageResponse | null>(null);
  const [health, setHealth] = useState<SystemHealthResponse | null>(null);
  const [coupons, setCoupons] = useState<CouponListResponse[]>([]);
  const [couponId, setCouponId] = useState<number | null>(null);
  const [reports, setReports] = useState<ReconciliationReportSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsRefreshKey, setReportsRefreshKey] = useState(0);
  const [error, setError] = useState("");
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  // 선택한 쿠폰 기준 블록들 — 쿠폰이 바뀌면 함께 다시 읽는다.
  const [drain, setDrain] = useState<CouponPipelineDrainStatusResponse | null>(null);
  const [series, setSeries] = useState<CouponIssueTimeSeriesResponse | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [reconResult, setReconResult] = useState<ReconciliationTriggerResponse | null>(null);
  const [reconRunning, setReconRunning] = useState(false);
  const [reconError, setReconError] = useState("");

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    const results = await Promise.allSettled([
      getDashboardSummary(signal),
      getIssueStatistics(signal),
      listDlqMessages(0, 10, signal),
      getSystemHealth(signal),
      getCoupons({}, 0, 100, signal),
    ]);
    if (signal?.aborted) return;
    const [a, b, c, d, e] = results;
    if (a.status === "fulfilled") setSummary(a.value);
    if (b.status === "fulfilled") setStatistics(b.value);
    if (c.status === "fulfilled") setDlq(c.value);
    if (d.status === "fulfilled") setHealth(d.value);
    if (e.status === "fulfilled") {
      setCoupons(e.value.content);
      setCouponId((current) => current ?? e.value.content[0]?.couponId ?? null);
    }
    const failed = results.find((v) => v.status === "rejected");
    if (failed?.status === "rejected") setError(message(failed.reason));
    setCheckedAt(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  // 검증 결과는 쿠폰이 바뀔 때만 비운다. 아래 조회 effect는 reportsRefreshKey에도
  // 반응하는데, 그 값은 검증 성공 직후에도 올라가서 방금 받은 결과를 지워버린다.
  useEffect(() => {
    setReconResult(null);
    setReconError("");
  }, [couponId]);

  // 파이프라인 소진 상태와 시계열은 선택한 쿠폰 기준이다.
  useEffect(() => {
    if (couponId === null) {
      setDrain(null);
      setSeries(null);
      return;
    }
    const controller = new AbortController();
    setCouponLoading(true);
    Promise.allSettled([
      getPipelineDrainStatus(couponId, controller.signal),
      getIssueTimeSeries(couponId, 90, 5, controller.signal),
    ]).then(([d, t]) => {
      if (controller.signal.aborted) return;
      setDrain(d.status === "fulfilled" ? d.value : null);
      setSeries(t.status === "fulfilled" ? t.value : null);
      setCouponLoading(false);
    });
    return () => controller.abort();
  }, [couponId, reportsRefreshKey]);

  useEffect(() => {
    if (couponId === null) {
      setReports([]);
      return;
    }
    const controller = new AbortController();
    setReportsLoading(true);
    getReconciliationReports(couponId, 30, controller.signal)
      .then(setReports)
      .catch((e) => {
        if (!(e instanceof DOMException && e.name === "AbortError")) setError(message(e));
      })
      .finally(() => {
        if (!controller.signal.aborted) setReportsLoading(false);
      });
    return () => controller.abort();
  }, [couponId, reportsRefreshKey]);

  async function runReconciliation() {
    if (couponId === null || reconRunning) return;
    setReconRunning(true);
    setReconError("");
    try {
      setReconResult(await triggerReconciliation(couponId));
      // 검증이 끝나면 이력과 파이프라인 상태를 다시 읽는다.
      setReportsRefreshKey((key) => key + 1);
    } catch (err) {
      setReconError(message(err));
    } finally {
      setReconRunning(false);
    }
  }

  return (
    <Layout area="internal">
      <section className="py-8">
        <div className="container-page flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>내부 운영 · 실제 운영 API</Eyebrow>
            <div className="mt-1 flex flex-wrap items-center gap-2.5">
              <h1>쿠폰 발급 운영 대시보드</h1>
              {/* 헬스체크 블록을 대체한다. 자세한 내용은 /internal/health가 보여준다. */}
              {health ? (
                <StatusPill tone={health.overallStatus === "UP" ? "open" : "danger"}>
                  {health.overallStatus === "UP" ? "시스템 정상" : `시스템 ${health.overallStatus}`}
                </StatusPill>
              ) : null}
            </div>
            <p className="mt-1 text-[14px] text-ink/70 dark:text-ops-muted">
              발급 처리량과 실패, 정합성, 시스템 상태를 한 화면에서 확인합니다.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {checkedAt ? (
              <span className="text-xs text-ink/50 dark:text-ops-muted">
                마지막 확인 {checkedAt.toLocaleTimeString("ko-KR", { hour12: false })}
              </span>
            ) : null}
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                void load();
                setReportsRefreshKey((key) => key + 1);
              }}
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-ink bg-paper px-4 text-[14px] font-medium text-ink disabled:opacity-50 dark:border-ops-ink dark:bg-ops-bg dark:text-ops-ink"
            >
              <ArrowClockwise className={loading ? "animate-spin" : ""} /> 새로고침
            </button>
          </div>
        </div>
      </section>

      {error ? (
        <section className="pb-4">
          <div className="container-page">
            <div className="rounded-control border border-danger/40 bg-danger/10 p-4 text-danger">
              {error} 관리자 인증 세션과 백엔드 실행 상태를 확인해 주세요.
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-4">
        <SummaryCards statistics={statistics} health={health} latest={reports[0]} />
      </section>

      <section className="py-4">
        <div className="container-page grid gap-4 lg:grid-cols-[4fr_6fr]">
          <ReconciliationLauncher
            drain={drain}
            loading={couponLoading}
            running={reconRunning}
            result={reconResult}
            error={reconError}
            onRun={runReconciliation}
          />
          <LoadTestChart series={series} loading={couponLoading} />
        </div>
      </section>

      <section className="py-4 pb-8">
        <div className="container-page grid gap-4 lg:grid-cols-[1.25fr_1fr]">
          <ReconciliationPanel
            coupons={coupons}
            couponId={couponId}
            onCouponChange={setCouponId}
            reports={reports}
            reportsLoading={reportsLoading}
          />
          <FailureTable dlq={dlq} loading={loading} />
        </div>
      </section>
    </Layout>
  );
}
