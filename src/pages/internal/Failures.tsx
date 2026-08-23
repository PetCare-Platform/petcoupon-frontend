import { useMemo, useState } from "react";
import { Layout } from "../../components/Layout";
import { Eyebrow, FilterBar, MetricGrid, MetricTile, StatusPill } from "../../components/ui";
import { useToast } from "../../context/ToastContext";

type Status = "failed" | "retry" | "dlq";

const MESSAGES: { id: string; ref: string; status: Status; error: string; retries: string; time: string; action: string }[] = [
  { id: "#88419", ref: "coupon-12-seq-031", status: "failed", error: "DB_WRITE_TIMEOUT", retries: "2회", time: "11:38:14", action: "재시도" },
  { id: "#88417", ref: "coupon-10-seq-219", status: "retry", error: "PUSH_RATE_LIMIT", retries: "1회", time: "11:35:02", action: "즉시 재시도" },
  { id: "#88398", ref: "coupon-11-seq-901", status: "dlq", error: "INVALID_PAYLOAD", retries: "5회", time: "10:52:47", action: "검토" },
];

const statusTone: Record<Status, "danger" | "warning" | "neutral"> = { failed: "danger", retry: "warning", dlq: "neutral" };
const statusLabel: Record<Status, string> = { failed: "FAILED", retry: "RETRY", dlq: "DLQ" };

export default function Failures() {
  const { showToast } = useToast();
  const [filter, setFilter] = useState<"all" | Status>("all");
  const visible = useMemo(() => (filter === "all" ? MESSAGES : MESSAGES.filter((m) => m.status === filter)), [filter]);

  return (
    <Layout area="internal" page="failures">
      <section className="py-8">
        <div className="container-page flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>내부 운영 · 실패 처리</Eyebrow>
            <h1 className="mt-2">FAILED · Retry · DLQ</h1>
            <p className="mt-2 text-ink/70 dark:text-ops-muted">실패 원인을 분류하고 안전하게 재시도하거나 격리 큐로 이동하세요.</p>
          </div>
        </div>
      </section>

      <section className="py-4">
        <div className="container-page">
          <div className="rounded-block border border-hairline bg-surface-2 p-6 text-ink md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide">확인 필요 큐</span>
                <h2 className="mt-1">확인이 필요한 메시지 3건</h2>
              </div>
              <StatusPill tone="warning">관찰 중</StatusPill>
            </div>
            <div className="mt-6">
              <MetricGrid cols={3}>
                <MetricTile label="FAILED" value="1" hint="원인 확인 필요" />
                <MetricTile label="Retry 대기" value="1" hint="다음 시도 11:45" />
                <MetricTile label="DLQ" value="1" hint="수동 검토 필요" />
              </MetricGrid>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>실패 기록</Eyebrow>
              <h2 className="mt-2">실패 메시지</h2>
              <p className="mt-1 text-ink/70 dark:text-ops-muted">{visible.length}개의 항목</p>
            </div>
            <FilterBar
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: "전체" },
                { value: "failed", label: "FAILED" },
                { value: "retry", label: "Retry" },
                { value: "dlq", label: "DLQ" },
              ]}
            />
          </div>

          <div className="mt-6 overflow-x-auto rounded-block border border-hairline dark:border-ops-border">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-hairline text-ink/60 dark:border-ops-border dark:text-ops-muted">
                <tr>
                  <th className="p-4 font-medium">메시지</th>
                  <th className="p-4 font-medium">오류</th>
                  <th className="p-4 font-medium">재시도</th>
                  <th className="p-4 font-medium">상태</th>
                  <th className="p-4 font-medium">최근 처리</th>
                  <th className="p-4 font-medium">작업</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((m) => (
                  <tr key={m.id} className="border-b border-hairline-soft last:border-0 dark:border-ops-border-soft">
                    <td className="p-4">
                      <strong className="block">{m.id}</strong>
                      <small className="text-ink/50 dark:text-ops-muted">{m.ref}</small>
                    </td>
                    <td className="p-4 font-mono text-xs">{m.error}</td>
                    <td className="p-4">{m.retries}</td>
                    <td className="p-4">
                      <StatusPill tone={statusTone[m.status]}>{statusLabel[m.status]}</StatusPill>
                    </td>
                    <td className="p-4">{m.time}</td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => showToast(`메시지 ${m.id} ${m.action}${m.action === "검토" ? "를" : "를"} 요청했습니다.`)}
                        className="font-medium underline underline-offset-4"
                      >
                        {m.action}
                      </button>
                    </td>
                  </tr>
                ))}
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-ink/60 dark:text-ops-muted">
                      해당 상태의 실패 메시지가 없습니다.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-10 pb-16">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2>실패 처리 원칙</h2>
          </div>
          <ol className="grid gap-4">
            {[
              ["원인 확인", "오류 코드와 페이로드, 이전 시도 결과를 함께 봅니다."],
              ["안전한 재시도", "중복 발급 가능성을 확인한 뒤 재시도를 실행합니다."],
              ["DLQ 격리", "반복 실패는 격리하고 담당자 검토 기록을 남깁니다."],
            ].map(([title, desc], i) => (
              <li key={title} className="flex gap-4">
                <span className="font-mono text-sm text-ink/50 dark:text-ops-muted">0{i + 1}</span>
                <div>
                  <strong className="block">{title}</strong>
                  <span className="text-ink/70 dark:text-ops-muted">{desc}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </Layout>
  );
}
