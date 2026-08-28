import { panel } from "./shared";
import { EmptyState, StatusPill } from "../ui";
import type { CouponListResponse, ReconciliationReportSummaryResponse } from "../../types/api";

function ReconciliationBars({ reports }: { reports: ReconciliationReportSummaryResponse[] }) {
  const rows = [...reports].slice(0, 10).reverse(),
    max = Math.max(1, ...rows.map((v) => v.totalCount));
  if (!rows.length)
    return <p className="py-8 text-center text-ink/55 dark:text-ops-muted">아직 저장된 정합성 검증 이력이 없습니다.</p>;

  return (
    <div>
      <div className="flex h-28 items-end gap-3 border-b border-hairline pb-1 dark:border-ops-border">
        {rows.map((row) => (
          <div
            key={row.reportId}
            className="flex h-full flex-1 items-end"
            title={`#${row.reportId} ${row.result} · 오류 ${row.errorCount}건`}
          >
            <div
              className={`w-full min-w-3 rounded-t ${row.result === "MATCHED" ? "bg-[#079516]" : row.result === "MISMATCHED" ? "bg-[#cf3e40]" : "bg-[#8f8f8b]"}`}
              style={{ height: `${Math.max((row.totalCount / max) * 100, 8)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-5 text-[13px]">
        <span className="text-[#079516]">■ MATCHED</span>
        <span className="text-[#cf3e40]">■ MISMATCHED</span>
        <span className="text-[#8f8f8b]">■ ERROR</span>
      </div>
    </div>
  );
}

export function ReconciliationPanel({
  coupons,
  couponId,
  onCouponChange,
  reports,
  reportsLoading,
}: {
  coupons: CouponListResponse[];
  couponId: number | null;
  onCouponChange: (couponId: number) => void;
  reports: ReconciliationReportSummaryResponse[];
  reportsLoading: boolean;
}) {
  const latest = reports[0];
  const latestNeedsAttention = latest != null && latest.result !== "MATCHED";

  return (
    <article className={panel}>
      <div className="mb-4 flex flex-wrap justify-between gap-4">
        <div>
          <h2>정합성 검증 이력</h2>
          <p className="mt-1 text-ink/55 dark:text-ops-muted">선택한 쿠폰의 최근 검증 결과</p>
        </div>
        <div className="flex items-center gap-3">
          {latestNeedsAttention ? (
            <StatusPill tone="warning">최신 결과 확인 필요</StatusPill>
          ) : latest ? (
            <StatusPill tone="open">최신 결과 정상</StatusPill>
          ) : (
            <StatusPill tone="neutral">검증 이력 없음</StatusPill>
          )}
          <select
            value={couponId ?? ""}
            onChange={(e) => onCouponChange(Number(e.target.value))}
            className="min-h-10 rounded-control border border-hairline bg-paper px-3 text-sm text-ink dark:border-ops-border dark:bg-ops-bg dark:text-ops-ink"
          >
            {coupons.map((v) => (
              <option key={v.couponId} value={v.couponId}>
                {v.name} (#{v.couponId})
              </option>
            ))}
          </select>
        </div>
      </div>

      {reportsLoading ? (
        <p className="py-8 text-center text-ink/50">이력을 불러오는 중…</p>
      ) : couponId === null ? (
        <EmptyState title="조회할 쿠폰이 없습니다." description="쿠폰을 생성하면 정합성 이력을 확인할 수 있습니다." />
      ) : (
        <ReconciliationBars reports={reports} />
      )}
    </article>
  );
}
