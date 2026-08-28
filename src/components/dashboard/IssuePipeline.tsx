import { fmt, panel } from "./shared";
import type { CouponLoadTestStatusResponse } from "../../types/api";

/**
 * 발급 파이프라인 깔때기. 도넛이 있던 자리다.
 *
 * 도넛은 전체 대비 비율을 보여주는데, 여기서 중요한 건 비율이 아니라
 * "단계 사이에서 숫자가 줄어드는가"다 — HTTP 202는 접수이지 발급 완료가 아니라서,
 * Redis 통과분이 DB 확정까지 그대로 도달했는지를 봐야 유실을 잡는다.
 */
export function IssuePipeline({
  status,
  loading,
}: {
  status: CouponLoadTestStatusResponse | null;
  loading: boolean;
}) {
  if (status === null) {
    return (
      <article className={panel}>
        <h2>발급 파이프라인</h2>
        <p className="py-10 text-center text-ink/50">{loading ? "불러오는 중…" : "데이터가 없습니다."}</p>
      </article>
    );
  }

  // Outbox 적재는 이 쿠폰의 issue_message 전체다 — 아직 안 나간 것, 나갔지만 미확정,
  // 확정된 것, 실패한 것을 모두 더한다.
  const outbox = status.pending + status.sent + status.consumed + status.failed + status.dlq;

  // Kafka 발행은 백엔드가 세어준 published를 그대로 쓴다(#200). sent+consumed로 직접
  // 계산하면 발행된 뒤 소비에서 실패해 DLQ로 간 건이 빠져서, 발행에 실패한 것처럼
  // 손실 위치를 거꾸로 가리킨다.
  const rows: { label: string; value: number; note?: string; color: string; danger?: boolean }[] = [
    { label: "접수", value: status.accepted, color: "#B5D4F4" },
    {
      label: "재고 통과",
      value: status.passed,
      note: status.rejected > 0 ? `탈락 ${fmt(status.rejected)}` : undefined,
      color: "#85B7EB",
    },
    { label: "Outbox 적재", value: outbox, color: "#6BA5E5" },
    // 이 단계에는 danger를 걸지 않는다. FAILED는 발행에 실패했지만 Outbox 폴러가 다시
    // 집어가는 재시도 대기 상태라, 미달을 곧바로 빨갛게 칠하면 곧 복구될 값에 경보가 뜬다.
    // 최종 손실은 아래 DLQ와 DB 확정이 잡는다.
    { label: "Kafka 발행", value: status.published, color: "#378ADD" },
    {
      label: "DB 확정",
      value: status.consumed,
      color: "#185FA5",
      danger: status.consumed !== status.passed,
    },
  ];

  const max = Math.max(1, ...rows.map((r) => r.value));
  const lost = status.passed - status.consumed;

  return (
    <article className={panel}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2>발급 파이프라인</h2>
        <p className="text-ink/55">접수부터 DB 확정까지</p>
      </div>

      <div className="grid grid-cols-[72px_1fr_130px] items-center gap-x-3 gap-y-1.5 text-[13px]">
        {rows.map((row) => (
          <div key={row.label} className="contents">
            <span className="text-ink/60">{row.label}</span>
            <span className="block h-3.5 rounded-sm bg-hairline-soft">
              <span
                className="block h-full rounded-sm"
                style={{ width: `${(row.value / max) * 100}%`, background: row.color }}
              />
            </span>
            <span className={`text-right tabular-nums ${row.danger ? "text-danger" : ""}`}>
              {fmt(row.value)}
              {row.note ? <span className="ml-1 text-[11px] text-ink/50">{row.note}</span> : null}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-hairline pt-2.5 text-[11px] text-ink/60">
        <span>
          미처리 <span className={status.pending + status.sent > 0 ? "text-clay-ink" : "text-[#087c13]"}>
            {fmt(status.pending + status.sent)}
          </span>
        </span>
        <span>
          DLQ <span className={status.dlq > 0 ? "text-danger" : "text-[#087c13]"}>{fmt(status.dlq)}</span>
        </span>
        <span>
          멱등키 IN_PROGRESS{" "}
          <span className={status.inProgressIdempotencyKeys > 0 ? "text-clay-ink" : "text-[#087c13]"}>
            {fmt(status.inProgressIdempotencyKeys)}
          </span>
        </span>
        <span className={`ml-auto ${lost !== 0 ? "text-danger" : "text-ink/50"}`}>
          단계 간 손실 {fmt(lost)}
        </span>
      </div>
    </article>
  );
}
