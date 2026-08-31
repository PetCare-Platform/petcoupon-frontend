import { fmt } from "./shared";
import type { CouponListResponse, CouponLoadTestStatusResponse } from "../../types/api";

type Tone = "neutral" | "success" | "danger";

function SummaryCard({ label, value, tone = "neutral" }: { label: string; value: string; tone?: Tone }) {
  const color = tone === "success" ? "text-[#087c13]" : tone === "danger" ? "text-danger" : "text-ink";
  const bg = tone === "success" ? "bg-success/10" : tone === "danger" ? "bg-danger/10" : "bg-surface-2";
  return (
    // 작은 화면에서는 fit-* 가 여백과 숫자를 줄인다(index.css). 다섯 장을 한 줄에 세우는 쪽이
    // 두 줄로 접혀 200px 넘게 차지하는 것보다 낫다.
    <div className={`fit-panel rounded-block border border-hairline p-4 ${bg}`}>
      <p className={`text-[13px] font-medium ${tone === "neutral" ? "text-ink/65" : color}`}>{label}</p>
      <strong className={`fit-metric mt-1 block text-[26px] leading-none tabular-nums ${color}`}>
        {value}
      </strong>
    </div>
  );
}

/**
 * 선착순 발급의 합격 조건을 카드로 세운다 — 주제가 명시한 `초과 발급 0건`,
 * `1인 최대 1매`가 여기 있어야 심사자가 한눈에 판정할 수 있다.
 *
 * 아직 실행 전(accepted=0)이면 0을 초록으로 띄우지 않는다. 통과가 아니라 미실행이다.
 */
export function SummaryCards({
  coupon,
  status,
}: {
  coupon: CouponListResponse | undefined;
  status: CouponLoadTestStatusResponse | null;
}) {
  const notRun = status === null || status.accepted === 0;
  const dash = "—";

  // 색은 백엔드 overIssued 플래그를 쓰므로 숫자도 같은 식으로 센다 —
  // 백엔드: passed > min(accepted, totalQuantity). 재고만 기준으로 삼으면
  // "재고는 안 넘었는데 접수보다 많이 나간" 초과 발급에서 빨간 카드에 0건이 찍힌다.
  const expectedPassed = status ? Math.min(status.accepted, coupon?.totalQuantity ?? 0) : 0;
  const overIssuedCount = status ? Math.max(status.passed - expectedPassed, 0) : 0;

  return (
    // 다섯 장이 한 줄로 서는 시점을 xl(1280)에서 lg(1024)로 당긴다. 사이드바를 뺀 실폭이
    // 800px 남짓이면 다섯 장이 충분히 들어가는데, 예전 기준으로는 2열 3줄이 되면서 이 구역만
    // 295px를 먹어 화면 아래가 잘렸다(한 줄이면 80px).
    <div className="container-page grid gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:gap-4">
      <SummaryCard
        label="재고 / 발급"
        // 발급 수는 consumed(Outbox 소비 건수)가 아니라 passed(실제 coupon_issue 행)다 —
        // 옆 카드의 초과 발급 판정과 기준을 맞춘다. consumed와의 차이(유실)는 판정 배지와
        // 깔때기의 `단계 간 손실`이 이미 잡는다.
        value={coupon ? `${fmt(coupon.totalQuantity)} / ${status ? fmt(status.passed) : dash}` : dash}
      />
      <SummaryCard
        label="초과 발급"
        value={notRun ? dash : `${fmt(overIssuedCount)}건`}
        tone={notRun ? "neutral" : status!.overIssued ? "danger" : "success"}
      />
      <SummaryCard
        label="1인 2매"
        value={notRun ? dash : `${fmt(status!.duplicateUsers)}명`}
        tone={notRun ? "neutral" : status!.duplicateUsers > 0 ? "danger" : "success"}
      />
      <SummaryCard
        label="순번 1..N"
        value={notRun ? dash : status!.sequenceIntact ? "온전" : "누락"}
        tone={notRun ? "neutral" : status!.sequenceIntact ? "success" : "danger"}
      />
      <SummaryCard
        label="확정 소요"
        value={notRun ? dash : `${fmt(status!.elapsedSeconds)}초`}
      />
    </div>
  );
}
