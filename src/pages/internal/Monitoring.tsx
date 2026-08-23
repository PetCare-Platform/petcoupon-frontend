import { Layout } from "../../components/Layout";
import { BarChart, Card, Eyebrow, MetricGrid, MetricTile, StatusPill, TextLink } from "../../components/ui";
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

const COMPONENTS = [
  { name: "Application", role: "HTTP 요청 처리", tone: "open" as const, status: "정상", latency: "42ms", checked: "11:42:08" },
  { name: "MySQL", role: "원장과 운영 데이터", tone: "open" as const, status: "정상", latency: "8ms", checked: "11:42:07" },
  { name: "Redis", role: "재고와 중복 제어", tone: "open" as const, status: "정상", latency: "3ms", checked: "11:42:07" },
  { name: "Kafka", role: "발급 메시지 전달", tone: "warning" as const, status: "관찰", latency: "92ms", checked: "11:42:06" },
];

export default function Monitoring() {
  const { showToast } = useToast();

  return (
    <Layout area="internal" page="monitoring">
      <section className="py-8">
        <div className="container-page flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>내부 운영 · 시스템 현황</Eyebrow>
            <h1 className="mt-2">시스템 현황</h1>
            <p className="mt-2 text-ink/70 dark:text-ops-muted">쿠폰 발급 흐름의 가용성, 처리량과 지연을 한 화면에서 점검하세요.</p>
          </div>
          <button
            type="button"
            onClick={() => showToast("시스템 현황을 최신 시각으로 갱신했습니다.")}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink bg-ink px-5 text-[18px] font-medium text-paper transition-all active:scale-[0.97] hover:bg-[#262626] dark:border-ops-ink dark:bg-ops-ink dark:text-ops-bg"
          >
            현황 새로고침
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
            <div className="mt-6">
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

      <section className="py-10 animate-reveal-up" style={reveal(2)}>
        <div className="container-page">
          <div className="flex items-center justify-between">
            <h2>구성요소 상태</h2>
            <span className="font-mono text-xs text-ink/50 dark:text-ops-muted">SEOUL / UTC+09:00</span>
          </div>
          <div className="mt-5 overflow-x-auto rounded-block border border-hairline dark:border-ops-border">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-hairline text-ink/60 dark:border-ops-border dark:text-ops-muted">
                <tr>
                  <th className="p-4 font-medium">구성요소</th>
                  <th className="p-4 font-medium">역할</th>
                  <th className="p-4 font-medium">상태</th>
                  <th className="p-4 font-medium">응답</th>
                  <th className="p-4 font-medium">최근 확인</th>
                </tr>
              </thead>
              <tbody>
                {COMPONENTS.map((c) => (
                  <tr key={c.name} className="border-b border-hairline-soft last:border-0 dark:border-ops-border-soft">
                    <td className="p-4 font-semibold">{c.name}</td>
                    <td className="p-4 text-ink/70 dark:text-ops-muted">{c.role}</td>
                    <td className="p-4">
                      <StatusPill tone={c.tone}>{c.status}</StatusPill>
                    </td>
                    <td className="p-4">{c.latency}</td>
                    <td className="p-4 text-ink/60 dark:text-ops-muted">{c.checked}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-10 animate-reveal-up" style={reveal(3)}>
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <Eyebrow>처리량</Eyebrow>
            <h2 className="mt-2">최근 발급 처리량</h2>
            <p className="mt-2 text-ink/70 dark:text-ops-muted">한 시간 동안의 분당 발급 요청과 실패 비율입니다.</p>
          </div>
          <figure className="rounded-block border border-hairline p-6 dark:border-white/[0.14] dark:bg-ops-surface">
            <BarChart points={THROUGHPUT} />
            <figcaption className="mt-3 text-xs text-ink/50 dark:text-ops-muted">10:45 - 11:45 · 실패율 0.04%</figcaption>
          </figure>
        </div>
      </section>

      <section className="py-10 animate-reveal-up" style={reveal(4)}>
        <div className="container-page">
          <h2 className="mb-6">운영 상세로 이동</h2>
          <nav aria-label="내부 운영 화면" className="grid items-start gap-4 sm:grid-cols-3">
            {[
              { to: "/internal/issues", tag: "발급", title: "발급 처리 흐름", desc: "요청 단계 추적" },
              { to: "/internal/failures", tag: "실패", title: "실패 처리", desc: "Retry와 DLQ" },
              { to: "/internal/verification", tag: "검증", title: "정합성 검증", desc: "원장 차이 확인" },
            ].map((item) => (
              <Card key={item.to} href={item.to}>
                <span className="block text-xs font-semibold uppercase tracking-wide text-ink/60 dark:text-ops-muted">{item.tag}</span>
                <strong className="mt-1 block text-lg">{item.title}</strong>
                <span className="text-ink/60 dark:text-ops-muted">{item.desc} →</span>
              </Card>
            ))}
          </nav>
        </div>
      </section>
    </Layout>
  );
}
