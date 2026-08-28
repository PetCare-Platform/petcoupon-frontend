import { countStatuses, fmt, panel } from "./shared";
import type { IssueStatisticsResponse } from "../../types/api";

function DonutBody({ data }: { data: IssueStatisticsResponse }) {
  const success = countStatuses(data, ["CONSUMED"]),
    retry = countStatuses(data, ["PENDING", "SENT", "FAILED"]),
    dlq = countStatuses(data, ["DLQ", "ABANDONED"]),
    total = success + retry + dlq;
  const a = total ? (success / total) * 100 : 0,
    b = total ? (retry / total) * 100 : 0;
  const items = [
    { label: "성공", value: success, color: "#079516" },
    { label: "재시도/진행", value: retry, color: "#8a5a00" },
    { label: "DLQ/포기", value: dlq, color: "#cf3e40" },
  ];
  const bg = total
    ? `conic-gradient(#079516 0 ${a}%,#8a5a00 ${a}% ${a + b}%,#cf3e40 ${a + b}% 100%)`
    : "rgb(var(--c-hairline))";

  return (
    <div className="grid gap-3">
      <div className="relative mx-auto h-32 w-32 rounded-full" style={{ background: bg }}>
        <div className="absolute inset-[22%] flex items-center justify-center rounded-full bg-paper text-center dark:bg-ops-surface">
          <span>
            <strong className="block text-[15px] leading-tight">{fmt(total)}</strong>
            <small className="text-[10px] text-ink/50 dark:text-ops-muted">전체</small>
          </span>
        </div>
      </div>
      <dl className="grid gap-1.5 text-[13px]">
        {items.map((item) => (
          <div key={item.label} className="flex justify-between">
            <dt className="flex items-center gap-2">
              <i className="h-2.5 w-2.5 rounded-sm" style={{ background: item.color }} />
              {item.label}
            </dt>
            <dd>
              {total ? ((item.value / total) * 100).toFixed(1) : "0.0"}%{" "}
              <span className="text-ink/45">({fmt(item.value)})</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function StatusDonut({
  statistics,
  loading,
}: {
  statistics: IssueStatisticsResponse | null;
  loading: boolean;
}) {
  return (
    <article className={panel}>
      <h2>메시지 상태 분포</h2>
      <p className="mt-1 text-ink/55 dark:text-ops-muted">전체 기간</p>
      <div className="mt-3">
        {statistics ? (
          <DonutBody data={statistics} />
        ) : (
          <p className="py-12 text-center text-ink/50">{loading ? "불러오는 중…" : "데이터가 없습니다."}</p>
        )}
      </div>
    </article>
  );
}
