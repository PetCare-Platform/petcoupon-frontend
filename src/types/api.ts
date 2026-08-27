/**
 * 백엔드(petcoupon-backend-1) 실제 코드에서 확인한 enum·DTO 타입.
 * 명세에만 있고 코드에 없는 필드는 절대 추가하지 않는다.
 */

// coupon/entity/enums
export type CouponStatus = "READY" | "ACTIVE" | "SOLD_OUT" | "ENDED";
export type DiscountType = "FIXED_AMOUNT" | "RATE";
export type IssueStatus = "ISSUED" | "USED" | "EXPIRED";

// event/entity/enums
export type EventStatus = "SCHEDULED" | "OPEN" | "CLOSED";

// global/common/CustomResponse
export interface CustomResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

// ---- Event ----

export interface EventCreateRequest {
  name: string;
  description?: string;
  openAt: string; // LocalDateTime, "yyyy-MM-ddTHH:mm:ss"
  closeAt: string;
}

/**
 * 이벤트 부분 수정 — 백엔드가 필드별 개별 엔드포인트(name/description/period)를
 * PATCH /admin/events/{eventId} 하나로 통합했다. 바뀐 필드만 담아 보낸다.
 */
export interface EventUpdateRequest {
  name?: string;
  description?: string;
  openAt?: string;
  closeAt?: string;
}

export interface EventStatusUpdateRequest {
  status: EventStatus;
  reason?: string;
}

// EventCreateResponse / EventDetailResponse / EventUpdateResponse 는 동일 필드 셋
export interface EventDetailResponse {
  eventId: number;
  name: string;
  description: string | null;
  openAt: string;
  closeAt: string;
  status: EventStatus;
}
export type EventCreateResponse = EventDetailResponse;
export type EventUpdateResponse = EventDetailResponse;

export interface EventStatusResponse {
  eventId: number;
  status: EventStatus;
}

/** GET /admin/events, GET /events 목록 한 줄. 상세와 필드가 같지만 별도 응답 타입이라 분리해 둔다. */
export interface EventListResponse {
  eventId: number;
  name: string;
  description: string | null;
  openAt: string;
  closeAt: string;
  status: EventStatus;
}

/**
 * GET /events/{eventId} — 공개 이벤트 상세. 관리자 상세(EventDetailResponse)와 달리
 * 이 이벤트에 연결된 쿠폰 기본정보 목록(coupons)을 함께 내려준다.
 * 실시간 재고는 여기 없다 — couponId별로 GET /coupons/{couponId}/status 를 따로 조회해 병합한다.
 */
export interface PublicEventCouponResponse {
  couponId: number;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  issueStartAt: string;
  issueEndAt: string;
  validDays: number;
  status: CouponStatus;
}

export interface PublicEventDetailResponse {
  eventId: number;
  name: string;
  description: string | null;
  openAt: string;
  closeAt: string;
  status: EventStatus;
  coupons: PublicEventCouponResponse[];
}

/** Spring Page를 그대로 옮긴 형태 — Coupon 목록(CouponPageResponse)과 필드가 같다. */
export interface EventPageResponse {
  content: EventListResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// ---- Coupon ----

export interface CouponCreateRequest {
  name: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  issueStartAt: string;
  issueEndAt: string;
  validDays: number;
  totalQuantity: number;
}

export interface CouponCreateResponse {
  couponId: number;
  eventId: number;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  issueStartAt: string;
  issueEndAt: string;
  validDays: number;
  totalQuantity: number;
  status: CouponStatus;
}

export interface CouponUpdateRequest {
  name?: string;
  discountType?: DiscountType;
  discountValue?: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  issueStartAt?: string;
  issueEndAt?: string;
  validDays?: number;
  totalQuantity?: number;
}

export interface CouponUpdateResponse extends CouponCreateResponse { updatedAt: string; }
export interface CouponRealtimeStatusResponse { couponId: number; totalQuantity: number; remainingQuantity: number; issuedQuantity: number; initialized: boolean; }

/**
 * GET /admin/coupons 목록 한 줄.
 * 재고 수치(total/issued/remaining)는 Redis 실시간 값이 아니라 DB(coupon_stock) 기준이다 —
 * 목록에서 쿠폰마다 Redis를 조회하면 왕복이 N번 생기고 한 건의 정합성 오류로 페이지 전체가
 * 실패하기 때문. 실시간 값이 필요하면 getCouponRealtimeStatus(단건)를 쓴다.
 * 재고 갱신 시각은 백엔드가 아직 신뢰할 수 있는 값을 못 만들어서(벌크 UPDATE라
 * @LastModifiedDate 미동작) 응답에 없다 — 프론트도 임의로 만들어 붙이지 않는다.
 */
export interface CouponListResponse {
  couponId: number;
  eventId: number;
  eventName: string;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  issueStartAt: string;
  issueEndAt: string;
  validDays: number;
  status: CouponStatus;
  totalQuantity: number;
  issuedQuantity: number;
  remainingQuantity: number;
}

export interface CouponPageResponse {
  content: CouponListResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// ---- Coupon Issue ----

// CouponIssueCreateRequest — applyForCoupon이 { userId }를 인라인 객체로 바로 넘겨서
// 이 타입을 참조하는 곳이 없다. 백엔드 요청 바디 모양은 여기 주석으로만 남긴다: { userId: number }.

/**
 * 접수 응답은 status:"WAITING"이며 couponIssueId와 sequenceNo는 null일 수 있다.
 * 같은 Idempotency-Key를 상태 조회 API에 보내 비동기 최종 결과를 확인한다.
 */
export interface CouponIssueCreateResponse {
  couponIssueId: number | null;
  couponId: number;
  userId: number;
  sequenceNo: number | null;
  status: string;
}

// status: 접수 직후엔 "WAITING"(진행 중), 백엔드 비동기 처리가 끝나면 다른 값(성공/실패)으로 바뀐다.
export interface CouponIssueRequestStatusResponse { status: "WAITING" | "IN_PROGRESS" | string; couponIssueId?: number | null; couponId?: number; userId?: number; sequenceNo?: number | null; }

export interface CouponIssueDlqResponse { messageId: number; couponId: number; userId: number; requestId: string; retryCount: number; lastError: string; createdAt: string; }
export interface CouponIssueDlqReprocessResponse { messageId: number; requestId: string; }
// CouponIssueDlqAbandonResponse(POST .../abandon 응답)는 정의하지 않는다 — adminOperations.ts 주석 참고.
export interface ReconciliationTriggerResponse { reportId: number; couponId: number; asOfAt: string; result: string; totalCount: number; successCount: number; errorCount: number; }
export interface AdminSessionCreateResponse { token: string; expiresAt: string; }

export interface CouponIssueUseRequest {
  userId: number;
}

export interface CouponIssueCancelRequest {
  userId: number;
}

// CouponIssueStatusResponse(GET /coupon-issues/{id}/status 전용 { status, isUsable, expiresAt })는
// getCouponIssueDetail이 같은 필드를 더 많은 정보와 함께 주므로 쓰는 곳이 없어 정의하지 않는다.

export interface CouponIssueDetailResponse {
  couponIssueId: number;
  couponCode: string;
  status: IssueStatus;
  isUsable: boolean;
  usedAt: string | null;
  expiresAt: string;
  createdAt: string;
}

export interface CouponIssueRequestResponse {
  couponIssueId: number;
  couponId: number;
  couponName: string;
  couponCode: string;
  status: IssueStatus;
  issuedAt: string;
  usedAt: string | null;
  expiresAt: string;
}

// ---- Internal ----

export interface CouponResetRequest {
  totalQuantity?: number;
  force?: boolean;
}

export interface CouponResetResponse {
  couponId: number;
  deletedHistories: number;
  deletedIdempotencyKeys: number;
  deletedNotifications: number;
  deletedIssues: number;
  deletedMessages: number;
  deletedReports: number;
  totalQuantity: number;
  remainingQuantity: number;
  redisStock: number | null;
}
