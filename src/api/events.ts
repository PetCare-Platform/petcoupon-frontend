import { apiGet, apiPatch, apiPost } from "./http";
import type {
  EventCreateRequest,
  EventCreateResponse,
  EventDetailResponse,
  EventPageResponse,
  EventUpdateRequest,
  EventStatusResponse,
  EventStatusUpdateRequest,
  EventUpdateResponse,
} from "../types/api";

/** POST /admin/events — 1차, 구현됨 */
export function createEvent(body: EventCreateRequest): Promise<EventCreateResponse> {
  return apiPost<EventCreateResponse>("/admin/events", body);
}

/** GET /admin/events — 관리자용 전체 이벤트 목록(상태 무관). page는 0부터, size는 10/20/50/100만 허용. */
export function getAllEvents(page = 0, size = 20, signal?: AbortSignal): Promise<EventPageResponse> {
  return apiGet<EventPageResponse>(`/admin/events?page=${page}&size=${size}`, signal);
}

// GET /events — 비로그인 공개 목록(OPEN 상태만). 공개 홈(Index.tsx)이 아직 이 응답
// 모양(name/description/openAt/closeAt/status)이 아니라 benefit·metrics·guide 같은
// 프로모션 필드를 쓰는 목데이터 그대로라, 붙일 화면이 없어 함수를 두지 않는다.
// 카드 디자인을 다시 짤 때 getAllEvents와 같은 형태로 추가하면 된다.

/**
 * GET /events/{eventId} — 팀 노션 원 URL은 공개 경로지만 비고에 "공개 API는
 * 미구현, 동일 DTO 쓰는 GET /admin/events/{eventId}는 구현됨"이라고 명시돼
 * 있어 그 안내를 따라 admin 엔드포인트를 호출한다.
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
