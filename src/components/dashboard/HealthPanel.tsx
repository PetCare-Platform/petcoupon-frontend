import { fmt, panel } from "./shared";
import { StatusPill } from "../ui";
import type { DashboardSummaryResponse, SystemHealthResponse } from "../../types/api";

export function HealthPanel({
  health,
  summary,
}: {
  health: SystemHealthResponse | null;
  summary: DashboardSummaryResponse | null;
}) {
  return (
    // 카드를 세로 flex로 두고 본문에 flex-1 + max-h를 준다. flex-1만으로는 상한이 없어
    // 컴포넌트가 늘면 이 카드가 줄 높이를 그대로 끌어올린다.
    <article className={`${panel} flex flex-col`}>
      <div className="mb-3 flex flex-none justify-between">
        <div>
          <h2>시스템 헬스체크</h2>
          <p className="mt-1 text-ink/55 dark:text-ops-muted">백엔드 컴포넌트 상태</p>
        </div>
        {health ? (
          <StatusPill tone={health.overallStatus === "UP" ? "open" : "danger"}>{health.overallStatus}</StatusPill>
        ) : null}
      </div>

      <div className="min-h-0 max-h-[190px] flex-1 overflow-y-auto pr-1">
        <dl className="grid gap-2">
          {(health?.components ?? []).map((v) => (
            <div
              key={v.name}
              className="flex justify-between gap-2 border-b border-hairline-soft pb-2 last:border-0 dark:border-ops-border-soft"
            >
              <dt className="truncate font-medium capitalize">{v.name === "db" ? "MySQL" : v.name}</dt>
              <dd
                className={
                  v.status === "UP" ? "font-semibold text-[#087c13] dark:text-success" : "font-semibold text-danger"
                }
              >
                {v.status}
              </dd>
            </div>
          ))}
        </dl>

        {summary ? (
          <dl className="mt-3 grid gap-1.5 border-t border-hairline pt-3 text-[13px] dark:border-ops-border">
            <div className="flex justify-between gap-2">
              <dt className="truncate text-ink/60 dark:text-ops-muted">활성 이벤트</dt>
              <dd className="flex-none font-semibold tabular-nums">
                {summary.activeEvents}/{summary.totalEvents}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="truncate text-ink/60 dark:text-ops-muted">활성 쿠폰</dt>
              <dd className="flex-none font-semibold tabular-nums">
                {summary.activeCoupons}/{summary.totalCoupons}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="truncate text-ink/60 dark:text-ops-muted">발급 재고</dt>
              <dd className="flex-none font-semibold tabular-nums">{fmt(summary.startedCouponIssuedStock)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="truncate text-ink/60 dark:text-ops-muted">잔여 재고</dt>
              <dd className="flex-none font-semibold tabular-nums">{fmt(summary.startedCouponRemainingStock)}</dd>
            </div>
          </dl>
        ) : null}
      </div>
    </article>
  );
}
