/**
 * 백엔드(petcoupon-backend-1) 실제 코드에서 확인한 enum·DTO 타입.
 * 명세에만 있고 코드에 없는 필드는 절대 추가하지 않는다.
 */

// coupon/entity/enums
export type CouponStatus = "READY" | "ACTIVE" | "SOLD_OUT" | "ENDED";
export type DiscountType = "FIXED_AMOUNT" | "RATE";
export type IssueStatus = "ISSUED" | "USED" | "CANCELED" | "EXPIRED";

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

// ---- Coupon Issue ----

export interface CouponIssueCreateRequest {
  userId: number;
}

/**
 * 백엔드 주석("Redis mock 단계") 확인: couponId, userId 뿐이다.
 * 명세의 status:"WAITING" 은 실제 응답에 없다 — couponIssueId 도 없다.
 * 폴링 시작 지점을 이 응답만으로는 찾을 수 없어, 신청 성공 후 보유 쿠폰
 * 목록에서 couponId 로 매칭하는 방식으로 우회한다 (EventDetail.tsx 참고).
 */
export interface CouponIssueCreateResponse {
  couponId: number;
  userId: number;
}

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
  canceledAt: string | null;
  expiresAt: string;
}

// ---- Internal ----

export interface CouponResetRequest {
  totalQuantity?: number;
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
}
