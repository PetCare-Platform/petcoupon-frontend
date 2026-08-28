import { useCallback, useEffect, useState } from "react";
import { Layout } from "../../components/Layout";
import { Eyebrow, StatusPill } from "../../components/ui";
import { listDlqMessages, reprocessDlqMessage } from "../../api/adminOperations";
import { ApiError, NetworkError } from "../../api/http";
import type { CouponIssueDlqResponse } from "../../types/api";

export default function Failures() {
  const [messages, setMessages] = useState<CouponIssueDlqResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError("");
    try { setMessages(await listDlqMessages(signal)); }
    catch (err) { if (!(err instanceof DOMException && err.name === "AbortError")) setError(err instanceof ApiError || err instanceof NetworkError ? err.message : "DLQ를 불러오지 못했습니다."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load]);
  async function handleReprocess(messageId: number) {
    setProcessingId(messageId); setError("");
    try { await reprocessDlqMessage(messageId); await load(); }
    catch (err) { setError(err instanceof ApiError || err instanceof NetworkError ? err.message : "재처리하지 못했습니다."); }
    finally { setProcessingId(null); }
  }
  return <Layout area="internal" page="failures">
    <section className="py-8"><div className="container-page"><Eyebrow>내부 운영 · 실제 DLQ API</Eyebrow><h1 className="mt-2">실패 처리</h1><p className="mt-2 text-ops-muted">격리된 발급 메시지를 확인하고 안전하게 수동 재처리합니다.</p></div></section>
    <section className="pb-16 pt-4"><div className="container-page">
      <div className="mb-5 flex items-center justify-between"><div><h2>DLQ 메시지</h2><p className="text-ops-muted">{loading ? "조회 중…" : `${messages.length}건`}</p></div><button type="button" onClick={()=>void load()} className="rounded-full border border-ops-border px-4 py-2">새로고침</button></div>
      {error ? <p className="mb-4 rounded-control border border-danger/40 bg-danger/10 p-4 text-danger">{error} 관리자 인증 세션을 확인하세요.</p> : null}
      <div className="overflow-x-auto rounded-block border border-ops-border"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-ops-border text-ops-muted"><tr><th className="p-4">메시지</th><th className="p-4">쿠폰/사용자</th><th className="p-4">재시도</th><th className="p-4">마지막 오류</th><th className="p-4">생성 시각</th><th className="p-4">작업</th></tr></thead><tbody>
        {messages.map((message)=><tr key={message.messageId} className="border-b border-ops-border-soft last:border-0"><td className="p-4"><strong>#{message.messageId}</strong><small className="block text-ops-muted">{message.requestId}</small></td><td className="p-4">쿠폰 {message.couponId}<br/>사용자 {message.userId}</td><td className="p-4"><StatusPill tone="warning">{message.retryCount}회</StatusPill></td><td className="max-w-sm p-4 font-mono text-xs">{message.lastError}</td><td className="p-4 text-ops-muted">{message.createdAt}</td><td className="p-4"><button type="button" disabled={processingId===message.messageId} onClick={()=>void handleReprocess(message.messageId)} className="font-medium underline underline-offset-4 disabled:opacity-50">{processingId===message.messageId ? "재처리 중…" : "재처리"}</button></td></tr>)}
        {!loading && messages.length===0 ? <tr><td colSpan={6} className="p-10 text-center text-ops-muted">DLQ 메시지가 없습니다.</td></tr> : null}
      </tbody></table></div>
    </div></section>
  </Layout>;
}
