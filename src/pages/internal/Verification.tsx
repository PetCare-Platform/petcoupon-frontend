import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Layout } from "../../components/Layout";
import { Eyebrow, StatusPill } from "../../components/ui";
import { triggerReconciliation } from "../../api/adminOperations";
import { getCoupons } from "../../api/coupons";
import { ApiError, NetworkError } from "../../api/http";
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

const fmt = (value: number) => value.toLocaleString("ko-KR");
/** null은 "미검증"(Redis 키 없음 등), 0은 "검증했고 실제로 0건"이라 구분해서 보여준다. */
const fmtNullable = (value: number | null) => (value === null ? "미검증" : fmt(value));

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

export default function Verification() {
  const [coupons, setCoupons] = useState<CouponListResponse[]>([]);
  const [couponId, setCouponId] = useState("");
  const [result, setResult] = useState<ReconciliationTriggerResponse | null>(null);
  const [elapsedMs, setElapsedMs] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  // 유형별 집계. 응답이 500건에서 잘리므로 이 숫자는 "표시된 것 기준"이다.
  const countByType = useMemo(() => {
    const map = new Map<VerificationErrorType, number>();
    for (const detail of result?.verificationDetails ?? []) {
      map.set(detail.errorType, (map.get(detail.errorType) ?? 0) + 1);
    }
    return map;
  }, [result]);

  const truncated = result != null && result.verificationDetailCount > result.verificationDetails.length;

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
    setElapsedMs(null);
    const startedAt = performance.now();
    try {
      const response = await triggerReconciliation(id);
      setResult(response);
      setElapsedMs(Math.round(performance.now() - startedAt));
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof NetworkError ? err.message : "정합성 검증을 실행하지 못했습니다.",
      );
    } finally {
      setSubmitting(false);
    }
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
              disabled={submitting}
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
              disabled={submitting || !couponId}
              className="mt-4 inline-flex min-h-9 w-full items-center justify-center rounded-full border border-ink bg-ink px-4 text-[14px] font-medium text-paper disabled:opacity-50"
            >
              {submitting ? "검증 중…" : "정합성 검증 실행"}
            </button>

            <p className="mt-3 text-[12px] text-ink/55">
              쿠폰 상태가 ENDED이고 발급 파이프라인이 비어 있어야 실행됩니다.
            </p>
          </form>

          <div className={panel}>
            {!result ? (
              <p className="text-[14px] text-ink/60">실행 결과가 여기에 표시됩니다. 관리자 세션이 필요합니다.</p>
            ) : (
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
                            <dd
                              className={`font-semibold tabular-nums ${count > 0 ? "text-danger" : "text-[#087c13]"}`}
                            >
                              {count}
                            </dd>
                          </div>
                        );
                      })}
                    </dl>
                    {truncated ? (
                      <p className="mt-2 text-[12px] text-clay-ink">
                        불일치 {fmt(result.verificationDetailCount)}건 중 {fmt(result.verificationDetails.length)}건만
                        응답에 담겼습니다. 위 집계는 표시된 건 기준입니다.
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
                              <td className="max-w-[16rem] truncate py-1.5">{detail.message ?? "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
