import { useMemo, useState } from "react";
import { Layout } from "../../components/Layout";
import { Eyebrow, FilterBar, MetricGrid, MetricTile, StatusPill } from "../../components/ui";

type Status = "match" | "mismatch";

const CHECKS: { id: string; label: string; source: string; expected: string; actual: string; status: Status }[] = [
  { id: "coupon-10", label: "COUPON 10 / STOCK", source: "Redis ↔ 발급 원장", expected: "284", actual: "284", status: "match" },
  { id: "issue-1042", label: "ISSUE 1042 / STATUS", source: "CouponIssue ↔ History", expected: "ISSUED", actual: "ISSUED", status: "match" },
  { id: "coupon-11", label: "COUPON 11 / STOCK", source: "Redis ↔ 발급 원장", expected: "128", actual: "127", status: "mismatch" },
  { id: "message-88231", label: "MESSAGE 88231 / DELIVERY", source: "Kafka ↔ NotificationLog", expected: "SENT", actual: "PENDING", status: "mismatch" },
];

const countByStatus = (status: Status) => CHECKS.filter((c) => c.status === status).length;
const reveal = (i: number) => ({ animationDelay: `${i * 70}ms` });

export default function Verification() {
  const [filter, setFilter] = useState<"all" | Status>("all");
  const visible = useMemo(() => (filter === "all" ? CHECKS : CHECKS.filter((c) => c.status === filter)), [filter]);

  return (
    <Layout area="internal" page="verification">
      <section className="py-8">
        <div className="container-page">
          <Eyebrow>내부 운영 · 정합성 검증 · 예시 데이터</Eyebrow>
          <h1 className="mt-2">정합성 검증</h1>
          <p className="mt-2 text-[18px] text-ink/70 dark:text-ops-muted">쿠폰 재고와 발급 원장, 메시지 처리 결과의 정합성을 검증합니다.</p>
        </div>
      </section>

      <section className="py-4 animate-reveal-up" style={reveal(1)}>
        <div className="container-page">
          <div className="rounded-block border border-hairline bg-surface-2 p-6 text-ink md:p-8">
            <StatusPill tone="warning">2건 확인 필요</StatusPill>
            <h2 className="mt-3">대부분의 원장이 일치합니다.</h2>
            <div className="mt-6">
              <MetricGrid cols={4}>
                <MetricTile label="검사 대상" value="1,248" hint="쿠폰·발급·메시지" />
                <MetricTile label="일치" value="1,246" hint="99.84%" tone="success" />
                <MetricTile label="불일치" value="2" hint="재고 1 · 메시지 1" tone="danger" />
                <MetricTile label="검증 시간" value="2.8s" hint="직전 대비 -0.4s" tone="success" trend="down" />
              </MetricGrid>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 pb-16 animate-reveal-up" style={reveal(2)}>
        <div className="container-page">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2>검증 결과</h2>
            </div>
            <FilterBar
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: `전체 ${CHECKS.length}` },
                { value: "match", label: `일치 ${countByStatus("match")}` },
                { value: "mismatch", label: `불일치 ${countByStatus("mismatch")}` },
              ]}
            />
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {visible.map((check) => (
              <article key={check.id} className="rounded-control border border-hairline p-3.5 dark:border-white/[0.14] dark:bg-ops-surface">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wide text-ink/60 dark:text-ops-muted">{check.label}</span>
                  <StatusPill tone={check.status === "match" ? "open" : "danger"}>{check.status === "match" ? "일치" : "불일치"}</StatusPill>
                </div>
                <p className="text-base font-semibold">
                  기대 {check.expected} · 실제 {check.actual}
                </p>
                <p className="mt-0.5 text-sm text-ink/60 dark:text-ops-muted">{check.source}</p>
                {check.status === "mismatch" ? <button className="mt-2 text-sm font-medium underline underline-offset-4">재검증</button> : <span className="mt-2 block text-sm underline underline-offset-4 opacity-0">상세</span>}
              </article>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
