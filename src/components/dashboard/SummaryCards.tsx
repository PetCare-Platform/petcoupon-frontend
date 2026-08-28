import { useMemo } from "react";
import { countStatuses, fmt } from "./shared";
import type {
  IssueStatisticsResponse,
  ReconciliationReportSummaryResponse,
  SystemHealthResponse,
} from "../../types/api";

type Tone = "neutral" | "success" | "danger";

function SummaryCard({ label, value, tone = "neutral" }: { label: string; value: string; tone?: Tone }) {
  const color =
    tone === "success"
      ? "text-[#087c13] dark:text-success"
      : tone === "danger"
        ? "text-danger"
        : "text-ink dark:text-ops-ink";
  return (
    <div className="rounded-block border border-hairline bg-surface-2 p-4 dark:border-white/[0.12] dark:bg-ops-surface">
      <p className="text-[13px] font-medium text-ink/65 dark:text-ops-muted">{label}</p>
      <strong className={`mt-1 block text-[26px] leading-none tabular-nums ${color}`}>{value}</strong>
    </div>
  );
}

export function SummaryCards({
  statistics,
  health,
  latest,
}: {
  statistics: IssueStatisticsResponse | null;
  health: SystemHealthResponse | null;
  latest: ReconciliationReportSummaryResponse | undefined;
}) {
  const total = useMemo(
    () => (statistics?.distribution ?? []).reduce((sum, v) => sum + v.count, 0),
    [statistics],
  );
  const success = countStatuses(statistics, ["CONSUMED"]);
  const dlqCount = countStatuses(statistics, ["DLQ"]);

  // errorCount는 발급 건 단위 오류만 세므로, 쿠폰 전체 집계 불일치는 errorCount=0이면서
  // result=MISMATCHED일 수 있다. 최신 result를 정합성의 단일 진실로 사용한다.
  const reconciliationStatus =
    latest?.result === "MATCHED"
      ? "일치"
      : latest?.result === "MISMATCHED"
        ? "불일치"
        : latest?.result === "ERROR"
          ? "오류"
          : "—";

  const up = health?.components.filter((v) => v.status === "UP").length ?? 0;
  const componentTotal = health?.components.length ?? 0;

  return (
    <div className="container-page grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <SummaryCard label="전체 발급 요청" value={statistics ? fmt(total) : "—"} />
      <SummaryCard label="발급 성공" value={statistics ? fmt(success) : "—"} tone="success" />
      <SummaryCard label="DLQ 대기" value={statistics ? fmt(dlqCount) : "—"} tone={dlqCount ? "danger" : "neutral"} />
      <SummaryCard
        label="최신 정합성"
        value={reconciliationStatus}
        tone={latest?.result === "MATCHED" ? "success" : latest ? "danger" : "neutral"}
      />
      <SummaryCard
        label="시스템 상태"
        value={health ? `${health.overallStatus === "UP" ? "정상" : health.overallStatus} ${up}/${componentTotal}` : "—"}
        tone={health?.overallStatus === "UP" ? "success" : "danger"}
      />
    </div>
  );
}
