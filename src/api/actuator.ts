/**
 * Spring Boot Actuator 클라이언트.
 *
 * 도메인 API와 달리 Actuator는 CustomResponse({isSuccess,code,message,result}) 봉투를
 * 쓰지 않고 원본 JSON을 그대로 내려준다. 그래서 http.ts의 apiGet을 쓰면 isSuccess가
 * undefined라 무조건 실패로 판정된다 — 여기서 별도 fetch를 둔다.
 *
 * 노출 범위는 백엔드 application.properties의
 *   management.endpoints.web.exposure.include=health,info,metrics
 * 로 정해진다. /actuator/**는 /admin/** 이 아니라서 관리자 세션이 필요 없다.
 */
import { ApiError, NetworkError } from "./http";

async function actuatorGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/actuator${path}`, { signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new NetworkError(err);
  }
  if (!response.ok) {
    // 노출되지 않은 엔드포인트는 404가 온다 — 서버가 죽은 것과 구분해야 한다.
    throw new ApiError(
      String(response.status),
      response.status === 404
        ? "이 지표가 노출되어 있지 않습니다. ACTUATOR_ENDPOINTS 설정을 확인해 주세요."
        : `Actuator 요청이 실패했습니다. (HTTP ${response.status})`,
      response.status,
    );
  }
  return (await response.json()) as T;
}

// ---- health ----

export type HealthStatus = "UP" | "DOWN" | "OUT_OF_SERVICE" | "UNKNOWN";

export interface HealthComponent {
  status: HealthStatus;
  details?: Record<string, unknown>;
}

/**
 * management.endpoint.health.show-details 가 never(기본값)면 status 한 줄만 온다.
 * when-authorized/always 로 열리면 components가 함께 내려와 구성요소별 상태를 볼 수 있다.
 * 화면은 두 경우 모두를 처리해야 한다.
 */
export interface HealthResponse {
  status: HealthStatus;
  components?: Record<string, HealthComponent>;
}

export function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  return actuatorGet<HealthResponse>("/health", signal);
}

// ---- metrics ----

export interface MetricResponse {
  name: string;
  description?: string;
  baseUnit?: string;
  measurements: { statistic: string; value: number }[];
  availableTags?: { tag: string; values: string[] }[];
}

/**
 * /actuator/metrics/{name} 은 부팅 이후 **누적값**을 준다(시계열이 아니다).
 * Prometheus 레지스트리가 없어서 서버가 구간별 값을 갖고 있지 않으므로,
 * 추이가 필요하면 호출부에서 주기적으로 읽어 이전 표본과 차분해야 한다.
 */
export function getMetric(name: string, tags: string[] = [], signal?: AbortSignal): Promise<MetricResponse> {
  const query = tags.map((t) => `tag=${encodeURIComponent(t)}`).join("&");
  return actuatorGet<MetricResponse>(`/metrics/${name}${query ? `?${query}` : ""}`, signal);
}

/** measurements 배열에서 통계값 하나를 꺼낸다. 없으면 undefined. */
export function stat(metric: MetricResponse | null, statistic: string): number | undefined {
  return metric?.measurements.find((m) => m.statistic === statistic)?.value;
}
