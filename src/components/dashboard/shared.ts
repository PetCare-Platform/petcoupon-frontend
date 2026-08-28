import type { IssueStatisticsResponse } from "../../types/api";

/** 대시보드 패널 카드의 공통 외형 — 블록 컴포넌트들이 최상위 article에 붙인다. */
export const panel =
  "rounded-block border border-hairline bg-paper p-4 text-ink dark:border-white/[0.14] dark:bg-ops-surface dark:text-ops-ink md:p-4";

export const fmt = (value: number) => value.toLocaleString("ko-KR");

/** 메시지 상태 분포에서 특정 상태들의 건수를 합산한다. */
export const countStatuses = (data: IssueStatisticsResponse | null, statuses: string[]) =>
  (data?.distribution ?? [])
    .filter((v) => statuses.includes(v.status))
    .reduce((sum, v) => sum + v.count, 0);
