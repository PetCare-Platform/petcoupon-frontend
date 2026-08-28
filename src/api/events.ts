import { apiGet, apiPatch, apiPost } from "./http";
import type {
  EventCreateRequest,
  EventCreateResponse,
  EventDetailResponse,
  EventListResponse,
  EventPageResponse,
  EventUpdateRequest,
  EventStatusResponse,
  EventStatusUpdateRequest,
  EventUpdateResponse,
  PublicEventDetailResponse,
} from "../types/api";

/** POST /admin/events — 1차, 구현됨 */
export function createEvent(body: EventCreateRequest): Promise<EventCreateResponse> {
  return apiPost<EventCreateResponse>("/admin/events", body);
}

/** GET /admin/events — 관리자용 전체 이벤트 목록(상태 무관). page는 0부터, size는 10/20/50/100만 허용. */
export function getAllEvents(page = 0, size = 20, signal?: AbortSignal): Promise<EventPageResponse> {
  return apiGet<EventPageResponse>(`/admin/events?page=${page}&size=${size}`, signal);
}

/**
 * GET /events — 공개 이벤트 목록. 백엔드가 OPEN 상태만 내려준다(프론트도 방어적으로 한 번 더 거른다).
 * 응답은 bare 배열이거나 Spring Page 봉투일 수 있어 둘 다 받아 content로 정규화한다.
 * 공개 홈(Index.tsx)이 쓰는 유일한 이벤트 소스 — 예전 src/data/events.ts 목데이터는 제거됐다.
 */
export async function getPublicEvents(signal?: AbortSignal): Promise<EventListResponse[]> {
  // Page 봉투로 오는 경우 기본 size(20)로 잘리므로 한 번에 넉넉히 가져온다(관리자 목록과 동일).
  const data = await apiGet<EventListResponse[] | EventPageResponse>("/events?page=0&size=100", signal);
  const list = Array.isArray(data) ? data : data.content;
  return list.filter((event) => event.status === "OPEN");
}

/**
 * GET /events/{eventId} — 공개 이벤트 상세. 이벤트 정보 + 연결 쿠폰 기본정보 목록을 함께 준다.
 * 공개 화면은 관리자 API(GET /admin/events/{eventId})를 쓰지 않는다.
 */
export function getPublicEventDetail(eventId: number, signal?: AbortSignal): Promise<PublicEventDetailResponse> {
  return apiGet<PublicEventDetailResponse>(`/events/${eventId}`, signal);
}

/**
 * GET /admin/events/{eventId} — 관리자 이벤트 상세. 관리자 이벤트 수정 폼(EventForm)에서만 쓴다.
 * 공개 이벤트 상세는 getPublicEventDetail 을 사용한다.
 */
export function getEventDetail(eventId: number, signal?: AbortSignal): Promise<EventDetailResponse> {
  return apiGet<EventDetailResponse>(`/admin/events/${eventId}`, signal);
}

/**
 * GET /events/{eventId}/status — 위와 동일한 사유로 admin 엔드포인트 사용.
 * (코드상 공개 버전은 존재하지 않음 — GlobalExceptionHandler 로 404 처리됨)
 */
export function getEventStatus(eventId: number, signal?: AbortSignal): Promise<EventStatusResponse> {
  return apiGet<EventStatusResponse>(`/admin/events/${eventId}/status`, signal);
}

export function updateEvent(eventId: number, body: EventUpdateRequest): Promise<EventUpdateResponse> {
  return apiPatch<EventUpdateResponse>(`/admin/events/${eventId}`, body);
}

/** 상태 전이는 SCHEDULED→OPEN, OPEN→CLOSED 만 허용(EventStatus.canTransitionTo) */
export function updateEventStatus(eventId: number, body: EventStatusUpdateRequest): Promise<EventUpdateResponse> {
  return apiPatch<EventUpdateResponse>(`/admin/events/${eventId}/status`, body);
}
