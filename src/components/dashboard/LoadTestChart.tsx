import { fmt, panel } from "./shared";
import type { CouponIssueTimeSeriesResponse } from "../../types/api";

/**
 * 짧은 구간 발급 추이. 24시간 시계열로는 수십 초짜리 부하 테스트가 한 칸에 뭉개져서,
 * 백엔드 #198의 초 단위 시계열(기본 90초 창 · 5초 버킷)을 쓴다.
 *
 * viewBox 비율을 지키면 좌우가 비고 아래 시각 라벨과 어긋나므로 preserveAspectRatio="none"으로
 * 박스를 채우고, 선 굵기는 vector-effect로 고정한다.
 *
 * 세로축 눈금은 SVG 밖에 HTML로 그린다 — preserveAspectRatio="none"이 박스를 늘일 때
 * 안에 있는 text까지 같이 찌그러지기 때문이다.
 */
function Lines({ data }: { data: CouponIssueTimeSeriesResponse }) {
  const rows = data.timeSeries;
  const width = 720;
  const height = 220;
  const pad = 18;
  const max = Math.max(1, ...rows.flatMap((r) => [r.issuedCount, r.failedCount, r.inProgressCount]));

  const yFor = (value: number) => height - pad - (value / max) * (height - pad * 2);
  const points = (values: number[]) =>
    values
      .map((value, i) => `${pad + (i / Math.max(values.length - 1, 1)) * (width - pad * 2)},${yFor(value)}`)
      .join(" ");

  // 눈금은 값 기준으로 긋는다. 높이 비율(0.25/0.5/0.75)로 그으면 pad 때문에 선과 숫자가
  // 어긋난다. 최댓값이 작을 때는 반올림 후 같은 숫자가 겹치므로 양 끝만 남긴다.
  const fractions = max < 4 ? [0, 1] : [0, 0.25, 0.5, 0.75, 1];
  const ticks = fractions.map((f) => ({ f, value: Math.round(max * f), y: yFor(max * f) }));

  // 라벨은 양 끝과 중간만 — 5초 버킷이면 18개라 전부 찍으면 겹친다.
  //
  // 라벨은 justify-between으로 균등 배치되므로, 고른 간격으로 골라야 위치가 데이터와 얼추
  // 맞는다. 18개/step 4면 0·4·8·12·16에 마지막 17이 붙어 마지막 두 칸만 1버킷 간격인데도
  // 다른 칸과 같은 폭으로 그려진다 — 그래서 끝이 너무 가까우면 직전 것을 버리고 끝을 남긴다.
  const labelStep = Math.max(1, Math.ceil(rows.length / 5));
  const last = rows.length - 1;
  const labelIndexes = rows
    .map((_, i) => i)
    .filter((i) => i % labelStep === 0 || i === last)
    .filter((i, idx, all) => {
      const next = all[idx + 1];
      return next === undefined || next - i >= labelStep / 2;
    });

  return (
    // 패널이 옆 카드 높이에 맞춰 늘어나므로 세로를 flex로 채운다 — 고정 높이로 두면
    // 그래프가 위에 몰리고 아래가 비어 보인다.
    <div className="flex h-full flex-col">
      <div className="flex min-h-0 flex-1 gap-1">
        <div className="relative w-9 shrink-0 text-[11px] tabular-nums text-ink/50">
          {ticks.map((t) => (
            <span
              key={t.f}
              className="absolute right-0 -translate-y-1/2 whitespace-nowrap"
              style={{ top: `${(t.y / height) * 100}%` }}
            >
              {fmt(t.value)}
            </span>
          ))}
        </div>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="h-full w-full"
          role="img"
          aria-label={`최근 ${data.windowSeconds}초 발급 추이 — ${data.bucketSeconds}초당 건수, 최대 ${fmt(max)}건`}
        >
          {ticks.map((t) => (
            <line
              key={t.f}
              x1={pad}
              x2={width - pad}
              y1={t.y}
              y2={t.y}
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
      </div>
      {/* 세로축 눈금 폭(w-9)만큼 밀어야 시각 라벨이 그래프와 맞는다 */}
      <div className="-mt-1 flex justify-between pl-10 text-[11px] text-ink/50">
        {labelIndexes.map((i) => (
          <span key={rows[i].bucket}>{rows[i].bucket.slice(11, 19)}</span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[13px]">
        <span className="text-[#2379c9]">━ 발급</span>
        <span className="text-[#8a5a00]">┅ 처리 중</span>
        <span className="text-[#cf3e40]">━ 실패</span>
        <span className="text-ink/50">세로 = {data.bucketSeconds}초당 건수</span>
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
    <article className={`${panel} flex h-full flex-col`}>
      <div className="flex items-baseline justify-between gap-3">
        <h2>부하 테스트 실황</h2>
        <p className="text-ink/55">
          {series ? `최근 ${series.windowSeconds}초 · ${series.bucketSeconds}초 단위` : "최근 90초 · 5초 단위"}
        </p>
      </div>
      <div className="mt-3 flex min-h-0 flex-1 flex-col">
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
