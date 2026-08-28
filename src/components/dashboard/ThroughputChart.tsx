import { panel } from "./shared";
import type { IssueStatisticsResponse } from "../../types/api";

/**
 * 꺾은선 본체. viewBox 비율(720:220)을 지키면 좌우가 잘리고 아래 시각 라벨과 어긋나서
 * preserveAspectRatio="none"으로 박스를 꽉 채우고, 선 굵기는 vector-effect로 고정한다.
 */
function ThroughputLines({ data }: { data: IssueStatisticsResponse }) {
  const rows = data.timeSeries,
    width = 720,
    height = 220,
    pad = 18;
  const max = Math.max(1, ...rows.flatMap((row) => [row.issuedCount, row.failedCount]));
  const rates = rows.map((row) => {
    const total = row.issuedCount + row.failedCount + row.inProgressCount;
    return total ? row.failedCount / total : 0;
  });
  const rateMax = Math.max(0.01, ...rates);
  const points = (values: number[], ceiling: number) =>
    values
      .map(
        (value, i) =>
          `${pad + (i / Math.max(values.length - 1, 1)) * (width - pad * 2)},${height - pad - (value / ceiling) * (height - pad * 2)}`,
      )
      .join(" ");

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-[150px] w-full"
        role="img"
        aria-label="최근 24시간 발급 처리량과 실패율"
      >
        {[0.25, 0.5, 0.75].map((r) => (
          <line
            key={r}
            x1={pad}
            x2={width - pad}
            y1={height * r}
            y2={height * r}
            vectorEffect="non-scaling-stroke"
            className="stroke-hairline dark:stroke-ops-border"
          />
        ))}
        <polyline points={points(rows.map((v) => v.issuedCount), max)} fill="none" stroke="#2379c9" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <polyline points={points(rows.map((v) => v.failedCount), max)} fill="none" stroke="#cf3e40" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <polyline points={points(rates, rateMax)} fill="none" stroke="#8a5a00" strokeWidth="2" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="-mt-1 flex justify-between text-[11px] text-ink/50 dark:text-ops-muted">
        {rows
          .filter((_, i) => i % 4 === 0 || i === rows.length - 1)
          .map((v) => (
            <span key={v.bucket}>{v.bucket.slice(11, 16)}</span>
          ))}
      </div>
      <div className="mt-3 flex gap-5 text-[13px]">
        <span className="text-[#2379c9]">━ 발급</span>
        <span className="text-[#cf3e40]">━ 실패</span>
        <span className="text-[#8a5a00]">┅ 실패율</span>
      </div>
    </div>
  );
}

export function ThroughputChart({
  statistics,
  loading,
}: {
  statistics: IssueStatisticsResponse | null;
  loading: boolean;
}) {
  return (
    <article className={panel}>
      <h2>발급 처리량 · 실패율</h2>
      <p className="mt-1 text-ink/55 dark:text-ops-muted">최근 24시간</p>
      <div className="mt-3">
        {statistics ? (
          <ThroughputLines data={statistics} />
        ) : (
          <p className="py-12 text-center text-ink/50">{loading ? "불러오는 중…" : "데이터가 없습니다."}</p>
        )}
      </div>
    </article>
  );
}
