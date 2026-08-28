import { panel } from "./shared";
import type { CouponIssueTimeSeriesResponse } from "../../types/api";

/**
 * 짧은 구간 발급 추이. 24시간 시계열로는 수십 초짜리 부하 테스트가 한 칸에 뭉개져서,
 * 백엔드 #198의 초 단위 시계열(기본 90초 창 · 5초 버킷)을 쓴다.
 *
 * viewBox 비율을 지키면 좌우가 비고 아래 시각 라벨과 어긋나므로 preserveAspectRatio="none"으로
 * 박스를 채우고, 선 굵기는 vector-effect로 고정한다.
 */
function Lines({ data }: { data: CouponIssueTimeSeriesResponse }) {
  const rows = data.timeSeries;
  const width = 720;
  const height = 220;
  const pad = 18;
  const max = Math.max(1, ...rows.flatMap((r) => [r.issuedCount, r.failedCount, r.inProgressCount]));
  const points = (values: number[]) =>
    values
      .map(
        (value, i) =>
          `${pad + (i / Math.max(values.length - 1, 1)) * (width - pad * 2)},${height - pad - (value / max) * (height - pad * 2)}`,
      )
      .join(" ");

  // 라벨은 양 끝과 중간만 — 5초 버킷이면 18개라 전부 찍으면 겹친다.
  const labelStep = Math.max(1, Math.ceil(rows.length / 5));

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-[150px] w-full"
        role="img"
        aria-label={`최근 ${data.windowSeconds}초 발급 추이`}
      >
        {[0.25, 0.5, 0.75].map((r) => (
          <line
            key={r}
            x1={pad}
            x2={width - pad}
            y1={height * r}
            y2={height * r}
            vectorEffect="non-scaling-stroke"
            className="stroke-hairline"
          />
        ))}
        <polyline
          points={points(rows.map((r) => r.issuedCount))}
          fill="none"
          stroke="#2379c9"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        <polyline
          points={points(rows.map((r) => r.inProgressCount))}
          fill="none"
          stroke="#8a5a00"
          strokeWidth="2"
          strokeDasharray="5 4"
          vectorEffect="non-scaling-stroke"
        />
        <polyline
          points={points(rows.map((r) => r.failedCount))}
          fill="none"
          stroke="#cf3e40"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="-mt-1 flex justify-between text-[11px] text-ink/50">
        {rows
          .filter((_, i) => i % labelStep === 0 || i === rows.length - 1)
          .map((r) => (
            <span key={r.bucket}>{r.bucket.slice(11, 19)}</span>
          ))}
      </div>
      <div className="mt-3 flex gap-4 text-[13px]">
        <span className="text-[#2379c9]">━ 발급</span>
        <span className="text-[#8a5a00]">┅ 처리 중</span>
        <span className="text-[#cf3e40]">━ 실패</span>
      </div>
    </div>
  );
}

export function LoadTestChart({
  series,
  loading,
}: {
  series: CouponIssueTimeSeriesResponse | null;
  loading: boolean;
}) {
  const empty = series != null && series.timeSeries.every((r) => r.issuedCount + r.failedCount + r.inProgressCount === 0);

  return (
    <article className={panel}>
      <div className="flex items-baseline justify-between gap-3">
        <h2>부하 테스트 실황</h2>
        <p className="text-ink/55">
          {series ? `최근 ${series.windowSeconds}초 · ${series.bucketSeconds}초 단위` : "최근 90초 · 5초 단위"}
        </p>
      </div>
      <div className="mt-3">
        {series && series.timeSeries.length > 0 ? (
          <>
            <Lines data={series} />
            {empty ? <p className="mt-2 text-[12px] text-ink/50">이 구간에 들어온 발급 요청이 없습니다.</p> : null}
          </>
        ) : (
          <p className="py-12 text-center text-ink/50">{loading ? "불러오는 중…" : "데이터가 없습니다."}</p>
        )}
      </div>
    </article>
  );
}
