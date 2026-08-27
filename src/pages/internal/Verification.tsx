import { useState, type FormEvent } from "react";
import { Layout } from "../../components/Layout";
import { Eyebrow, FieldGroup, MetricGrid, MetricTile, inputClass } from "../../components/ui";
import { triggerReconciliation } from "../../api/adminOperations";
import { ApiError, NetworkError } from "../../api/http";
import type { ReconciliationTriggerResponse } from "../../types/api";

export default function Verification() {
  const [couponId, setCouponId] = useState("");
  const [result, setResult] = useState<ReconciliationTriggerResponse | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  async function handleSubmit(event: FormEvent) {
    event.preventDefault(); const id=Number(couponId);
    if (!Number.isInteger(id) || id<=0) { setError("쿠폰 ID는 1 이상의 정수로 입력해 주세요."); return; }
    setSubmitting(true); setError(""); setResult(null);
    try { setResult(await triggerReconciliation(id)); }
    catch (err) { setError(err instanceof ApiError || err instanceof NetworkError ? err.message : "정합성 검증을 실행하지 못했습니다."); }
    finally { setSubmitting(false); }
  }
  return <Layout area="internal" page="verification"><section className="py-8"><div className="container-page"><Eyebrow>내부 운영 · 실제 정합성 API</Eyebrow><h1 className="mt-2">정합성 검증</h1><p className="mt-2 text-ops-muted">쿠폰 단위로 원장 정합성 검증을 즉시 실행합니다.</p></div></section>
    <section className="pb-16 pt-4"><div className="container-page grid gap-6 lg:grid-cols-[4fr_8fr]"><form onSubmit={handleSubmit} className="rounded-block border border-ops-border bg-ops-surface p-6"><FieldGroup label="쿠폰 ID" htmlFor="reconcile-coupon-id" error={error || undefined}><input id="reconcile-coupon-id" type="number" min={1} className={inputClass} value={couponId} onChange={(event)=>setCouponId(event.target.value)} /></FieldGroup><button type="submit" disabled={submitting} className="mt-5 w-full rounded-full bg-ops-ink px-5 py-3 text-ops-bg disabled:opacity-50">{submitting ? "검증 중…" : "정합성 검증 실행"}</button></form>
      <div className="rounded-block border border-ops-border bg-ops-surface p-6">{result ? <><div className="mb-5"><Eyebrow>REPORT #{result.reportId}</Eyebrow><h2 className="mt-2">결과 {result.result}</h2><p className="text-ops-muted">기준 시각 {result.asOfAt}</p></div><MetricGrid cols={3}><MetricTile label="전체" value={result.totalCount}/><MetricTile label="정상" value={result.successCount} tone="success"/><MetricTile label="오류" value={result.errorCount} tone={result.errorCount ? "danger" : "success"}/></MetricGrid></> : <p className="text-ops-muted">실행 결과가 여기에 표시됩니다. 관리자 세션이 필요합니다.</p>}</div>
    </div></section></Layout>;
}
