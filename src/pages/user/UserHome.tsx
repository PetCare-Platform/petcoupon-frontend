import { useEffect, useState, type FormEvent } from "react";
import { Layout } from "../../components/Layout";
import { Eyebrow, FieldGroup, LinkButton, inputClass } from "../../components/ui";
import { useToast } from "../../context/ToastContext";
import { clearCurrentUserId, getCurrentUserId, setCurrentUserId, subscribeCurrentUserId } from "../../api/currentUser";

export default function UserHome() {
  const { showToast } = useToast();
  const [userId, setUserId] = useState<number | null>(() => getCurrentUserId());
  const [draft, setDraft] = useState(() => {
    const current = getCurrentUserId();
    return current === null ? "" : String(current);
  });
  const [error, setError] = useState("");

  useEffect(() => subscribeCurrentUserId(() => setUserId(getCurrentUserId())), []);

  function handleSave(event: FormEvent) {
    event.preventDefault();
    const parsed = Number(draft.trim());
    if (!Number.isInteger(parsed) || parsed <= 0) {
      setError("1 이상의 정수 사용자 ID를 입력해 주세요.");
      return;
    }
    setError("");
    setCurrentUserId(parsed);
    showToast(`사용자 ID를 ${parsed}(으)로 설정했습니다.`);
  }

  function handleClear() {
    clearCurrentUserId();
    setDraft("");
    setError("");
    showToast("사용자 ID를 해제했습니다.");
  }

  return (
    <Layout area="user" page="user">
      <section className="py-10">
        <div className="container-page max-w-xl">
          <Eyebrow>사용자 정보 · 로그인 없음</Eyebrow>
          <h1 className="mt-2">사용자 ID 설정</h1>
          <p className="mt-3 text-[18px] text-ink/70">
            이 서비스에는 회원가입/로그인이 없습니다. 여기서 설정한 사용자 ID를 쿠폰 발급과 보유 쿠폰 조회에 사용하는
            단순 식별값으로만 씁니다. (인증 토큰이 아닙니다.)
          </p>
        </div>
      </section>

      <section className="py-4">
        <div className="container-page max-w-xl">
          <div className="rounded-block border border-hairline bg-white p-6">
            <div className="flex items-center justify-between gap-4 border-b border-hairline pb-4">
              <span className="text-sm text-ink/60">현재 사용자 ID</span>
              <strong className="text-2xl tabular-nums">{userId === null ? "미설정" : userId}</strong>
            </div>

            <form onSubmit={handleSave} noValidate className="mt-6 grid gap-5">
              <FieldGroup
                label="사용자 ID"
                htmlFor="user-id"
                error={error || undefined}
                help="백엔드에 존재하는 사용자 번호를 입력하세요. 예: 1"
              >
                <input
                  id="user-id"
                  type="number"
                  min={1}
                  inputMode="numeric"
                  autoComplete="off"
                  className={inputClass}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  aria-invalid={!!error}
                />
              </FieldGroup>
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="rounded-full bg-ink px-5 py-3 text-[16px] font-medium text-white transition-colors hover:bg-ink-muted">
                  사용자 ID 저장
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={userId === null}
                  className="rounded-full border border-ink px-5 py-3 text-[16px] font-medium transition-colors hover:bg-surface-soft disabled:cursor-not-allowed disabled:border-hairline disabled:text-ink-muted"
                >
                  사용자 ID 해제
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6">
            <LinkButton to="/user/my-coupons" variant="secondary">
              보유 쿠폰 보기
            </LinkButton>
          </div>
        </div>
      </section>
    </Layout>
  );
}
