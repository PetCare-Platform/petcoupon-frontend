import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowClockwise } from "@phosphor-icons/react";
import { Layout } from "../../components/Layout";
import { Eyebrow, StatusPill } from "../../components/ui";
import { ExpectationBar } from "../../components/dashboard/ExpectationBar";
import { SummaryCards } from "../../components/dashboard/SummaryCards";
import { IssuePipeline } from "../../components/dashboard/IssuePipeline";
import { ReconciliationLauncher, isPipelineBlocked } from "../../components/dashboard/ReconciliationLauncher";
import { LoadTestChart } from "../../components/dashboard/LoadTestChart";
import { FailureReasons } from "../../components/dashboard/FailureReasons";
import { reconciliationErrorMessage, triggerReconciliation } from "../../api/adminOperations";
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

// 부하 테스트 중 값이 움직이는 걸 볼 수 있는 최소 간격. 더 짧게 잡으면 50만 건 집계 쿼리가
// 응답보다 빨리 쌓이고, 더 길면 짧은 부하 구간을 통째로 놓친다.
const POLL_INTERVAL_MS = 5000;

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
  const [autoRefresh, setAutoRefresh] = useState(true);

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

  // silent는 폴링용이다. 5초마다 스피너를 돌리고 값을 비우면 화면이 계속 깜빡여서,
  // 자동 갱신에서는 응답이 온 값만 조용히 갈아끼운다.
  const loadCoupon = useCallback(async (id: number, signal: AbortSignal, silent = false) => {
    if (!silent) setCouponLoading(true);
    const [s, f, d, t] = await Promise.allSettled([
      getLoadTestStatus(id, signal),
      getFailureReasons(id, signal),
      getPipelineDrainStatus(id, signal),
      getIssueTimeSeries(id, 90, 5, signal),
    ]);
    if (signal.aborted) return;
    if (!silent || s.status === "fulfilled") setStatus(s.status === "fulfilled" ? s.value : null);
    if (!silent || f.status === "fulfilled") setReasons(f.status === "fulfilled" ? f.value : null);
    if (!silent || d.status === "fulfilled") setDrain(d.status === "fulfilled" ? d.value : null);
    if (!silent || t.status === "fulfilled") setSeries(t.status === "fulfilled" ? t.value : null);
    setCheckedAt(new Date());
    if (!silent) setCouponLoading(false);
  }, []);

  useEffect(() => {
    if (couponId === null) {
      setStatus(null);
      setReasons(null);
      setDrain(null);
      setSeries(null);
      return;
    }
    const controller = new AbortController();
    void loadCoupon(couponId, controller.signal);
    return () => controller.abort();
  }, [couponId, refreshKey, loadCoupon]);

  const selectedCoupon = useMemo(
    () => coupons.find((c) => c.couponId === couponId),
    [coupons, couponId],
  );

  /**
   * 자동 갱신을 켤 조건은 "더 발급될 수 있는 쿠폰인가"다. 재고가 남아 있고 발급을 받는
   * 동안(READY·ACTIVE)에만 돌고, 품절(SOLD_OUT)·종료(ENDED)에서는 멈춘다.
   *
   * 여기서 멈춰야 부하 실황 차트가 마지막 화면으로 고정된다 — 시계열 API가 현재 시각
   * 기준 최근 N초를 돌려주기 때문에, 계속 폴링하면 방금 찍힌 발급 구간이 창 밖으로
   * 밀려나 0만 남은 그래프가 된다.
   *
   * 파이프라인에 처리 중인 요청이 남아 있으면 상태와 무관하게 계속 돈다. 품절된 뒤에도
   * 마지막 요청들이 DB 확정까지 가는 과정은 화면에서 이어져야 한다.
   */
  const issuable = drain != null && (drain.couponStatus === "READY" || drain.couponStatus === "ACTIVE");
  const live =
    drain != null &&
    (issuable ||
      isPipelineBlocked(drain) ||
      (status != null && status.pending + status.sent + status.inProgressIdempotencyKeys > 0));
  const polling = autoRefresh && live && couponId !== null;

  useEffect(() => {
    if (!polling || couponId === null) return;
    const controller = new AbortController();
    const timer = window.setInterval(() => {
      void loadCoupon(couponId, controller.signal, true);
    }, POLL_INTERVAL_MS);
    return () => {
      window.clearInterval(timer);
      controller.abort();
    };
  }, [polling, couponId, loadCoupon]);

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
      setReconError(reconciliationErrorMessage(err));
    } finally {
      setReconRunning(false);
    }
  }

  return (
    <Layout area="internal">
      {/* 좁은 화면에서는 제목 줄과 컨트롤 줄 사이 간격을 줄인다 — 두 줄로 접히면서
          헤더만 130px 넘게 차지해 아래가 잘렸다. */}
      <section className="section-tight-b py-6">
        <div className="container-page flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
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
            <button
              type="button"
              onClick={() => setAutoRefresh((on) => !on)}
              aria-pressed={autoRefresh}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-hairline px-3 text-[13px] text-ink/70 hover:border-ink"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  polling ? "animate-pulse bg-[#087c13]" : "bg-ink/25"
                }`}
              />
              {autoRefresh ? (polling ? "자동 갱신 중 · 5초" : "자동 갱신 대기") : "자동 갱신 꺼짐"}
            </button>
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
        <div className="container-page grid gap-3 md:grid-cols-[4fr_6fr] xl:gap-4">
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
