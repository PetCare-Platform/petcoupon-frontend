import { useState, type FormEvent } from "react";
import { Layout } from "../../components/Layout";
import { Eyebrow, FieldGroup, MetricGrid, MetricTile, StatusPill, inputClass } from "../../components/ui";
import { resetLoadTestStock } from "../../api/internal";
import { ApiError, NetworkError } from "../../api/http";
import type { CouponResetResponse } from "../../types/api";

export default function LoadTestReset() {
  const [couponId, setCouponId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CouponResetResponse | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const parsedCouponId = Number(couponId);
    const parsedQuantity = quantity ? Number(quantity) : undefined;
    if (!Number.isInteger(parsedCouponId) || parsedCouponId <= 0) {
      setError("쿠폰 ID는 1 이상의 정수로 입력해 주세요.");
      return;
    }
    if (parsedQuantity !== undefined && (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0)) {
      setError("재고 수량은 1 이상의 정수로 입력해 주세요.");
      return;
    }

    setSubmitting(true);
    setError("");
    setResult(null);
    try {
      const response = await resetLoadTestStock(parsedCouponId, parsedQuantity === undefined ? {} : { totalQuantity: parsedQuantity });
      setResult(response);
    } catch (err) {
      setError(err instanceof ApiError || err instanceof NetworkError ? err.message : "초기화 요청을 처리하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout area="internal" page="load-test-reset">
      <section className="py-10">
        <div className="container-page">
          <Eyebrow>내부 운영 · 실제 API 도구</Eyebrow>
          <h1 className="mt-3 max-w-5xl text-balance">부하 테스트 데이터를 안전하게 초기화합니다.</h1>
          <p className="mt-4 max-w-3xl text-[18px] text-ink-muted dark:text-ops-muted">개발 환경에서만 등록되는 재고 초기화 API를 호출합니다. 발급 이력과 관련 테스트 데이터를 삭제하므로 대상 쿠폰 ID를 확인하세요.</p>
        </div>
      </section>

      <section className="pb-20">
        <div className="container-page grid gap-6 lg:grid-cols-[5fr_7fr]">
          <form onSubmit={handleSubmit} className="rounded-[2rem] border border-hairline bg-white p-6 text-ink shadow-[0_22px_60px_-42px_rgba(23,36,58,0.4)] md:p-8">
            <div className="mb-6 flex items-center justify-between"><h2 className="text-2xl">초기화 대상</h2><StatusPill tone="warning">개발 환경 전용</StatusPill></div>
            <div className="space-y-5">
              <FieldGroup label="쿠폰 ID" htmlFor="reset-coupon-id" error={error || undefined} help="초기화할 쿠폰의 숫자 ID">
                <input id="reset-coupon-id" name="couponId" type="number" min={1} inputMode="numeric" className={inputClass} value={couponId} onChange={(event) => setCouponId(event.target.value)} />
              </FieldGroup>
              <FieldGroup label="새 총 재고" htmlFor="reset-quantity" help="비워 두면 API 기본값을 사용합니다.">
                <input id="reset-quantity" name="totalQuantity" type="number" min={1} inputMode="numeric" className={inputClass} value={quantity} onChange={(event) => setQuantity(event.target.value)} />
              </FieldGroup>
            </div>
            <button type="submit" disabled={submitting} className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-6 text-[18px] font-semibold text-white hover:bg-accent-ink disabled:cursor-wait disabled:opacity-60">{submitting ? "초기화하는 중…" : "테스트 데이터 초기화"}</button>
          </form>

          <div className="rounded-[2rem] bg-sky/45 p-6 text-ink md:p-8">
            <p className="text-sm font-bold text-accent-ink">API 응답</p>
            <h2 className="mt-2">초기화 결과</h2>
            {result ? <div className="mt-7"><MetricGrid cols={3}><MetricTile label="남은 재고" value={result.remainingQuantity} tone="success" /><MetricTile label="삭제된 발급" value={result.deletedIssues} /><MetricTile label="삭제된 메시지" value={result.deletedMessages} /><MetricTile label="삭제된 이력" value={result.deletedHistories} /><MetricTile label="멱등키" value={result.deletedIdempotencyKeys} /><MetricTile label="알림" value={result.deletedNotifications} /></MetricGrid></div> : <div className="mt-8 rounded-[1.5rem] border border-dashed border-ink/20 bg-white/60 p-8 text-center text-ink-muted">초기화를 실행하면 삭제 건수와 새 재고가 여기에 표시됩니다.</div>}
          </div>
        </div>
      </section>
    </Layout>
  );
}
