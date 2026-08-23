import { Layout } from "../../components/Layout";
import { BarChart, Eyebrow, MetricGrid, MetricTile, StatusPill, TextLink } from "../../components/ui";
import { useToast } from "../../context/ToastContext";

const reveal = (i: number) => ({ animationDelay: `${i * 70}ms` });

const THROUGHPUT = [
  { label: "10:45", value: 142 },
  { label: "10:55", value: 158 },
  { label: "11:05", value: 168 },
  { label: "11:15", value: 201 },
  { label: "11:25", value: 172 },
  { label: "11:35", value: 216 },
  { label: "11:45", value: 189 },
];

const PIPELINE = [
  { step: "01", title: "요청 수신", detail: "해시 생성 · 12ms" },
  { step: "02", title: "멱등성 검증", detail: "SUCCEEDED · 18ms" },
  { step: "03", title: "재고 선점", detail: "285→284 · 31ms" },
  { step: "04", title: "발급 저장", detail: "ISSUED · 89ms" },
  { step: "05", title: "알림 전송", detail: "SENT · 34ms" },
];

const COMPONENTS = [
  { name: "Application", role: "HTTP 요청 처리", status: "정상" as const, tone: "open" as const, latency: "42ms", checked: "11:42:08" },
  { name: "MySQL", role: "원장과 운영 데이터", status: "정상" as const, tone: "open" as const, latency: "8ms", checked: "11:42:07" },
  { name: "Redis", role: "재고와 중복 제어", status: "정상" as const, tone: "open" as const, latency: "3ms", checked: "11:42:07" },
  { name: "Kafka", role: "발급 메시지 전달", status: "관찰" as const, tone: "warning" as const, latency: "92ms", checked: "11:42:06" },
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
            <Eyebrow>내부 운영 · 대시보드</Eyebrow>
            <h1 className="mt-2">내부 운영 대시보드</h1>
            <p className="mt-2 text-ink/70 dark:text-ops-muted">시스템 현황과 발급 처리 흐름, 실패 처리를 한 화면에서 점검하세요.</p>
          </div>
          <button
            type="button"
            onClick={() => showToast("대시보드를 최신 상태로 갱신했습니다.")}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink bg-ink px-5 text-[18px] font-medium text-paper transition-all active:scale-[0.97] hover:bg-[#262626] dark:border-ops-ink dark:bg-ops-ink dark:text-ops-bg dark:hover:bg-white"
          >
            전체 새로고침
          </button>
        </div>
      </section>

      <section className="py-4 animate-reveal-up" style={reveal(1)}>
        <div className="container-page">
          <div className="rounded-block border border-hairline bg-surface-2 p-6 text-ink md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide">실시간 현황</span>
                <h2 className="mt-1">전체 흐름은 안정적입니다.</h2>
              </div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
                <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-live-pulse rounded-full bg-success" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
                </span>
                마지막 확인 11:42:08
              </span>
            </div>
            <div className="mt-5">
              <MetricGrid cols={4}>
                <MetricTile label="API 성공률" value="99.98%" hint="최근 15분" tone="success" />
                <MetricTile label="분당 발급" value="186" hint="평균 172건" tone="success" trend="up" />
                <MetricTile label="처리 지연" value="184ms" hint="목표 250ms 이하" tone="success" trend="down" />
                <MetricTile label="실패 대기" value="3" hint="긴급 항목 없음" tone="warning" />
              </MetricGrid>
            </div>
          </div>
        </div>
      </section>

      <section className="py-4 animate-reveal-up" style={reveal(2)}>
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
                    <th className="pb-2 font-medium">최근 확인</th>
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
                      <td className="py-3 text-ink/60 dark:text-ops-muted">{c.checked}</td>
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
              <MetricTile label="FAILED" value="1" compact tone="danger" />
              <MetricTile label="Retry" value="1" compact tone="warning" />
              <MetricTile label="DLQ" value="1" compact tone="neutral" />
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

      <section className="py-4 animate-reveal-up" style={reveal(3)}>
        <div className="container-page">
          <div className="rounded-block border border-hairline p-5 dark:border-white/[0.14] dark:bg-ops-surface dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">발급 처리 흐름</h3>
                <p className="text-xs text-ink/50 dark:text-ops-muted">REQ-20260821-8F3A21 · 사용자 #1 · 쿠폰 #10 · 184ms</p>
              </div>
              <TextLink to="/internal/issues">요청 조회 전체 화면 →</TextLink>
            </div>
            <ol className="grid items-start grid-cols-2 gap-3 md:grid-cols-5">
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

      <section className="py-4 pb-14 animate-reveal-up" style={reveal(4)}>
        <div className="container-page grid gap-6 lg:grid-cols-[8fr_4fr]">
          <article className="rounded-block border border-hairline p-5 dark:border-white/[0.14] dark:bg-ops-surface dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">최근 발급 처리량</h3>
              <TextLink to="/internal/monitoring">시간대별 추이 보기 →</TextLink>
            </div>
            <BarChart points={THROUGHPUT} />
            <p className="mt-3 text-xs text-ink/50 dark:text-ops-muted">10:45 - 11:45 · 실패율 0.04%</p>
          </article>

          <article className="rounded-block border border-hairline p-5 dark:border-white/[0.14] dark:bg-ops-surface dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">정합성 검증</h3>
              <StatusPill tone="warning">2건 확인 필요</StatusPill>
            </div>
            <MetricGrid cols={2} compact>
              <MetricTile label="일치" value="1,246" hint="99.84%" compact tone="success" />
              <MetricTile label="불일치" value="2" hint="재고 1 · 메시지 1" compact tone="danger" />
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
