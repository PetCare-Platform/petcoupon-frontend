import type { CustomResponse } from "../types/api";
import { getAdminSessionToken } from "./adminSession";

/**
 * 백엔드 CustomResponse 봉투({isSuccess,code,message,result})를 벗기는 공통 fetch 래퍼.
 * 경로는 /api 로 시작하며 vite.config.ts 의 dev 프록시가 백엔드로 전달한다.
 */
export class ApiError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

/** 네트워크 자체가 끊긴 경우 (fetch 예외) — 비즈니스 오류(ApiError)와 구분해서 처리하기 위한 타입 */
export class NetworkError extends Error {
  originalError: unknown;
  constructor(originalError: unknown) {
    super("네트워크 연결을 확인해 주세요.");
    this.name = "NetworkError";
    this.originalError = originalError;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(path.startsWith("/admin/") && getAdminSessionToken() ? { "X-ADMIN-KEY": getAdminSessionToken()! } : {}),
        ...options.headers,
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: options.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new NetworkError(err);
  }

  let payload: CustomResponse<T> | undefined;
  try {
    payload = (await response.json()) as CustomResponse<T>;
  } catch {
    // 본문이 없는 응답(예: 일부 상태 변경 API)
  }

  if (!payload || !payload.isSuccess) {
    throw new ApiError(
      payload?.code ?? "UNKNOWN",
      payload?.message ?? `요청이 실패했습니다. (HTTP ${response.status})`,
      response.status,
    );
  }
  return payload.result;
}

export function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  return request<T>(path, { signal });
}

export function apiPost<T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> {
  return request<T>(path, { method: "POST", body, headers });
}

export function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: "PATCH", body });
}

export function apiDelete<T>(path: string): Promise<T> {
  return request<T>(path, { method: "DELETE" });
}
