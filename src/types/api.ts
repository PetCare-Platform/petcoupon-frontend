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
export interface CouponIssueDlqPageResponse {
  content: CouponIssueDlqResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}
export interface CouponIssueDlqReprocessResponse { messageId: number; requestId: string; }
// CouponIssueDlqAbandonResponse(POST .../abandon 응답)는 정의하지 않는다 — adminOperations.ts 주석 참고.
export type ReconciliationResult = "MATCHED" | "MISMATCHED" | "ERROR";

/** 정합성 검증 배치가 보는 6가지 항목. 백엔드 VerificationErrorType과 1:1이다. */
export type VerificationErrorType =
  | "STOCK_MISMATCH"
  | "DUPLICATE_ISSUE"
  | "INVALID_STATUS"
  | "HISTORY_MISMATCH"
  | "SEQUENCE_GAP"
  | "STOCK_NOT_RESTORED";

export interface VerificationDetailResponse {
  errorType: VerificationErrorType;
  couponIssueId: number | null;
  userId: number | null;
  expectedValue: string | null;
  actualValue: string | null;
  message: string | null;
}

/**
 * POST /admin/coupons/{couponId}/reconcile 응답.
 *
 * 정합성 문제 여부는 반드시 result로 판단한다 — errorCount는 발급 건 단위 오류만 세므로
 * STOCK_MISMATCH처럼 쿠폰 전체를 가리키는 문제만 있으면 result=MISMATCHED인데도 0이 된다.
 */
export interface ReconciliationTriggerResponse {
  reportId: number;
  couponId: number;
  asOfAt: string;
  result: ReconciliationResult;
  totalCount: number;
  successCount: number;
  errorCount: number;

  // null은 "미검증"(예: Redis 키가 아예 없음), 0은 "검증했고 실제로 0건"이라 구분해야 한다.
  stockTotal: number | null;
  stockIssued: number | null;
  stockRemaining: number | null;
  redisRemaining: number | null;
  dbDlqCount: number | null;
  maxSequenceNo: number | null;

  // verificationDetails는 응답 크기 보호를 위해 최대 500건까지만 담긴다. 전체 불일치 건수는
  // verificationDetailCount에 있고, 잘림 여부는 두 값을 비교해 판단한다.
  verificationDetailCount: number;
  verificationDetails: VerificationDetailResponse[];
}
export interface ReconciliationReportSummaryResponse {
  reportId: number;
  couponId: number;
  asOfAt: string;
  result: ReconciliationResult;
  totalCount: number;
  successCount: number;
  errorCount: number;
}

export type IssueMessageStatus = "PENDING" | "SENT" | "CONSUMED" | "FAILED" | "DLQ" | "ABANDONED";
export interface IssueThroughputBucketResponse {
  bucket: string;
  issuedCount: number;
  failedCount: number;
  inProgressCount: number;
}
export interface IssueStatusDistributionResponse { status: IssueMessageStatus; count: number; }
export interface IssueStatisticsResponse {
  timeSeries: IssueThroughputBucketResponse[];
  distribution: IssueStatusDistributionResponse[];
}

/**
 * GET /admin/coupons/{couponId}/pipeline-drain-status — 백엔드 #193.
 *
 * 정합성 검증·초기화의 사전 조건(쿠폰 ENDED + 파이프라인 소진)을 화면이 판단할 수 있게 한다.
 * 응답에 판정 결과(blocked)는 없어서 프론트가 isPipelineBlocked()로 계산한다.
 */
export interface CouponPipelineDrainStatusResponse {
  couponStatus: CouponStatus;
  /** 해당 쿠폰 기준 — Outbox 미소비(PENDING·SENT·FAILED) */
  outboxUnconsumed: number;
  /** 전역(공유 Stream) 기준 — 건수가 아니라 0 또는 1 플래그 */
  streamUndelivered: number;
  /** 전역(공유 Stream) 기준 — ACK 안 된 pending 실제 건수 */
  streamActivePending: number;
  /** true는 "잔여 0건"이 아니라 "확인 불가"다. 안전하게 차단으로 본다. */
  checkFailed: boolean;
}

/**
 * GET /admin/coupons/{couponId}/load-test-status — 백엔드 #195.
 *
 * 대시보드 1줄 카드와 2줄 깔때기가 이 응답 하나로 그려진다.
 * load-test/sql/verify_issue_result.sql을 서비스로 옮긴 값들이다.
 */
export interface CouponLoadTestStatusResponse {
  /** 접수된 요청 수 — idempotency_key 기준 */
  accepted: number;
  /** Redis 재고 차감을 통과한 수 */
  passed: number;
  /** 재고 소진 등으로 탈락한 수 */
  rejected: number;

  // 발급 파이프라인 단계별 잔여·완료
  pending: number;
  sent: number;
  consumed: number;
  failed: number;
  dlq: number;
  /**
   * Kafka 발행에 성공한 수 (#200). sent+consumed로 계산하면 발행된 뒤 소비에서 실패해
   * DLQ로 간 건이 빠져서 "발행을 못 했다"처럼 거꾸로 보이므로 백엔드가 직접 세어준다.
   * = SENT + CONSUMED + (DLQ·ABANDONED 중 사유가 CONSUME_PROCESSING_FAILED인 것)
   */
  published: number;
  inProgressIdempotencyKeys: number;

  /** 발급 수가 재고를 넘었는가 — 선착순의 합격 조건 */
  overIssued: boolean;
  /** 2매 이상 받은 회원 수 */
  duplicateUsers: number;
  /** 순번이 1..N으로 온전한가 */
  sequenceIntact: boolean;
  /** 첫 발급부터 마지막 발급까지 걸린 시간 */
  elapsedSeconds: number;
}

/**
 * GET /admin/coupons/{couponId}/failure-reasons — 백엔드 #195.
 *
 * 원안보다 분류가 좁다. EVENT_NOT_OPEN·EVENT_CLOSED는 멱등키 등록 전에 Fail-Fast로
 * 끝나 저장되지 않고, failures도 실제 코드에 있는 발생 지점 2개만 분류한다.
 */
export interface CouponFailureReasonResponse {
  /** 정상 탈락 — 선착순이 제대로 동작한 결과다. 실패로 표시하면 안 된다. */
  rejections: { soldOut: number; alreadyIssued: number };
  /** 이상 실패 — 0이어야 한다. */
  failures: { kafkaPublishFailed: number; consumeProcessingFailed: number };
}

/** GET /admin/coupons/{couponId}/issue-timeseries?windowSeconds=&bucketSeconds= — 백엔드 #198. */
export interface CouponIssueTimeSeriesResponse {
  couponId: number;
  windowSeconds: number;
  bucketSeconds: number;
  /** 요청이 0건인 구간도 0으로 채워져 온다(zero-filling). */
  timeSeries: IssueThroughputBucketResponse[];
}

export interface DashboardIssueStatusDistributionResponse { status: IssueStatus; count: number; }
export interface DashboardSummaryResponse {
  totalEvents: number;
  activeEvents: number;
  totalCoupons: number;
  activeCoupons: number;
  startedCouponTotalStock: number;
  startedCouponIssuedStock: number;
  startedCouponRemainingStock: number;
  startedCouponIssueRate: number;
  couponIssueStatusDistribution: DashboardIssueStatusDistributionResponse[];
}

export interface ComponentHealthResponse { name: string; status: string; }
export interface SystemHealthResponse {
  overallStatus: string;
  components: ComponentHealthResponse[];
}
export interface MonitoringSettingsResponse { streamEnabled: boolean; }
export interface MonitoringEventResponse {
  id: string;
  level: "WARN" | "ERROR" | string;
  source: string;
  message: string;
  exception: string | null;
  occurredAt: string;
}
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
