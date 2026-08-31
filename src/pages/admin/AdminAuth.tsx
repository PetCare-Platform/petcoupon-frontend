import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { AREA_ROUTES } from "../../routes";
import { Eyebrow, FieldGroup, inputClass } from "../../components/ui";
import { createAdminSession, deleteAdminSession } from "../../api/adminAuth";
import { getAdminSessionToken } from "../../api/adminSession";
import { ApiError, NetworkError } from "../../api/http";

export default function AdminAuth() {
  const navigate = useNavigate();
  const [authCode, setAuthCode] = useState("");
  const [active, setActive] = useState(Boolean(getAdminSessionToken()));
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    if (!authCode.trim()) { setError("관리자 인증 코드를 입력해 주세요."); return; }
    setSubmitting(true); setError("");
    try {
      const response = await createAdminSession(authCode.trim());
      setActive(true); setExpiresAt(response.expiresAt); setAuthCode("");
      // 인증 직후 곧장 대시보드로 보낸다. 뒤로 가기로 인증 화면에 되돌아올 이유가 없어 replace를 쓴다.
      navigate(AREA_ROUTES.internal.home, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError || err instanceof NetworkError ? err.message : "관리자 세션을 발급하지 못했습니다.");
    } finally { setSubmitting(false); }
  }

  async function handleLogout() {
    setSubmitting(true); setError("");
    try { await deleteAdminSession(); }
    catch (err) { setError(err instanceof ApiError || err instanceof NetworkError ? `${err.message} 로컬 세션은 종료했습니다.` : "서버 세션 폐기를 확인하지 못했지만 로컬 세션은 종료했습니다."); }
    finally { setActive(false); setExpiresAt(""); setSubmitting(false); }
  }

  return <Layout area="admin"><section className="py-10"><div className="container-page max-w-xl">
    <Eyebrow>관리자 · 실제 인증 API</Eyebrow><h1 className="mt-2">관리자 인증</h1>
    <p className="mt-3 text-ink-muted">인증 코드는 저장하지 않으며, 발급된 세션 토큰만 현재 탭의 sessionStorage에 보관합니다.</p>
    <div className="mt-8 rounded-block border border-hairline bg-white p-6">
      {active ? <div><strong className="text-xl">관리자 세션이 활성화됐습니다.</strong>{expiresAt ? <p className="mt-2 text-ink-muted">만료 시각 {expiresAt}</p> : null}<button type="button" disabled={submitting} onClick={handleLogout} className="mt-6 rounded-full bg-ink px-5 py-3 text-white">세션 종료</button></div>
      : <form onSubmit={handleLogin} className="grid gap-5"><FieldGroup label="관리자 인증 코드" htmlFor="admin-auth-code" error={error || undefined}><input id="admin-auth-code" type="password" autoComplete="off" className={inputClass} value={authCode} onChange={(event)=>setAuthCode(event.target.value)} /></FieldGroup><button type="submit" disabled={submitting} className="rounded-full bg-ink px-5 py-3 text-white disabled:opacity-60">{submitting ? "인증 중…" : "세션 발급"}</button></form>}
    </div>
  </div></section></Layout>;
}
