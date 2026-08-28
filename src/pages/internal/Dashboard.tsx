import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowClockwise } from "@phosphor-icons/react";
import { Layout } from "../../components/Layout";
import { Eyebrow, StatusPill } from "../../components/ui";
import { ExpectationBar } from "../../components/dashboard/ExpectationBar";
import { SummaryCards } from "../../components/dashboard/SummaryCards";
import { IssuePipeline } from "../../components/dashboard/IssuePipeline";
import { ReconciliationLauncher } from "../../components/dashboard/ReconciliationLauncher";
import { LoadTestChart } from "../../components/dashboard/LoadTestChart";
import { FailureReasons } from "../../components/dashboard/FailureReasons";
import { triggerReconciliation } from "../../api/adminOperations";
import { getCoupons } from "../../api/coupons";
import {
  getFailureReasons,
  getIssueTimeSeries,
  getLoadTestStatus,
  getPipelineDrainStatus,
  getSystemHealth,
} from "../../api/dashboard";
import { ApiError, NetworkError } from "../../api/http";
import type {
  CouponFailureReasonResponse,
  CouponIssueTimeSeriesResponse,
  CouponListResponse,
  CouponLoadTestStatusResponse,
  CouponPipelineDrainStatusResponse,
  ReconciliationTriggerResponse,
  SystemHealthResponse,
} from "../../types/api";

const message = (error: unknown) =>
  error instanceof ApiError || error instanceof NetworkError ? error.message : "대시보드 데이터를 불러오지 못했습니다.";

export default function Dashboard() {
  const [health, setHealth] = useState<SystemHealthResponse | null>(null);
  const [coupons, setCoupons] = useState<CouponListResponse[]>([]);
  const [couponId, setCouponId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // 화면 전체가 선택한 쿠폰 하나 기준이다.
  const [status, setStatus] = useState<CouponLoadTestStatusResponse | null>(null);
  const [reasons, setReasons] = useState<CouponFailureReasonResponse | null>(null);
  const [drain, setDrain] = useState<CouponPipelineDrainStatusResponse | null>(null);
  const [series, setSeries] = useState<CouponIssueTimeSeriesResponse | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [reconResult, setReconResult] = useState<ReconciliationTriggerResponse | null>(null);
  const [reconRunning, setReconRunning] = useState(false);
  const [reconError, setReconError] = useState("");

  const loadShared = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    const [h, c] = await Promise.allSettled([getSystemHealth(signal), getCoupons({}, 0, 100, signal)]);
    if (signal?.aborted) return;
    if (h.status === "fulfilled") setHealth(h.value);
    if (c.status === "fulfilled") {
      setCoupons(c.value.content);
      setCouponId((current) => current ?? c.value.content[0]?.couponId ?? null);
    }
    const failed = [h, c].find((v) => v.status === "rejected");
    if (failed?.status === "rejected") setError(message(failed.reason));
    setCheckedAt(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadShared(controller.signal);
    return () => controller.abort();
  }, [loadShared, refreshKey]);

  // 검증 결과는 쿠폰이 바뀔 때만 비운다. 아래 조회 effect는 refreshKey에도 반응하는데,
  // 그 값은 검증 성공 직후에도 올라가서 방금 받은 결과를 지워버린다.
  useEffect(() => {
    setReconResult(null);
    setReconError("");
  }, [couponId]);

  useEffect(() => {
    if (couponId === null) {
      setStatus(null);
      setReasons(null);
      setDrain(null);
      setSeries(null);
      return;
    }
    const controller = new AbortController();
    setCouponLoading(true);
    Promise.allSettled([
      getLoadTestStatus(couponId, controller.signal),
      getFailureReasons(couponId, controller.signal),
      getPipelineDrainStatus(couponId, controller.signal),
      getIssueTimeSeries(couponId, 90, 5, controller.signal),
    ]).then(([s, f, d, t]) => {
      if (controller.signal.aborted) return;
      setStatus(s.status === "fulfilled" ? s.value : null);
      setReasons(f.status === "fulfilled" ? f.value : null);
      setDrain(d.status === "fulfilled" ? d.value : null);
      setSeries(t.status === "fulfilled" ? t.value : null);
      setCouponLoading(false);
    });
    return () => controller.abort();
  }, [couponId, refreshKey]);

  const selectedCoupon = useMemo(
    () => coupons.find((c) => c.couponId === couponId),
    [coupons, couponId],
  );

  // 이상 실패가 하나라도 있을 때만 4줄을 그린다. 정상 시연에서는 3줄로 끝난다.
  const hasAbnormalFailure =
    reasons != null && reasons.failures.kafkaPublishFailed + reasons.failures.consumeProcessingFailed > 0;

  async function runReconciliation() {
    if (couponId === null || reconRunning) return;
    setReconRunning(true);
    setReconError("");
    try {
      setReconResult(await triggerReconciliation(couponId));
      setRefreshKey((key) => key + 1);
    } catch (err) {
      setReconError(message(err));
    } finally {
      setReconRunning(false);
    }
  }

  return (
    <Layout area="internal">
      <section className="section-tight-b py-6">
        <div className="container-page flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>내부 운영 · 실제 운영 API</Eyebrow>
            <div className="mt-1 flex flex-wrap items-center gap-2.5">
              <h1>선착순 발급 대시보드</h1>
              {/* 헬스체크 블록을 대체한다. 자세한 내용은 /internal/health가 보여준다. */}
              {health ? (
                <StatusPill tone={health.overallStatus === "UP" ? "open" : "danger"}>
                  {health.overallStatus === "UP" ? "시스템 정상" : `시스템 ${health.overallStatus}`}
                </StatusPill>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={couponId ?? ""}
              onChange={(e) => setCouponId(Number(e.target.value))}
              className="min-h-9 rounded-control border border-hairline bg-paper px-3 text-[13px] text-ink"
              aria-label="대상 쿠폰"
            >
              {coupons.map((c) => (
                <option key={c.couponId} value={c.couponId}>
                  {c.name} (#{c.couponId})
                </option>
              ))}
            </select>
            {checkedAt ? (
              <span className="text-xs text-ink/50">
                마지막 확인 {checkedAt.toLocaleTimeString("ko-KR", { hour12: false })}
              </span>
            ) : null}
            <button
              type="button"
              disabled={loading || couponLoading}
              onClick={() => setRefreshKey((key) => key + 1)}
              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-ink bg-paper px-4 text-[14px] font-medium text-ink disabled:opacity-50"
            >
              <ArrowClockwise className={loading || couponLoading ? "animate-spin" : ""} /> 새로고침
            </button>
          </div>
        </div>
      </section>

      {error ? (
        <section className="section-tight-b pb-3">
          <div className="container-page">
            <div className="rounded-control border border-danger/40 bg-danger/10 p-4 text-danger">
              {error} 관리자 인증 세션과 백엔드 실행 상태를 확인해 주세요.
            </div>
          </div>
        </section>
      ) : null}

      <section className="section-tight py-2">
        <ExpectationBar coupon={selectedCoupon} status={status} />
      </section>

      <section className="py-2">
        <SummaryCards coupon={selectedCoupon} status={status} />
      </section>

      <section className="py-2">
        <div className="container-page">
          <IssuePipeline status={status} loading={couponLoading} />
        </div>
      </section>

      <section className={hasAbnormalFailure ? "py-2" : "py-2 pb-8"}>
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

      {hasAbnormalFailure && reasons ? (
        <section className="py-2 pb-8">
          <div className="container-page">
            <FailureReasons reasons={reasons} />
          </div>
        </section>
      ) : null}
    </Layout>
  );
}
