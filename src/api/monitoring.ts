import { getAdminSessionToken } from "./adminSession";
import { ApiError, NetworkError, apiGet, apiPatch } from "./http";
import type { MonitoringEventResponse, MonitoringSettingsResponse } from "../types/api";

export type MonitoringStreamEvent =
  | { type: "connected"; streamEnabled: boolean }
  | { type: "monitoring-event"; event: MonitoringEventResponse }
  | { type: "events-dropped"; droppedCount: number }
  | { type: "heartbeat" };

export function getMonitoringSettings(signal?: AbortSignal): Promise<MonitoringSettingsResponse> {
  return apiGet<MonitoringSettingsResponse>("/admin/monitoring/settings", signal);
}

export function updateMonitoringSettings(streamEnabled: boolean): Promise<MonitoringSettingsResponse> {
  return apiPatch<MonitoringSettingsResponse>("/admin/monitoring/settings", { streamEnabled });
}

export async function subscribeMonitoringStream(onEvent: (event: MonitoringStreamEvent) => void, signal: AbortSignal): Promise<void> {
  const token = getAdminSessionToken();
  if (!token) throw new ApiError("ADMIN_AUTH_REQUIRED", "관리자 인증이 필요합니다.", 401);

  let response: Response;
  try {
    response = await fetch("/api/admin/monitoring/stream", {
      headers: { Accept: "text/event-stream", "X-ADMIN-KEY": token },
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new NetworkError(error);
  }

  if (!response.ok || !response.body) {
    let message = `모니터링 연결에 실패했습니다. (HTTP ${response.status})`;
    try {
      const payload = (await response.json()) as { message?: string };
      if (payload.message) message = payload.message;
    } catch { /* 오류 응답에 JSON 본문이 없을 수 있다. */ }
    throw new ApiError(response.status === 401 ? "ADMIN_AUTH_REQUIRED" : "MONITORING_STREAM_ERROR", message, response.status);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const dispatch = (frame: string) => {
    let name = "message";
    const data: string[] = [];
    for (const line of frame.split("\n")) {
      if (line.startsWith("event:")) name = line.slice(6).trim();
      if (line.startsWith("data:")) data.push(line.slice(5).trimStart());
    }
    if (!data.length) return;
    const payload = JSON.parse(data.join("\n")) as Record<string, unknown>;
    if (name === "connected") onEvent({ type: "connected", streamEnabled: Boolean(payload.streamEnabled) });
    else if (name === "monitoring-event") onEvent({ type: "monitoring-event", event: payload as unknown as MonitoringEventResponse });
    else if (name === "events-dropped") onEvent({ type: "events-dropped", droppedCount: Number(payload.droppedCount) || 0 });
    else if (name === "heartbeat") onEvent({ type: "heartbeat" });
  };

  while (!signal.aborted) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, "\n");
    let boundary = buffer.indexOf("\n\n");
    while (boundary >= 0) {
      dispatch(buffer.slice(0, boundary));
      buffer = buffer.slice(boundary + 2);
      boundary = buffer.indexOf("\n\n");
    }
    if (done) break;
  }
}
