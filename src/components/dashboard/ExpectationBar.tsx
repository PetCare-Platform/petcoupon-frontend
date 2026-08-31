import { fmt } from "./shared";
import type { CouponListResponse, CouponLoadTestStatusResponse } from "../../types/api";

export type Verdict = {
  label: string;
  tone: "success" | "danger" | "neutral";
};

/**
 * 종합 판정. HTTP 응답만 세면 Redis 재고 차감은 통과했는데 DB 확정이 실패한 유실을
 * 놓치므로, `DB 확정 = 재고 통과`를 조건에 포함한다.
 *
 * 우선순위 — 초과 발급 > 중복 발급 > (발급 진행 중) > 유실 > 순번 누락 > 정상 방어.
 * 초과 발급이 가장 위인 이유는 그게 선착순 시스템의 실패 그 자체이기 때문이다.
 *
 * 유실과 순번은 파이프라인에 처리 중인 요청이 남아 있는 동안 판정하지 않는다. 컨슈머가
 * coupon_issue 저장과 issue_message CONSUMED 확정을 서로 다른 트랜잭션으로 처리해서,
 * 부하가 도는 내내 passed > consumed가 정상적으로 벌어져 있기 때문이다(순번도 같은 이유로
 * 중간엔 비어 보인다). 소진된 뒤에도 남아 있는 차이만 진짜 유실이다.
 *
 * 초과 발급과 중복 발급은 진행 중에도 판정한다 — 둘은 도중에 나타나도 그 자체로 결함이고,
 * 잔여가 빠진다고 사라지지 않는다.
 */
export function judge(status: CouponLoadTestStatusResponse | null): Verdict {
  if (status === null) return { label: "—", tone: "neutral" };
  if (status.accepted === 0) return { label: "실행 전", tone: "neutral" };
  if (status.overIssued) return { label: "초과 발급 감지", tone: "danger" };
  if (status.duplicateUsers > 0) return { label: "중복 발급 감지", tone: "danger" };

  const inFlight = status.pending + status.sent + status.inProgressIdempotencyKeys > 0;
  if (inFlight) return { label: "발급 진행 중", tone: "neutral" };

  if (status.consumed !== status.passed) return { label: "유실 감지", tone: "danger" };
  if (!status.sequenceIntact) return { label: "순번 누락", tone: "danger" };
  return { label: "정상 방어", tone: "success" };
}

export function ExpectationBar({
  coupon,
  status,
}: {
  coupon: CouponListResponse | undefined;
  status: CouponLoadTestStatusResponse | null;
}) {
  const verdict = judge(status);
  const stock = coupon?.totalQuantity ?? 0;
  // 접수 수가 아직 없으면 기대값을 재고 기준으로만 보여준다.
  const participants = status && status.accepted > 0 ? status.accepted : null;
  const soldOutExpected = participants !== null ? Math.max(participants - stock, 0) : null;

  const tone =
    verdict.tone === "success"
      ? "bg-success/10 text-[#087c13]"
      : verdict.tone === "danger"
        ? "bg-danger/10 text-danger"
        : "bg-surface-2 text-ink/60";

  return (
    <div className="container-page">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-block bg-surface-2 px-4 py-1">
        <span className="flex-none text-[12px] text-ink/55">기대</span>
        <span className="text-[13px]">
          재고 <strong className="font-semibold tabular-nums">{fmt(stock)}</strong>장
          {participants !== null ? (
            <>
              {" · "}참여 <strong className="font-semibold tabular-nums">{fmt(participants)}</strong>명
              {" → "}
              <strong className="font-semibold tabular-nums">{fmt(Math.min(participants, stock))}</strong> 승인 +{" "}
              <strong className="font-semibold tabular-nums">{fmt(soldOutExpected ?? 0)}</strong> 소진 = 초과 발급{" "}
              <strong className="font-semibold">0</strong>
            </>
          ) : (
            <span className="text-ink/55"> · 부하 테스트를 실행하면 기대값이 채워집니다</span>
          )}
        </span>
        <span className="ml-auto flex flex-none items-center gap-2">
          <span className="text-[12px] text-ink/55">판정</span>
          <span className={`rounded-control px-3 py-1 text-[14px] font-semibold ${tone}`}>{verdict.label}</span>
        </span>
      </div>
    </div>
  );
}
