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
  // 처리 중인 요청이 남아 있으면 단계 간 차이는 아직 유실이 아니다 — 컨슈머가 coupon_issue
  // 저장과 CONSUMED 확정을 다른 트랜잭션으로 처리해서 부하 중에는 정상적으로 벌어져 있다.
  const inFlight = status.pending + status.sent + status.inProgressIdempotencyKeys > 0;

  const rows: { label: string; value: number; note?: string; color: string; danger?: boolean }[] = [
    { label: "접수", value: status.accepted, color: "#B5D4F4" },
    {
      label: "재고 통과",
      // Redis 가 실제로 통과시킨 수. passed(coupon_issue)를 쓰면 파이프라인 맨 끝 값이라
      // 아래 Kafka 발행보다 작아져서 상류가 하류보다 적어 보이는 역전이 생긴다.
      // 백엔드 #210 이전 번들·롤백·캐시로 stockPassed 가 없으면 fmt(undefined) 가 TypeError 를
      // 던져 대시보드 트리 전체가 언마운트된다(ErrorBoundary 없음). passed 로 떨어뜨리면
      // 역전은 남지만 화면은 산다.
      value: status.stockPassed ?? status.passed,
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
      danger: !inFlight && status.consumed !== status.passed,
    },
  ];

  const max = Math.max(1, ...rows.map((r) => r.value));

  // 부하 중에는 "확정 대기"를 stockPassed 기준으로 센다 — passed 는 coupon_issue 라
  // consumed 와 거의 같이 올라가서, 깔때기가 벌어져 보이는데 0이 찍힌다.
  // 부하가 끝난 뒤의 손실 판정은 확정된 발급 수(passed)로 봐야 하므로 기준을 나눈다.
  // stockPassed 는 Redis, consumed 는 DB 라 읽는 시점이 달라 순간적으로 음수가 나올 수 있다.
  // "확정 대기 -3" 은 설명할 수 없는 값이라 0 으로 막는다.
  const waiting = Math.max(0, (status.stockPassed ?? status.passed) - status.consumed);
  const lost = status.passed - status.consumed;

  return (
    <article className={panel}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2>발급 파이프라인</h2>
        <p className="text-ink/55">접수부터 DB 확정까지</p>
      </div>

      <div className="grid grid-cols-[72px_1fr_130px] items-center gap-x-3 gap-y-1.5 text-[13px] fit-grid">
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
        <span className={`ml-auto ${!inFlight && lost !== 0 ? "text-danger" : "text-ink/50"}`}>
          {inFlight ? "확정 대기 " : "단계 간 손실 "}
          {fmt(inFlight ? waiting : lost)}
        </span>
      </div>
    </article>
  );
}
