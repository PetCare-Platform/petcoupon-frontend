import { Layout } from "../../components/Layout";
import { Eyebrow, LinkButton, MetricGrid, MetricTile, StatusPill, TextLink } from "../../components/ui";
import { useToast } from "../../context/ToastContext";

const PIPELINE = [
  { step: "01", title: "요청 수신", detail: "해시 생성 · 12ms" },
  { step: "02", title: "멱등성 검증", detail: "SUCCEEDED · 18ms" },
  { step: "03", title: "재고 선점", detail: "285→284 · 31ms" },
  { step: "04", title: "발급 저장", detail: "ISSUED · 89ms" },
  { step: "05", title: "알림 전송", detail: "SENT · 34ms" },
];

const COMPONENTS = [
  { name: "Application", role: "HTTP 요청 처리", status: "정상" as const, tone: "open" as const, latency: "42ms" },
  { name: "MySQL", role: "원장과 운영 데이터", status: "정상" as const, tone: "open" as const, latency: "8ms" },
  { name: "Redis", role: "재고와 중복 제어", status: "정상" as const, tone: "open" as const, latency: "3ms" },
  { name: "Kafka", role: "발급 메시지 전달", status: "관찰" as const, tone: "warning" as const, latency: "92ms" },
];

const FAILURES = [
  { tone: "danger" as const, label: "FAILED", id: "#88419", detail: "DB_WRITE_TIMEOUT · 11:38" },
  { tone: "warning" as const, label: "RETRY", id: "#88417", detail: "PUSH_RATE_LIMIT · 11:35" },
  { tone: "neutral" as const, label: "DLQ", id: "#88398", detail: "INVALID_PAYLOAD · 10:52" },
];

export default function Dashboard() {
  const { showToast } = useToast();

  return (
    <Layout area="internal" page="dashboard">
      <section className="py-8">
        <div className="container-page flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>INTERNAL / DASHBOARD</Eyebrow>
            <h1 className="mt-2">내부 운영 대시보드</h1>
            <p className="mt-2 text-ink/70 dark:text-ops-muted">시스템 현황과 발급 처리 흐름, 실패 처리를 한 화면에서 점검하세요.</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => showToast("대시보드를 최신 상태로 갱신했습니다.")}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink bg-ink px-5 text-[18px] font-medium text-paper transition-all active:scale-[0.97] hover:bg-[#262626] dark:border-ops-ink dark:bg-ops-ink dark:text-ops-bg dark:hover:bg-white"
            >
              전체 새로고침
            </button>
            <LinkButton to="/internal/verification" variant="secondary">정합성 검증</LinkButton>
          </div>
        </div>
      </section>

      <section className="py-4">
        <div className="container-page">
          <div className="rounded-block bg-lime p-6 text-[#0f172a] md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="font-mono text-xs uppercase tracking-wide">LIVE PULSE</span>
                <h2 className="mt-1">전체 흐름은 안정적입니다.</h2>
              </div>
              <span className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-[#0f172a]/70">
                <span className="h-3 w-3 animate-live-pulse rounded-full bg-[#0f172a]" aria-hidden="true" /> 마지막 확인 11:42:08
              </span>
            </div>
            <div className="mt-5 overflow-hidden rounded-control border border-[#0f172a]/10 bg-white/70">
              <div className="grid grid-cols-2 gap-px bg-[#0f172a]/10 md:grid-cols-4">
                <div className="bg-white/70 px-4 py-3.5">
                  <dt className="mb-1 font-mono text-xs uppercase tracking-wide text-[#0f172a]/60">API 성공률</dt>
                  <dd className="text-[26px] font-semibold">
                    99.98%<small className="ml-1.5 text-sm font-normal">최근 15분</small>
                  </dd>
                </div>
                <div className="bg-white/70 px-4 py-3.5">
                  <dt className="mb-1 font-mono text-xs uppercase tracking-wide text-[#0f172a]/60">분당 발급</dt>
                  <dd className="text-[26px] font-semibold">
                    186<small className="ml-1.5 text-sm font-normal">평균 172건</small>
                  </dd>
                </div>
                <div className="bg-white/70 px-4 py-3.5">
                  <dt className="mb-1 font-mono text-xs uppercase tracking-wide text-[#0f172a]/60">처리 지연</dt>
                  <dd className="text-[26px] font-semibold">
                    184ms<small className="ml-1.5 text-sm font-normal">목표 250ms 이하</small>
                  </dd>
                </div>
                <div className="bg-white/70 px-4 py-3.5">
                  <dt className="mb-1 font-mono text-xs uppercase tracking-wide text-[#0f172a]/60">실패 대기</dt>
                  <dd className="text-[26px] font-semibold">
                    3<small className="ml-1.5 text-sm font-normal">긴급 항목 없음</small>
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-4">
        <div className="container-page grid gap-6 lg:grid-cols-[7fr_5fr]">
          <article className="rounded-block border border-hairline p-5 dark:border-white/[0.14] dark:bg-ops-surface dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">구성요소 상태</h3>
              <span className="font-mono text-xs text-ink/50 dark:text-ops-muted">SEOUL / UTC+09:00</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead className="text-ink/60 dark:text-ops-muted">
                  <tr>
                    <th className="pb-2 font-medium">구성요소</th>
                    <th className="pb-2 font-medium">역할</th>
                    <th className="pb-2 font-medium">상태</th>
                    <th className="pb-2 font-medium">응답</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPONENTS.map((c) => (
                    <tr key={c.name} className="border-t border-hairline-soft dark:border-ops-border-soft">
                      <td className="py-3 font-semibold">{c.name}</td>
                      <td className="py-3 text-ink/70 dark:text-ops-muted">{c.role}</td>
                      <td className="py-3">
                        <StatusPill tone={c.tone}>{c.status}</StatusPill>
                      </td>
                      <td className="py-3">{c.latency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <TextLink to="/internal/monitoring">시스템 현황 전체 보기 →</TextLink>
          </article>

          <article className="rounded-block border border-hairline p-5 dark:border-white/[0.14] dark:bg-ops-surface dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">실패 큐</h3>
              <StatusPill tone="warning">관찰 중</StatusPill>
            </div>
            <MetricGrid cols={3} compact>
              <MetricTile label="FAILED" value="1" compact />
              <MetricTile label="Retry" value="1" compact />
              <MetricTile label="DLQ" value="1" compact />
            </MetricGrid>
            <ul className="my-4 flex flex-col">
              {FAILURES.map((f, i) => (
                <li key={f.id} className={`flex items-center gap-2.5 py-2.5 text-sm ${i > 0 ? "border-t border-hairline-soft dark:border-ops-border-soft" : ""}`}>
                  <StatusPill tone={f.tone}>{f.label}</StatusPill>
                  <strong className="font-mono">{f.id}</strong>
                  <span className="ml-auto text-ink/60 dark:text-ops-muted">{f.detail}</span>
                </li>
              ))}
            </ul>
            <TextLink to="/internal/failures">실패 처리 전체 보기 →</TextLink>
          </article>
        </div>
      </section>

      <section className="py-4">
        <div className="container-page">
          <div className="rounded-block border border-hairline p-5 dark:border-white/[0.14] dark:bg-ops-surface dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">발급 처리 흐름</h3>
                <p className="font-mono text-xs text-ink/50 dark:text-ops-muted">REQ-20260821-8F3A21 · 사용자 #1 · 쿠폰 #10 · 184ms</p>
              </div>
              <TextLink to="/internal/issues">요청 조회 전체 화면 →</TextLink>
            </div>
            <ol className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {PIPELINE.map((step) => (
                <li key={step.step} className="rounded-control border-t-[3px] border-ink bg-paper p-3.5 dark:border-ops-ink dark:bg-ops-bg">
                  <span className="font-mono text-xs text-ink/50 dark:text-ops-muted">{step.step}</span>
                  <h4 className="mt-1 text-sm font-semibold">{step.title}</h4>
                  <p className="text-xs text-ink/60 dark:text-ops-muted">{step.detail}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="py-4 pb-14">
        <div className="container-page grid gap-6 lg:grid-cols-[8fr_4fr]">
          <article className="rounded-block border border-hairline p-5 dark:border-white/[0.14] dark:bg-ops-surface dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">최근 발급 처리량</h3>
              <TextLink to="/internal/monitoring">시간대별 추이 보기 →</TextLink>
            </div>
            <div className="flex h-52 items-end gap-2 border-b border-ink/40 pt-4 dark:border-white/35">
              {[58, 64, 72, 86, 74, 93, 81].map((h, i) => (
                <span key={i} className="min-w-3 flex-1 rounded-t-sm bg-ink dark:bg-ops-ink" style={{ height: `${h}%` }} />
              ))}
            </div>
            <p className="mt-3 font-mono text-xs text-ink/50 dark:text-ops-muted">10:45 — 11:45 · 실패율 0.04%</p>
          </article>

          <article className="rounded-block border border-hairline p-5 dark:border-white/[0.14] dark:bg-ops-surface dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">정합성 검증</h3>
              <StatusPill tone="warning">2건 확인 필요</StatusPill>
            </div>
            <MetricGrid cols={2} compact>
              <MetricTile label="일치" value="1,246" hint="99.84%" compact />
              <MetricTile label="불일치" value="2" hint="재고 1 · 메시지 1" compact />
            </MetricGrid>
            <div className="mt-4">
              <TextLink to="/internal/verification">정합성 검증 전체 보기 →</TextLink>
            </div>
          </article>
        </div>
      </section>
    </Layout>
  );
}
