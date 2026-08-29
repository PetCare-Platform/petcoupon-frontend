import { panel } from "./shared";
import { StatusPill } from "../ui";
import { RECONCILABLE_STATUSES } from "../../types/api";
import type { CouponPipelineDrainStatusResponse, ReconciliationTriggerResponse } from "../../types/api";

/**
 * 검증 차단 여부. 백엔드가 판정 결과를 안 내려주므로(#193 응답에 blocked 없음)
 * PipelineDrainStatus.isBlocked()와 같은 식을 여기서 다시 만든다.
 *
 * checkFailed는 "잔여 0건"이 아니라 "확인 불가"라 안전하게 차단으로 본다.
 * 백엔드에서 이 규칙이 바뀌면 여기도 함께 고쳐야 한다.
 */
export function isPipelineBlocked(drain: CouponPipelineDrainStatusResponse): boolean {
  return (
    drain.checkFailed ||
    drain.outboxUnconsumed > 0 ||
    drain.streamUndelivered > 0 ||
    drain.streamActivePending > 0
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "danger" | "success" }) {
  return (
    <div className="flex justify-between gap-3 fit-row border-b border-hairline-soft py-1.5 last:border-0 text-[13px]">
      <dt className="text-ink/60">{label}</dt>
      <dd
        className={`font-semibold tabular-nums ${
          tone === "danger" ? "text-danger" : tone === "success" ? "text-[#087c13]" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

export function ReconciliationLauncher({
  drain,
  loading,
  running,
  result,
  error,
  onRun,
}: {
  drain: CouponPipelineDrainStatusResponse | null;
  loading: boolean;
  running: boolean;
  result: ReconciliationTriggerResponse | null;
  error: string;
  onRun: () => void;
}) {
  // `검증 가능한 상태인가`와 `지금 실행 중인가`는 다른 축이다. 하나로 묶으면 실행 중일 때
  // 사유 분기가 기본값까지 흘러내려 파이프라인이 멀쩡한데도 잔여가 남았다고 표시된다.
  const blocked = drain ? isPipelineBlocked(drain) : true;
  // 검증 전제는 "더 이상 발급될 수 없는가"다 — 품절(SOLD_OUT)도 재고가 0이라 새 발급이
  // 생기지 않으므로 종료(ENDED)와 같이 통과시킨다. 백엔드 판정과 맞춘 값이다(#202).
  const notSettled = drain != null && !RECONCILABLE_STATUSES.includes(drain.couponStatus);
  const eligible = drain != null && !blocked && !notSettled;
  const canRun = eligible && !running;

  return (
    <article className={`${panel} flex flex-col`}>
      <div className="mb-3 flex flex-none items-start justify-between gap-2">
        <div>
          <h2>정합성 검증</h2>
          <p className="mt-1 text-ink/55">선택한 쿠폰 기준</p>
        </div>
        {result ? (
          <StatusPill tone={result.result === "MATCHED" ? "open" : "danger"}>{result.result}</StatusPill>
        ) : null}
      </div>

      {drain === null ? (
        <p className="py-6 text-center text-[13px] text-ink/50">{loading ? "불러오는 중…" : "상태를 확인할 수 없습니다."}</p>
      ) : (
        <dl className="min-h-0 flex-1">
          <Row
            label="쿠폰 상태"
            value={drain.couponStatus}
            tone={notSettled ? "danger" : "success"}
          />
          <Row
            label="Outbox 미소비"
            value={drain.outboxUnconsumed.toLocaleString("ko-KR")}
            tone={drain.outboxUnconsumed > 0 ? "danger" : "success"}
          />
          {/* 건수가 아니라 0/1 플래그다 — 숫자로 보여주면 "1건"으로 오독된다. */}
          <Row
            label="Stream 미전달"
            value={drain.streamUndelivered > 0 ? "있음" : "없음"}
            tone={drain.streamUndelivered > 0 ? "danger" : "success"}
          />
          <Row
            label="Stream 처리 중"
            value={drain.streamActivePending.toLocaleString("ko-KR")}
            tone={drain.streamActivePending > 0 ? "danger" : "success"}
          />
          {drain.checkFailed ? <Row label="Redis 확인" value="확인 실패" tone="danger" /> : null}
        </dl>
      )}

      {drain ? (
        <div
          className={`mt-3 rounded-control px-3 py-2 text-[13px] ${
            eligible ? "bg-success/10 text-[#087c13]" : "bg-surface-2 text-ink/70"
          }`}
        >
          {running
            ? "검증 실행 중 — 발급 건수에 따라 몇 초에서 몇십 초 걸립니다."
            : eligible
              ? "검증 가능"
              : notSettled
                ? `검증 불가 — 쿠폰이 ${drain.couponStatus} 상태입니다. 재고 소진(SOLD_OUT)이나 발급 종료(ENDED) 후 실행할 수 있습니다.`
                : drain.checkFailed
                  ? "검증 불가 — 파이프라인 잔여를 확인할 수 없습니다."
                  : "검증 불가 — 파이프라인에 처리 안 된 요청이 남아 있습니다."}
        </div>
      ) : null}

      {error ? <p className="mt-2 text-[13px] text-danger">{error}</p> : null}

      <button
        type="button"
        onClick={onRun}
        disabled={!canRun}
        className="mt-2 inline-flex min-h-9 w-full items-center justify-center rounded-full border border-ink bg-ink px-4 text-[14px] font-medium text-paper disabled:opacity-50"
      >
        {running ? "검증 중…" : "검증 실행"}
      </button>

      {result ? (
        <p className="mt-2 text-[12px] text-ink/55">
          REPORT #{result.reportId} · 대상 {result.totalCount.toLocaleString("ko-KR")}건 · 불일치{" "}
          {result.verificationDetailCount.toLocaleString("ko-KR")}건
        </p>
      ) : null}
    </article>
  );
}
