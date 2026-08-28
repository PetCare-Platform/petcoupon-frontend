import { useCallback, useEffect, useState } from "react";
import { ArrowClockwise, Broadcast, WarningCircle } from "@phosphor-icons/react";
import { Layout } from "../../components/Layout";
import { Button, EmptyState, Eyebrow, StatusPill } from "../../components/ui";
import { ApiError } from "../../api/http";
import { getMonitoringSettings, subscribeMonitoringStream, updateMonitoringSettings } from "../../api/monitoring";
import type { MonitoringEventResponse } from "../../types/api";
import { useToast } from "../../context/ToastContext";

type ConnectionState = "connecting" | "connected" | "disconnected" | "unauthorized";
const MAX_EVENTS = 100;

function formatTime(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(date);
}

export default function Monitoring() {
  const { showToast } = useToast();
  const [events, setEvents] = useState<MonitoringEventResponse[]>([]);
  const [streamEnabled, setStreamEnabled] = useState<boolean | null>(null);
  const [connection, setConnection] = useState<ConnectionState>("connecting");
  const [lastReceivedAt, setLastReceivedAt] = useState<string | null>(null);
  const [droppedCount, setDroppedCount] = useState(0);
  const [retryKey, setRetryKey] = useState(0);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setConnection("connecting");
    getMonitoringSettings(controller.signal)
      .then((settings) => setStreamEnabled(settings.streamEnabled))
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (error instanceof ApiError && error.status === 401) setConnection("unauthorized");
      });

    subscribeMonitoringStream((incoming) => {
      setConnection("connected");
      if (incoming.type === "connected") setStreamEnabled(incoming.streamEnabled);
      if (incoming.type === "heartbeat") setLastReceivedAt(new Date().toISOString());
      if (incoming.type === "events-dropped") setDroppedCount((count) => count + incoming.droppedCount);
      if (incoming.type === "monitoring-event") {
        setLastReceivedAt(incoming.event.occurredAt);
        setEvents((current) => [incoming.event, ...current.filter((event) => event.id !== incoming.event.id)].slice(0, MAX_EVENTS));
      }
    }, controller.signal)
      .then(() => { if (!controller.signal.aborted) setConnection("disconnected"); })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setConnection(error instanceof ApiError && error.status === 401 ? "unauthorized" : "disconnected");
      });
    return () => controller.abort();
  }, [retryKey]);

  const toggleStream = useCallback(async () => {
    if (streamEnabled === null) return;
    setUpdating(true);
    try {
      const result = await updateMonitoringSettings(!streamEnabled);
      setStreamEnabled(result.streamEnabled);
      showToast(result.streamEnabled ? "실시간 로그 수집을 시작했습니다." : "실시간 로그 수집을 중지했습니다.");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "설정을 변경하지 못했습니다.");
    } finally {
      setUpdating(false);
    }
  }, [showToast, streamEnabled]);

  const errorCount = events.filter((event) => event.level === "ERROR").length;
  const connectionLabel = connection === "connected" ? "연결됨" : connection === "connecting" ? "연결 중" : connection === "unauthorized" ? "인증 필요" : "연결 끊김";

  return (
    <Layout area="internal" page="monitoring">
      <section className="py-8">
        <div className="container-page flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>내부 운영 · 실시간 모니터링 API</Eyebrow>
            <h1 className="mt-2">시스템 현황</h1>
            <p className="mt-2 text-[18px] text-ink/70 dark:text-ops-muted">백엔드에서 발생하는 WARN·ERROR 로그를 실시간으로 확인합니다.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setRetryKey((key) => key + 1)} disabled={connection === "connecting"}>
              <ArrowClockwise aria-hidden="true" /> 재연결
            </Button>
            <Button onClick={toggleStream} disabled={streamEnabled === null || updating}>
              {updating ? "변경 중" : streamEnabled ? "스트림 끄기" : "스트림 켜기"}
            </Button>
          </div>
        </div>
      </section>

      <section className="container-page grid gap-4 py-4 sm:grid-cols-2 lg:grid-cols-4">
        {[["연결 상태", connectionLabel], ["스트림 설정", streamEnabled === null ? "확인 중" : streamEnabled ? "ON" : "OFF"], ["현재 화면 수신", `${events.length}건`], ["ERROR", `${errorCount}건`]].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-hairline bg-paper p-4 dark:border-white/[0.14] dark:bg-ops-surface">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink/60 dark:text-ops-muted">{label}</p>
            <p className="mt-2 text-3xl font-bold tabular-nums">{value}</p>
          </div>
        ))}
      </section>

      <section className="container-page py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2>실시간 장애 로그</h2>
            <p className="mt-1 text-sm text-ink/60 dark:text-ops-muted">최대 {MAX_EVENTS}건을 현재 브라우저 탭에 보관 · 마지막 수신 {formatTime(lastReceivedAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            {droppedCount > 0 ? <StatusPill tone="warning">누락 {droppedCount}건</StatusPill> : null}
            <span className="inline-flex items-center gap-2 text-sm font-semibold"><span className={`h-2.5 w-2.5 rounded-full ${connection === "connected" ? "bg-success" : "bg-danger"}`} />{connectionLabel}</span>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-block border border-hairline dark:border-ops-border">
          {events.length === 0 ? (
            <EmptyState
              title={connection === "unauthorized" ? "관리자 인증이 필요합니다" : streamEnabled === false ? "로그 스트림이 꺼져 있습니다" : "수신된 장애 로그가 없습니다"}
              description={connection === "unauthorized" ? "관리자 인증 화면에서 세션을 발급한 뒤 다시 연결해 주세요." : "WARN 또는 ERROR 로그가 발생하면 이곳에 실시간으로 표시됩니다."}
            />
          ) : (
            <div className="max-h-[560px] overflow-auto">
              {events.map((event) => (
                <article key={event.id} className="grid gap-3 border-b border-hairline-soft p-4 last:border-0 md:grid-cols-[90px_170px_1fr_100px] dark:border-ops-border-soft">
                  <div><StatusPill tone={event.level === "ERROR" ? "danger" : "warning"}>{event.level}</StatusPill></div>
                  <p className="truncate font-mono text-xs text-ink/60 dark:text-ops-muted" title={event.source}>{event.source}</p>
                  <div className="min-w-0">
                    <p className="break-words font-medium">{event.message}</p>
                    {event.exception ? <p className="mt-1 flex items-center gap-1 text-xs text-danger"><WarningCircle aria-hidden="true" />{event.exception}</p> : null}
                  </div>
                  <time className="font-mono text-xs text-ink/50 dark:text-ops-muted">{formatTime(event.occurredAt)}</time>
                </article>
              ))}
            </div>
          )}
        </div>
        <p className="mt-3 flex items-center gap-2 text-xs text-ink/50 dark:text-ops-muted"><Broadcast aria-hidden="true" />재연결 중 발생한 로그는 복구되지 않으며, 이 화면을 벗어나면 수신 목록이 초기화됩니다.</p>
      </section>
    </Layout>
  );
}
