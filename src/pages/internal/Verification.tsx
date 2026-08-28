import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Layout } from "../../components/Layout";
import { Eyebrow, StatusPill } from "../../components/ui";
import { reconciliationErrorMessage, triggerReconciliation } from "../../api/adminOperations";
import { getCoupons } from "../../api/coupons";
import type {
  CouponListResponse,
  ReconciliationTriggerResponse,
  VerificationErrorType,
} from "../../types/api";

const panel = "rounded-block border border-hairline bg-paper p-4 text-ink";

/** 백엔드 VerificationErrorType 순서 그대로 — 전부 0이어야 정상이다. */
const CHECK_ITEMS: { type: VerificationErrorType; label: string }[] = [
  { type: "STOCK_MISMATCH", label: "재고 불일치" },
  { type: "DUPLICATE_ISSUE", label: "중복 발급 (1인 2매)" },
  { type: "INVALID_STATUS", label: "잘못된 상태" },
  { type: "HISTORY_MISMATCH", label: "이력 불일치" },
  { type: "SEQUENCE_GAP", label: "시퀀스 누락" },
  { type: "STOCK_NOT_RESTORED", label: "재고 미복구" },
];

/** 300만 건 전수 검증 대상 — 시드 SQL이 만드는 쿠폰 6개(각 50만). */
const SEED_NAME_PREFIX = "SEED-쿠폰-";

const fmt = (value: number) => value.toLocaleString("ko-KR");
/** null은 "미검증"(Redis 키 없음 등), 0은 "검증했고 실제로 0건"이라 구분해서 보여준다. */
const fmtNullable = (value: number | null) => (value === null ? "미검증" : fmt(value));
const fmtElapsed = (ms: number) => {
  const seconds = ms / 1000;
  return seconds >= 60 ? `${seconds.toFixed(1)}초 (약 ${(seconds / 60).toFixed(1)}분)` : `${seconds.toFixed(1)}초`;
};
const errorMessage = reconciliationErrorMessage;

type BatchRowStatus = "waiting" | "running" | "done" | "failed" | "cancelled";

interface BatchRow {
  couponId: number;
  name: string;
  status: BatchRowStatus;
  result?: ReconciliationTriggerResponse;
  error?: string;
  elapsedMs?: number;
}

function StockLedger({ result }: { result: ReconciliationTriggerResponse }) {
  const rows: { label: string; value: string; tone?: "danger" | "success" }[] = [
    { label: "DB 총재고", value: fmtNullable(result.stockTotal) },
    { label: "DB 발급", value: fmtNullable(result.stockIssued) },
    { label: "DB 잔여", value: fmtNullable(result.stockRemaining) },
    { label: "Redis 잔여", value: fmtNullable(result.redisRemaining) },
  ];

  if (result.stockRemaining !== null && result.redisRemaining !== null) {
    const gap = result.stockRemaining - result.redisRemaining;
    rows.push({ label: "차이", value: fmt(gap), tone: gap === 0 ? "success" : "danger" });
  } else {
    rows.push({ label: "차이", value: "비교 불가" });
  }

  return (
    <dl className="mt-3 text-[13px]">
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between gap-3 border-b border-hairline-soft py-1.5 last:border-0">
          <dt className="text-ink/60">{row.label}</dt>
          <dd
            className={`font-semibold tabular-nums ${
              row.tone === "danger" ? "text-danger" : row.tone === "success" ? "text-[#087c13]" : ""
            }`}
          >
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function SingleResult({ result, elapsedMs }: { result: ReconciliationTriggerResponse; elapsedMs: number | null }) {
  // 유형별 집계. 응답이 500건에서 잘리므로 이 숫자는 "표시된 것 기준"이다.
  const countByType = useMemo(() => {
    const map = new Map<VerificationErrorType, number>();
    for (const detail of result.verificationDetails) {
      map.set(detail.errorType, (map.get(detail.errorType) ?? 0) + 1);
    }
    return map;
  }, [result]);

  const truncated = result.verificationDetailCount > result.verificationDetails.length;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-3">
        <div className="flex items-center gap-2.5">
          <h2>REPORT #{result.reportId}</h2>
          {/* 판정은 반드시 result로 한다 — errorCount는 발급 건 단위라 0이어도 불일치일 수 있다. */}
          <StatusPill tone={result.result === "MATCHED" ? "open" : "danger"}>{result.result}</StatusPill>
        </div>
        <p className="text-[13px] text-ink/60">
          대상 {fmt(result.totalCount)}건 · 기준 시각 {result.asOfAt}
          {elapsedMs !== null ? ` · 소요 ${(elapsedMs / 1000).toFixed(1)}초` : ""}
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[7fr_5fr]">
        <div>
          <h3 className="text-[14px] font-semibold">검증 항목 6가지</h3>
          <dl className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {CHECK_ITEMS.map((item) => {
              const count = countByType.get(item.type) ?? 0;
              return (
                <div
                  key={item.type}
                  className={`flex items-center justify-between gap-2 rounded-control px-3 py-1.5 text-[13px] ${
                    count > 0 ? "bg-danger/10" : "bg-surface-2"
                  }`}
                >
                  <dt className={count > 0 ? "text-danger" : "text-ink/70"}>{item.label}</dt>
                  <dd className={`font-semibold tabular-nums ${count > 0 ? "text-danger" : "text-[#087c13]"}`}>
                    {count}
                  </dd>
                </div>
              );
            })}
          </dl>
          {truncated ? (
            <p className="mt-2 text-[12px] text-clay-ink">
              불일치 {fmt(result.verificationDetailCount)}건 중 {fmt(result.verificationDetails.length)}건만 응답에
              담겼습니다. 위 집계는 표시된 건 기준입니다.
            </p>
          ) : null}
        </div>

        <div>
          <h3 className="text-[14px] font-semibold">재고 원장 대조</h3>
          <StockLedger result={result} />
          <p className="mt-2 text-[12px] text-ink/55">
            DLQ {result.dbDlqCount === null ? "미검증" : `${fmt(result.dbDlqCount)}건`} · 최대 순번{" "}
            {fmtNullable(result.maxSequenceNo)}
          </p>
        </div>
      </div>

      {result.verificationDetails.length > 0 ? (
        <div className="mt-4 border-t border-hairline pt-3">
          <h3 className="text-[14px] font-semibold">불일치 상세</h3>
          <div className="mt-2 max-h-[220px] overflow-auto">
            <table className="w-full min-w-[520px] text-left text-[12px]">
              <thead className="text-ink/55">
                <tr>
                  <th className="pb-2">유형</th>
                  <th className="pb-2">사용자</th>
                  <th className="pb-2">기대</th>
                  <th className="pb-2">실제</th>
                  <th className="pb-2">메시지</th>
                </tr>
              </thead>
              <tbody>
                {result.verificationDetails.map((detail, i) => (
                  <tr key={`${detail.errorType}-${detail.couponIssueId ?? i}`} className="border-t border-hairline-soft">
                    <td className="py-1.5 font-medium text-danger">{detail.errorType}</td>
                    <td className="py-1.5 font-mono">{detail.userId ?? "—"}</td>
                    <td className="py-1.5 font-mono">{detail.expectedValue ?? "—"}</td>
                    <td className="py-1.5 font-mono">{detail.actualValue ?? "—"}</td>
                    {/* truncate로 잘리므로 전체 내용은 툴팁으로 본다. */}
                    <td className="max-w-[16rem] truncate py-1.5" title={detail.message ?? undefined}>
                      {detail.message ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </>
  );
}

/**
 * 요약 판정. 중단(cancelled)을 따로 세지 않으면 failed도 allMatched도 아니어서
 * "불일치 있음"으로 떨어진다 — 정합성 문제를 찾은 게 아니라 사용자가 멈춘 것뿐인데도.
 *
 * 불일치를 중단보다 앞에 둔다. 멈추기 전에 이미 불일치를 찾았다면 그쪽이 더 중요한 정보다.
 */
function summarize(rows: BatchRow[]) {
  const done = rows.filter((r) => r.status === "done");
  const failed = rows.filter((r) => r.status === "failed").length;
  const cancelled = rows.filter((r) => r.status === "cancelled").length;
  const mismatched = done.filter((r) => r.result?.result !== "MATCHED").length;

  const verdict: { label: string; tone: "open" | "danger" | "warning" | "neutral" } =
    failed > 0
      ? { label: `${failed}건 실패`, tone: "danger" }
      : mismatched > 0
        ? { label: "불일치 있음", tone: "danger" }
        : cancelled > 0
          ? { label: "중단됨", tone: "warning" }
          : { label: "전부 MATCHED", tone: "open" };

  return {
    done,
    failed,
    cancelled,
    verdict,
    totalCount: done.reduce((sum, r) => sum + (r.result?.totalCount ?? 0), 0),
    mismatchCount: done.reduce((sum, r) => sum + (r.result?.verificationDetailCount ?? 0), 0),
    // 회차별 소요의 합이라 회차 사이 간격은 빠진다 — 무시할 수준이다.
    totalElapsedMs: done.reduce((sum, r) => sum + (r.elapsedMs ?? 0), 0),
  };
}

function BatchResult({ rows, running }: { rows: BatchRow[]; running: boolean }) {
  const { done, failed, cancelled, verdict, totalCount, mismatchCount, totalElapsedMs } = summarize(rows);
  const currentIndex = rows.findIndex((r) => r.status === "running");

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline pb-3">
        <div className="flex items-center gap-2.5">
          <h2>{SEED_NAME_PREFIX} 일괄 검증</h2>
          {running ? (
            <StatusPill tone="neutral">검증 중</StatusPill>
          ) : (
            <StatusPill tone={verdict.tone}>{verdict.label}</StatusPill>
          )}
        </div>
        <p className="text-[13px] text-ink/60" aria-live="polite">
          {running && currentIndex >= 0
            ? `${currentIndex + 1}/${rows.length} 검증 중… ${rows[currentIndex].name}`
            : cancelled > 0
              ? `${done.length}/${rows.length} 완료 · ${cancelled}건 중단`
              : `${done.length}/${rows.length} 완료`}
        </p>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-[13px]">
          <thead className="text-ink/55">
            <tr>
              <th className="pb-2">쿠폰</th>
              <th className="pb-2 text-right">대상</th>
              <th className="pb-2 text-right">불일치</th>
              <th className="pb-2 text-right">소요</th>
              <th className="pb-2 text-right">결과</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.couponId} className="border-t border-hairline-soft">
                <td className="py-1.5">{row.name}</td>
                <td className="py-1.5 text-right tabular-nums">
                  {row.result ? fmt(row.result.totalCount) : "—"}
                </td>
                <td
                  className={`py-1.5 text-right tabular-nums ${
                    row.result && row.result.verificationDetailCount > 0 ? "text-danger" : ""
                  }`}
                >
                  {row.result ? fmt(row.result.verificationDetailCount) : "—"}
                </td>
                <td className="py-1.5 text-right tabular-nums text-ink/60">
                  {row.elapsedMs !== undefined ? `${(row.elapsedMs / 1000).toFixed(1)}초` : "—"}
                </td>
                <td className="py-1.5 text-right">
                  {row.status === "waiting" ? (
                    <span className="text-ink/45">대기</span>
                  ) : row.status === "running" ? (
                    <span className="text-ink/70">검증 중…</span>
                  ) : row.status === "cancelled" ? (
                    <span className="text-ink/45">중단됨</span>
                  ) : row.status === "failed" ? (
                    <span className="text-danger" title={row.error}>
                      실패
                    </span>
                  ) : (
                    <span className={row.result?.result === "MATCHED" ? "text-[#087c13]" : "text-danger"}>
                      {row.result?.result}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-hairline font-semibold">
              <td className="py-2">합계</td>
              <td className="py-2 text-right tabular-nums">{fmt(totalCount)}</td>
              <td className={`py-2 text-right tabular-nums ${mismatchCount > 0 ? "text-danger" : "text-[#087c13]"}`}>
                {fmt(mismatchCount)}
              </td>
              <td className="py-2 text-right tabular-nums text-ink/60">
                {totalElapsedMs > 0 ? fmtElapsed(totalElapsedMs) : "—"}
              </td>
              <td className="py-2 text-right">
                {running ? (
                  <span className="text-ink/45">—</span>
                ) : (
                  <span
                    className={
                      verdict.tone === "open"
                        ? "text-[#087c13]"
                        : verdict.tone === "warning"
                          ? "text-clay-ink"
                          : "text-danger"
                    }
                  >
                    {verdict.label}
                  </span>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {rows.some((r) => r.status === "failed") ? (
        <ul className="mt-3 border-t border-hairline pt-3 text-[12px] text-danger">
          {rows
            .filter((r) => r.status === "failed")
            .map((r) => (
              <li key={r.couponId}>
                {r.name} — {r.error}
              </li>
            ))}
        </ul>
      ) : null}
    </>
  );
}

export default function Verification() {
  const [coupons, setCoupons] = useState<CouponListResponse[]>([]);
  const [couponId, setCouponId] = useState("");
  const [result, setResult] = useState<ReconciliationTriggerResponse | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [batchRows, setBatchRows] = useState<BatchRow[] | null>(null);
  const [batchRunning, setBatchRunning] = useState(false);
  // 4분짜리 작업이라 중단 수단이 필요하다. 순차 루프가 매 회차 시작 전에 확인한다.
  // ref는 루프가 읽고, state는 버튼 문구를 바꾸는 용도라 둘 다 둔다.
  const cancelRef = useRef(false);
  const [cancelRequested, setCancelRequested] = useState(false);

  // 언마운트 시 루프를 멈춘다. 안 그러면 페이지를 떠나도 남은 회차가 계속 실행되고,
  // 돌아와서 다시 시작하면 옛 루프와 겹쳐 백엔드가 REQUEST_IN_PROGRESS로 막는다.
  useEffect(() => () => {
    cancelRef.current = true;
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    getCoupons({}, 0, 100, controller.signal)
      .then((page) => {
        setCoupons(page.content);
        setCouponId((current) => current || String(page.content[0]?.couponId ?? ""));
      })
      .catch(() => {
        /* 목록을 못 받아도 검증 자체는 ID를 알면 실행할 수 있다 — 조용히 넘긴다. */
      });
    return () => controller.abort();
  }, []);

  const seedCoupons = useMemo(
    () =>
      coupons
        .filter((coupon) => coupon.name.startsWith(SEED_NAME_PREFIX))
        .sort((a, b) => a.name.localeCompare(b.name, "ko")),
    [coupons],
  );

  const busy = submitting || batchRunning;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const id = Number(couponId);
    if (!Number.isInteger(id) || id <= 0) {
      setError("검증할 쿠폰을 선택해 주세요.");
      return;
    }
    setSubmitting(true);
    setError("");
    setResult(null);
    setBatchRows(null);
    setElapsedMs(null);
    const startedAt = performance.now();
    try {
      const response = await triggerReconciliation(id);
      setResult(response);
      setElapsedMs(Math.round(performance.now() - startedAt));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  /**
   * SEED 쿠폰을 순차로 검증한다. 병렬로 던지면 안 된다 — 회차마다 500,000건 배치가
   * 돌아 DB·Redis를 동시에 때리고, 백엔드도 같은 쿠폰이 실행 중이면 REQUEST_IN_PROGRESS로 막는다.
   * 중간에 실패해도 나머지는 계속 진행하고 결과 표에 실패로 남긴다.
   */
  async function handleBatch() {
    if (seedCoupons.length === 0) return;
    cancelRef.current = false;
    setCancelRequested(false);
    setBatchRunning(true);
    setError("");
    setResult(null);

    const rows: BatchRow[] = seedCoupons.map((coupon) => ({
      couponId: coupon.couponId,
      name: coupon.name,
      status: "waiting",
    }));
    setBatchRows([...rows]);

    for (let i = 0; i < rows.length; i++) {
      if (cancelRef.current) {
        for (let j = i; j < rows.length; j++) rows[j].status = "cancelled";
        setBatchRows([...rows]);
        break;
      }

      rows[i].status = "running";
      setBatchRows([...rows]);

      const startedAt = performance.now();
      try {
        rows[i].result = await triggerReconciliation(rows[i].couponId);
        rows[i].status = "done";
      } catch (err) {
        rows[i].error = errorMessage(err);
        rows[i].status = "failed";
      }
      rows[i].elapsedMs = Math.round(performance.now() - startedAt);
      setBatchRows([...rows]);
    }

    setBatchRunning(false);
    setCancelRequested(false);
  }

  return (
    <Layout area="internal">
      <section className="py-6">
        <div className="container-page">
          <Eyebrow>내부 운영 · 실제 정합성 API</Eyebrow>
          <h1 className="mt-1">정합성 검증</h1>
          <p className="mt-1 text-[14px] text-ink/70">쿠폰 단위로 원장 정합성 검증을 즉시 실행합니다.</p>
        </div>
      </section>

      <section className="pb-8 pt-2">
        <div className="container-page grid gap-4 lg:grid-cols-[4fr_8fr]">
          <form onSubmit={handleSubmit} className={panel}>
            <label htmlFor="reconcile-coupon-id" className="text-[14px] font-medium">
              검증할 쿠폰
            </label>
            <select
              id="reconcile-coupon-id"
              value={couponId}
              onChange={(event) => setCouponId(event.target.value)}
              disabled={busy}
              className="mt-1.5 min-h-10 w-full rounded-control border border-hairline bg-paper px-3 text-[15px] text-ink"
            >
              {coupons.length > 0 ? (
                coupons.map((coupon) => (
                  <option key={coupon.couponId} value={coupon.couponId}>
                    {coupon.name} (#{coupon.couponId})
                  </option>
                ))
              ) : (
                <option value="">조회 가능한 쿠폰이 없습니다</option>
              )}
            </select>
            {error ? <p className="mt-2 text-[13px] text-danger">{error}</p> : null}

            <button
              type="submit"
              disabled={busy || !couponId}
              className="mt-4 inline-flex min-h-9 w-full items-center justify-center rounded-full border border-ink bg-ink px-4 text-[14px] font-medium text-paper disabled:opacity-50"
            >
              {submitting ? "검증 중…" : "정합성 검증 실행"}
            </button>

            <div className="mt-4 border-t border-hairline pt-4">
              <p className="text-[13px] font-medium">300만 건 전수 검증</p>
              <p className="mt-1 text-[12px] text-ink/55">
                {seedCoupons.length > 0
                  ? `${SEED_NAME_PREFIX} ${seedCoupons.length}개를 순차 검증합니다. 쿠폰당 약 40초 걸립니다.`
                  : `${SEED_NAME_PREFIX} 쿠폰이 없습니다. 시드 데이터를 먼저 적재하세요.`}
              </p>
              {batchRunning ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      cancelRef.current = true;
                      setCancelRequested(true);
                    }}
                    disabled={cancelRequested}
                    className="mt-2 inline-flex min-h-9 w-full items-center justify-center rounded-full border border-ink px-4 text-[14px] font-medium disabled:opacity-50"
                  >
                    {cancelRequested ? "중단 대기 중…" : "다음 회차부터 중단"}
                  </button>
                  {/* 백엔드에 실행 중인 배치를 취소하는 API가 없다. 진행 중인 회차는 끝까지 돈다. */}
                  <p className="mt-1.5 text-[12px] text-ink/55">
                    {cancelRequested
                      ? "진행 중인 회차가 끝나면 멈춥니다. 최대 1분 정도 걸립니다."
                      : "진행 중인 회차는 끝까지 돌고, 다음 회차부터 실행하지 않습니다."}
                  </p>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleBatch}
                  disabled={busy || seedCoupons.length === 0}
                  className="mt-2 inline-flex min-h-9 w-full items-center justify-center rounded-full border border-ink px-4 text-[14px] font-medium disabled:opacity-50"
                >
                  SEED {seedCoupons.length}개 일괄 검증
                </button>
              )}
            </div>

            <p className="mt-3 text-[12px] text-ink/55">
              쿠폰 상태가 ENDED이고 발급 파이프라인이 비어 있어야 실행됩니다.
            </p>
          </form>

          <div className={panel}>
            {batchRows ? (
              <BatchResult rows={batchRows} running={batchRunning} />
            ) : result ? (
              <SingleResult result={result} elapsedMs={elapsedMs} />
            ) : (
              <p className="text-[14px] text-ink/60">실행 결과가 여기에 표시됩니다. 관리자 세션이 필요합니다.</p>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
