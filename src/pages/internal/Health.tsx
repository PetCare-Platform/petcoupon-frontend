import { useCallback, useEffect, useRef, useState } from "react";
import { Layout } from "../../components/Layout";
import { Eyebrow, MetricGrid, MetricTile, StatusPill, EmptyState } from "../../components/ui";
import { ApiError, NetworkError } from "../../api/http";
import { getHealth, getMetric, stat, type HealthResponse, type HealthStatus } from "../../api/actuator";

const POLL_MS = 5000;
/** 차분 표본 보관 개수 — POLL_MS 기준으로 약 1분치 */
const MAX_SAMPLES = 12;

/** 이 화면이 읽는 Actuator 지표. 노출되지 않은 것은 개별적으로 실패해도 나머지는 계속 보여준다. */
const RESOURCE_METRICS = [
  { name: "tomcat.threads.busy", max: "tomcat.threads.config.max", label: "Tomcat 스레드", hint: "사용 중 / 최대" },
  { name: "hikaricp.connections.active", max: "hikaricp.connections.max", label: "DB 커넥션", hint: "활성 / 최대" },
] as const;

const statusTone: Record<HealthStatus, "open" | "danger" | "warning" | "neutral"> = {
  UP: "open",
  DOWN: "danger",
  OUT_OF_SERVICE: "warning",
  UNKNOWN: "neutral",
};

/** Actuator 컴포넌트 키를 사람이 읽는 이름으로. 모르는 키는 그대로 노출한다. */
const COMPONENT_LABEL: Record<string, string> = {
  db: "MySQL",
  redis: "Redis",
  diskSpace: "디스크",
  ping: "Application",
  clientConfigServer: "Config Server",
};

interface Sample {
  at: number;
  count: number;
  totalTime: number;
  successCount: number;
}

interface Interval {
  label: string;
  requests: number;
  rps: number;
  avgMs: number | null;
  successRate: number | null;
}

function toInterval(prev: Sample, next: Sample): Interval | null {
  const elapsedSec = (next.at - prev.at) / 1000;
  if (elapsedSec <= 0) return null;
  const requests = next.count - prev.count;
  // 서버가 재시작하면 누적 카운터가 0으로 돌아가 음수 차분이 나온다 — 그 구간은 버린다.
  if (requests < 0) return null;
  const time = next.totalTime - prev.totalTime;
  const success = next.successCount - prev.successCount;
  return {
    label: new Date(next.at).toLocaleTimeString("ko-KR", { hour12: false }),
    requests,
    rps: requests / elapsedSec,
    avgMs: requests > 0 ? (time / requests) * 1000 : null,
    successRate: requests > 0 ? success / requests : null,
  };
}

export default function Health() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState("");
  const [samples, setSamples] = useState<Sample[]>([]);
  const [metricsError, setMetricsError] = useState("");
  const [resources, setResources] = useState<Record<string, { value?: number; max?: number; error?: string }>>({});
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const [live, setLive] = useState(true);
  const liveRef = useRef(live);

  useEffect(() => {
    liveRef.current = live;
  }, [live]);

  const poll = useCallback(async (signal: AbortSignal) => {
    const message = (err: unknown, fallback: string) =>
      err instanceof ApiError || err instanceof NetworkError ? err.message : fallback;

    // 헬스와 지표는 서로 독립이다 — 하나가 막혀도 나머지는 계속 보여준다.
    try {
      setHealth(await getHealth(signal));
      setHealthError("");
    } catch (err) {
      if (signal.aborted) return;
      setHealthError(message(err, "상태를 불러오지 못했습니다."));
    }

    try {
      const [all, ok] = await Promise.all([
        getMetric("http.server.requests", [], signal),
        getMetric("http.server.requests", ["outcome:SUCCESS"], signal).catch(() => null),
      ]);
      const count = stat(all, "COUNT") ?? 0;
      setSamples((prev) =>
        [...prev, { at: Date.now(), count, totalTime: stat(all, "TOTAL_TIME") ?? 0, successCount: ok ? stat(ok, "COUNT") ?? 0 : 0 }].slice(-MAX_SAMPLES),
      );
      setMetricsError("");
    } catch (err) {
      if (signal.aborted) return;
      setMetricsError(message(err, "지표를 불러오지 못했습니다."));
    }

    const next: Record<string, { value?: number; max?: number; error?: string }> = {};
    await Promise.all(
      RESOURCE_METRICS.map(async (m) => {
        try {
          const [used, max] = await Promise.all([getMetric(m.name, [], signal), getMetric(m.max, [], signal).catch(() => null)]);
          next[m.name] = { value: stat(used, "VALUE"), max: max ? stat(max, "VALUE") : undefined };
        } catch (err) {
          next[m.name] = { error: message(err, "조회 실패") };
        }
      }),
    );
    if (!signal.aborted) {
      setResources(next);
      setCheckedAt(new Date());
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    poll(controller.signal);
    const id = window.setInterval(() => {
      if (liveRef.current) poll(controller.signal);
    }, POLL_MS);
    return () => {
      window.clearInterval(id);
      controller.abort();
    };
  }, [poll]);

  const intervals = samples
    .slice(1)
    .map((s, i) => toInterval(samples[i], s))
    .filter((v): v is Interval => v !== null);
  const latest = intervals[intervals.length - 1];
  const totalRequests = intervals.reduce((sum, i) => sum + i.requests, 0);
  const peak = intervals.reduce((max, i) => Math.max(max, i.rps), 0);
  const components = health?.components ? Object.entries(health.components) : [];
  const backendDown = healthError && metricsError;

  return (
    <Layout area="internal">
      <section>
        <div className="container-page">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Eyebrow>내부 운영 · 시스템 상태</Eyebrow>
              <h1 className="mt-2">시스템 상태</h1>
              <p className="mt-2 text-[17px] text-ink/70">
                Spring Boot Actuator에서 직접 읽습니다. 샘플 데이터가 아닙니다.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {checkedAt ? (
                <span className="text-xs text-ink/50">
                  마지막 확인 {checkedAt.toLocaleTimeString("ko-KR", { hour12: false })}
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => setLive((v) => !v)}
                aria-pressed={live}
                className="rounded-full border border-hairline bg-paper px-4 hover:border-ink"
              >
                {live ? `자동 갱신 켬 · ${POLL_MS / 1000}초` : "자동 갱신 끔"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {backendDown ? (
        <section>
          <div className="container-page">
            <EmptyState
              title="백엔드에 연결하지 못했습니다."
              description={`${healthError} — 백엔드가 localhost:8080에 떠 있는지, dev 프록시가 동작하는지 확인해 주세요.`}
            />
          </div>
        </section>
      ) : (
        <>
          <section>
            <div className="container-page">
              <div className="rounded-block border border-hairline bg-surface-2 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2>구성요소 상태</h2>
                  {health ? <StatusPill tone={statusTone[health.status]}>{health.status}</StatusPill> : null}
                </div>

                {components.length > 0 ? (
                  <div className="mt-5 overflow-x-auto">
                    <table className="w-full min-w-[420px] text-left">
                      <thead>
                        <tr>
                          <th>구성요소</th>
                          <th>상태</th>
                          <th>세부</th>
                        </tr>
                      </thead>
                      <tbody>
                        {components.map(([key, comp]) => (
                          <tr key={key} className="border-t border-hairline-soft">
                            <td className="font-semibold">{COMPONENT_LABEL[key] ?? key}</td>
                            <td>
                              <StatusPill tone={statusTone[comp.status]}>{comp.status}</StatusPill>
                            </td>
                            <td className="text-ink/60">
                              {comp.details
                                ? Object.entries(comp.details)
                                    .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
                                    .join(" · ")
                                    .slice(0, 80)
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /*
                   * MySQL·Redis 헬스 인디케이터는 의존성이 있어 이미 등록돼 있지만,
                   * management.endpoint.health.show-details 기본값이 never라 응답에서 가려진다.
                   * 값이 열리면 위 표가 자동으로 채워지므로 화면 수정은 필요 없다.
                   */
                  <div className="mt-4 rounded-control border border-hairline bg-paper p-4">
                    <p>
                      전체 상태만 확인할 수 있습니다. 구성요소별(MySQL · Redis · 디스크) 상태는 백엔드에서 가려져 있습니다.
                    </p>
                    <p className="mt-2 text-ink/60">
                      백엔드 <code className="font-mono">application.properties</code>에{" "}
                      <code className="font-mono">management.endpoint.health.show-details=always</code>를 추가하면 이 표가
                      채워집니다. 화면은 그대로 두어도 됩니다.
                    </p>
                  </div>
                )}
                {healthError ? <p className="mt-3 text-danger">{healthError}</p> : null}
              </div>
            </div>
          </section>

          <section>
            <div className="container-page">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2>요청 처리</h2>
                  {/* 누적 카운터만 제공되므로 구간값은 이 화면이 직접 차분해서 만든다. */}
                  <p className="mt-1 text-ink/60">
                    이 화면을 연 이후 {POLL_MS / 1000}초 간격으로 측정한 값입니다. 새로고침하면 초기화됩니다.
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <MetricGrid cols={4}>
                  <MetricTile
                    label="초당 요청"
                    value={latest ? latest.rps.toFixed(1) : "—"}
                    hint={latest ? `직전 ${POLL_MS / 1000}초 ${latest.requests}건` : "측정 대기 중"}
                  />
                  <MetricTile
                    label="평균 지연"
                    value={latest?.avgMs != null ? `${Math.round(latest.avgMs)}ms` : "—"}
                    hint={latest?.avgMs != null ? "직전 구간 기준" : "요청이 없으면 계산되지 않음"}
                  />
                  <MetricTile
                    label="성공률"
                    value={latest?.successRate != null ? `${(latest.successRate * 100).toFixed(1)}%` : "—"}
                    tone={latest?.successRate != null && latest.successRate < 0.99 ? "warning" : "neutral"}
                    hint="outcome=SUCCESS 기준"
                  />
                  <MetricTile
                    label="관측 요청"
                    value={totalRequests}
                    hint={`표본 ${intervals.length}구간 · 최대 ${peak.toFixed(1)}/s`}
                  />
                </MetricGrid>
              </div>

              {intervals.length > 0 && peak > 0 ? (
                <div className="mt-5 rounded-block border border-hairline bg-paper p-6">
                  <h3>구간별 처리량</h3>
                  <div className="mt-4 flex h-32 items-end gap-1.5">
                    {intervals.map((iv) => (
                      <div key={iv.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                        <span className="text-[11px] tabular-nums text-ink/60">{iv.requests}</span>
                        <div
                          className="w-full flex-none rounded-t-sm bg-ink"
                          style={{ height: `${Math.max((iv.rps / peak) * 100, 2)}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 flex gap-1.5 border-t border-hairline pt-2">
                    {intervals.map((iv) => (
                      <span key={iv.label} className="flex-1 text-center font-mono text-[10px] text-ink/50">
                        {iv.label.slice(3)}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-block border border-dashed border-hairline p-8 text-center text-ink/60">
                  {metricsError ||
                    `아직 표본이 없습니다. ${POLL_MS / 1000}초마다 한 구간씩 쌓입니다 — 요청이 발생하면 막대가 나타납니다.`}
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="container-page">
              <h2>자원</h2>
              <div className="mt-5">
                <MetricGrid cols={2}>
                  {RESOURCE_METRICS.map((m) => {
                    const r = resources[m.name];
                    const pct = r?.value != null && r.max ? r.value / r.max : null;
                    return (
                      <MetricTile
                        key={m.name}
                        label={m.label}
                        value={r?.error ? "—" : r?.value != null ? `${Math.round(r.value)}${r.max ? ` / ${Math.round(r.max)}` : ""}` : "…"}
                        tone={pct != null && pct >= 0.8 ? "warning" : "neutral"}
                        hint={r?.error ?? m.hint}
                      />
                    );
                  })}
                </MetricGrid>
              </div>
            </div>
          </section>
        </>
      )}
    </Layout>
  );
}
