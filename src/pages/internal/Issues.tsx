import { useState, type FormEvent } from "react";
import { Layout } from "../../components/Layout";
import { EmptyState, Eyebrow, FieldGroup, StatusPill, TextLink, inputClass } from "../../components/ui";
import { useToast } from "../../context/ToastContext";

const DEMO_REQUEST_ID = "REQ-20260821-8F3A21";
const reveal = (i: number) => ({ animationDelay: `${i * 70}ms` });

const PIPELINE = [
  { step: "01", title: "요청 수신", detail: "요청 해시 생성 · 12ms", time: "09:14:22.184" },
  { step: "02", title: "멱등성 검증", detail: "새 요청 확인 · 18ms", tag: "SUCCEEDED" },
  { step: "03", title: "재고 선점", detail: "잔여 285 → 284 · 31ms", tag: "SEQUENCE 216" },
  { step: "04", title: "발급 저장", detail: "CouponIssue #1042 · 89ms", tag: "ISSUED" },
  { step: "05", title: "알림 전송", detail: "Push 채널 · 34ms", tag: "SENT" },
];

const RECORDS = [
  { title: "IdempotencyKey", tone: "open" as const, status: "SUCCEEDED", rows: [["key", "issue:10:1:8f3a21"], ["request hash", "sha256:c7a9…4d21"], ["expires at", "09:14:52.184"]] },
  { title: "IssueMessage", tone: "open" as const, status: "CONSUMED", rows: [["message ID", "#88412"], ["topic", "coupon.issue.v1"], ["retry count", "0"]] },
  { title: "CouponIssue", tone: "open" as const, status: "ISSUED", rows: [["issue ID", "#1042"], ["coupon code", "PET-7K3M-82QD"], ["expires at", "2026.08.28 23:59"]] },
  { title: "NotificationLog", tone: "open" as const, status: "SENT", rows: [["channel", "PUSH"], ["recipient", "user:1"], ["sent at", "09:14:22.368"]] },
];

export default function Issues() {
  const { showToast } = useToast();
  const [query, setQuery] = useState(DEMO_REQUEST_ID);
  const [submitted, setSubmitted] = useState(DEMO_REQUEST_ID);
  const [error, setError] = useState("");
  const found = submitted === DEMO_REQUEST_ID;

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) {
      setError("필수로 입력해야 하는 항목이에요.");
      showToast("입력 내용을 확인해 주세요.");
      return;
    }
    setError("");
    setSubmitted(query.trim());
    showToast(query.trim() === DEMO_REQUEST_ID ? `${query} 처리 흐름을 조회했습니다.` : `${query} 요청을 찾을 수 없습니다.`);
  }

  return (
    <Layout area="internal" page="issues">
      <section className="py-8 animate-reveal-up">
        <div className="container-page grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <Eyebrow>내부 운영 · 발급 흐름</Eyebrow>
            <h1 className="mt-2">발급 처리 흐름</h1>
            <p className="mt-2 text-[18px] text-ink/70 dark:text-ops-muted">하나의 요청이 받은 순간부터 저장과 알림까지 이동한 경로를 살펴보세요.</p>
          </div>
          <form onSubmit={handleSearch} noValidate className="flex flex-col gap-3 rounded-block border border-hairline p-5 dark:border-white/[0.14] dark:bg-ops-surface sm:flex-row sm:items-end">
            <div className="flex-1">
              <FieldGroup label="요청 식별자" htmlFor="issue-query" error={error}>
                <input id="issue-query" type="search" className={inputClass} value={query} onChange={(e) => setQuery(e.target.value)} aria-invalid={!!error} />
              </FieldGroup>
            </div>
            <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink bg-ink px-5 text-[18px] font-medium text-paper transition-all active:scale-[0.97] hover:bg-[#262626] dark:border-ops-ink dark:bg-ops-ink dark:text-ops-bg">
              흐름 조회
            </button>
          </form>
        </div>
      </section>

      {found ? (
        <>
          <section className="py-4 animate-reveal-up" style={reveal(1)}>
            <div className="container-page">
              <div className="rounded-block border border-hairline bg-surface-2 p-6 text-ink md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide">요청 조회 결과</span>
                    <h2 className="mt-1">{submitted}</h2>
                    <p className="mt-1 text-ink-muted">2026.08.21 09:14:22 · 사용자 #1 · 쿠폰 #10</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex min-h-8 items-center rounded-full border border-success/30 bg-success/10 px-2.5 text-xs font-semibold uppercase tracking-wide text-[#0a8f3c]">처리 완료</span>
                    <strong className="mt-1 block font-mono text-xl">184ms</strong>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-hairline pt-4 md:grid-cols-4">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/60">멱등성</dt>
                    <dd className="text-2xl font-bold text-accent-ink">통과</dd>
                    <small className="text-ink-muted">중복 없음</small>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/60">재고 순번</dt>
                    <dd className="text-2xl font-bold">216</dd>
                    <small className="text-ink-muted">잔여 284장</small>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/60">발급 번호</dt>
                    <dd className="text-2xl font-bold">1042</dd>
                    <small className="text-ink-muted">상태 ISSUED</small>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/60">알림</dt>
                    <dd className="text-2xl font-bold text-accent-ink">SENT</dd>
                    <small className="text-ink-muted">Push 전송</small>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-10 animate-reveal-up" style={reveal(2)}>
            <div className="container-page">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Eyebrow>발급 요청 · {submitted}</Eyebrow>
                  <h2 className="mt-1">처리 단계</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    // 실제로 클립보드에 복사하지 않으면서 복사된 것처럼 toast만 띄우던 부분.
                    // 발급 처리 흐름 조회 API는 제외 범위라 지금은 비활성화한다.
                    // showToast("요청 식별자를 복사했습니다.");
                  }}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-hairline px-5 text-[16px] font-medium hover:border-ink hover:bg-surface-soft dark:border-ops-border dark:hover:border-ops-ink dark:hover:bg-ops-surface"
                >
                  Request ID 복사
                </button>
              </div>
              <ol className="grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {PIPELINE.map((step) => (
                  <li key={step.step} className="rounded-control border-t-[3px] border-ink bg-paper p-3.5 dark:border-ops-ink dark:bg-ops-surface">
                    <span className="font-mono text-xs text-ink/50 dark:text-ops-muted">{step.step}</span>
                    <h3 className="mt-1.5 text-base font-semibold">{step.title}</h3>
                    <p className="mt-0.5 text-sm text-ink/60 dark:text-ops-muted">{step.detail}</p>
                    {step.tag ? <span className="mt-1.5 inline-block font-mono text-xs text-ink/50 dark:text-ops-muted">{step.tag}</span> : null}
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section className="py-10 pb-16 animate-reveal-up" style={reveal(3)}>
            <div className="container-page">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2>처리 원장</h2>
                </div>
                <TextLink to="/internal/failures">실패 처리 보기</TextLink>
              </div>
              <div className="grid items-start gap-3 sm:grid-cols-2">
                {RECORDS.map((record) => (
                  <article key={record.title} className="rounded-block border border-hairline p-4 dark:border-white/[0.14] dark:bg-ops-surface">
                    <div className="mb-2.5 flex items-center justify-between">
                      <h3 className="text-base font-semibold">{record.title}</h3>
                      <StatusPill tone={record.tone}>{record.status}</StatusPill>
                    </div>
                    <dl className="grid gap-1.5 text-sm">
                      {record.rows.map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-3">
                          <dt className="text-ink/60 dark:text-ops-muted">{k}</dt>
                          <dd className="truncate font-mono">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="py-10 pb-16 animate-reveal-up" style={reveal(1)}>
          <div className="container-page">
            <EmptyState
              title="요청을 찾을 수 없어요."
              description={`"${submitted}"에 해당하는 발급 요청이 없어요. 요청 식별자를 다시 확인해 주세요.`}
              action={
                <button
                  type="button"
                  onClick={() => {
                    setQuery(DEMO_REQUEST_ID);
                    setSubmitted(DEMO_REQUEST_ID);
                  }}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink bg-ink px-5 text-[16px] font-medium text-paper transition-all active:scale-[0.97] hover:bg-[#262626] dark:border-ops-ink dark:bg-ops-ink dark:text-ops-bg"
                >
                  예시 요청으로 조회
                </button>
              }
            />
          </div>
        </section>
      )}
    </Layout>
  );
}
