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

export interface EventNameUpdateRequest {
  name: string;
}

export interface EventUpdateRequest {
  name?: string;
  description?: string;
  openAt?: string;
  closeAt?: string;
}

export interface EventDescriptionUpdateRequest {
  description?: string;
}

export interface EventPeriodUpdateRequest {
  openAt: string;
  closeAt: string;
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

// ---- Coupon Issue ----

export interface CouponIssueCreateRequest {
  userId: number;
}

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

export interface CouponIssueRequestStatusResponse { status: "IN_PROGRESS" | string; couponIssueId?: number | null; couponId?: number; userId?: number; sequenceNo?: number | null; }

export interface CouponIssueDlqResponse { messageId: number; couponId: number; userId: number; requestId: string; retryCount: number; lastError: string; createdAt: string; }
export interface CouponIssueDlqReprocessResponse { messageId: number; requestId: string; }
export interface ReconciliationTriggerResponse { reportId: number; couponId: number; asOfAt: string; result: string; totalCount: number; successCount: number; errorCount: number; }
export interface AdminSessionCreateResponse { token: string; expiresAt: string; }

export interface CouponIssueUseRequest {
  userId: number;
}

export interface CouponIssueCancelRequest {
  userId: number;
}

export interface CouponIssueStatusResponse {
  status: IssueStatus;
  isUsable: boolean;
  expiresAt: string;
}

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
