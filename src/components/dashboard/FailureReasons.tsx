import { Link } from "react-router-dom";
import { fmt, panel } from "./shared";
import type { CouponFailureReasonResponse } from "../../types/api";

/**
 * 실패 사유 분류. `재고 소진`은 실패가 아니라 선착순이 제대로 동작한 증거라
 * `이상 실패`와 한 줄에 섞으면 10,000 같은 큰 숫자가 문제처럼 보인다. 갈라 놓는다.
 *
 * 백엔드가 내려주는 분류는 원안보다 좁다 — EVENT_NOT_OPEN·EVENT_CLOSED는 멱등키
 * 등록 전에 Fail-Fast로 끝나 저장되지 않고, failures도 발생 지점 2개만 있다.
 */
export function FailureReasons({ reasons }: { reasons: CouponFailureReasonResponse }) {
  const abnormal = reasons.failures.kafkaPublishFailed + reasons.failures.consumeProcessingFailed;

  const normalItems = [
    { label: "재고 소진", value: reasons.rejections.soldOut },
    { label: "중복 발급", value: reasons.rejections.alreadyIssued },
  ];
  const failureItems = [
    { label: "Kafka 발행 실패", value: reasons.failures.kafkaPublishFailed },
    { label: "소비 처리 실패", value: reasons.failures.consumeProcessingFailed },
  ];

  return (
    <article className={`${panel} ${abnormal > 0 ? "border-danger/40" : ""}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2>실패 사유 분류</h2>
        <Link to="/internal/failures" className="text-sm underline underline-offset-4">
          실패 처리
        </Link>
      </div>

      <div className="grid gap-x-4 gap-y-2 sm:grid-cols-[68px_1fr] sm:items-center">
        <span className="text-[11px] text-ink/60">정상 탈락</span>
        <div className="flex flex-wrap gap-1.5">
          {normalItems.map((item) => (
            <span key={item.label} className="rounded-control bg-surface-2 px-2.5 py-1 text-[12px]">
              {item.label} <strong className="font-semibold tabular-nums">{fmt(item.value)}</strong>
            </span>
          ))}
        </div>

        <span className={`text-[11px] ${abnormal > 0 ? "text-danger" : "text-ink/60"}`}>이상 실패</span>
        <div className="flex flex-wrap gap-1.5">
          {failureItems.map((item) => (
            <span
              key={item.label}
              className={`rounded-control px-2.5 py-1 text-[12px] ${
                item.value > 0 ? "bg-danger/10 text-danger" : "bg-surface-2"
              }`}
            >
              {item.label} <strong className="font-semibold tabular-nums">{fmt(item.value)}</strong>
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
