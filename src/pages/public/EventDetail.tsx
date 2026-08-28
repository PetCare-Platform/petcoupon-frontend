import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PawPrint } from "@phosphor-icons/react";
import { Layout } from "../../components/Layout";
import { BackLink, BrandIllustration, Eyebrow, LinkButton, StatusPill } from "../../components/ui";
import { getPublicEventDetail } from "../../api/events";
import { getCouponRealtimeStatus } from "../../api/coupons";
import { applyForCoupon, getCouponIssueRequestStatus, listUserCouponIssues } from "../../api/couponIssues";
import { getCurrentUserId, subscribeCurrentUserId } from "../../api/currentUser";
import { clearIdempotencyKey, getOrCreateIdempotencyKey } from "../../api/idempotency";
import { ApiError, NetworkError } from "../../api/http";
import { formatDateTime } from "../../lib/date";
import type {
  CouponRealtimeStatusResponse,
  CouponStatus,
  DiscountType,
  EventStatus,
  PublicEventCouponResponse,
  PublicEventDetailResponse,
} from "../../types/api";

const eventStatusLabel: Record<EventStatus, string> = { SCHEDULED: "오픈 예정", OPEN: "진행 중", CLOSED: "종료" };
const eventStatusTone: Record<EventStatus, "open" | "scheduled" | "closed"> = { SCHEDULED: "scheduled", OPEN: "open", CLOSED: "closed" };

const couponStatusLabel: Record<CouponStatus, string> = {
  READY: "발급 예정",
  ACTIVE: "발급 중",
  SOLD_OUT: "소진",
  ENDED: "발급 종료",
};
const couponStatusTone: Record<CouponStatus, "open" | "scheduled" | "closed"> = {
  READY: "scheduled",
  ACTIVE: "open",
  SOLD_OUT: "closed",
  ENDED: "closed",
};

/** 프론트 재고 status 조회 결과를 쿠폰 기본정보에 붙인 화면 모델. */
type CouponViewModel = PublicEventCouponResponse & {
  stock?: CouponRealtimeStatusResponse;
  stockError?: boolean;
};

type IssuePhase = "issuing" | "waiting" | "pending" | "success" | "error";
type IssueState = { couponId: number; phase: IssuePhase; message?: string };

// 발급 요청 상태 조회(GET .../coupon-issue-requests/status)의 status 값.
// 접수 직후에는 "WAITING"이고, 백엔드 비동기 처리가 끝나면 다른 값으로 바뀐다.
const PENDING_ISSUE_STATUSES = new Set(["WAITING", "IN_PROGRESS", "PENDING", "PROCESSING", "QUEUED"]);
const FAILED_ISSUE_STATUSES = new Set(["FAILED", "FAILURE", "ERROR", "REJECTED", "CANCELED", "CANCELLED"]);

function discountLabel(type: DiscountType, value: number): string {
  return type === "RATE" ? `${value}%` : `${value.toLocaleString()}원`;
}

function conditionLine(coupon: PublicEventCouponResponse): string {
  const parts: string[] = [];
  if (coupon.minOrderAmount > 0) parts.push(`${coupon.minOrderAmount.toLocaleString()}원 이상 구매 시`);
  if (coupon.discountType === "RATE" && coupon.maxDiscountAmount) parts.push(`최대 ${coupon.maxDiscountAmount.toLocaleString()}원 할인`);
  return parts.join(" · ");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/**
 * 신청 직후에는 비동기 처리가 끝나지 않아 최종 결과가 없다. 같은 Idempotency-Key로
 * 상태 조회 API를 폴링하고, 대기 상태(WAITING 등)가 아니게 되면 최종 응답을 돌려준다.
 * settled=false 면 폴링 시간 내에 처리가 끝나지 않은 것(에러가 아니라 아직 진행 중).
 */
async function pollIssueResult(userId: number, idempotencyKey: string) {
  let last: Awaited<ReturnType<typeof getCouponIssueRequestStatus>> | undefined;
  for (let attempt = 0; attempt < 12; attempt += 1) {
    last = await getCouponIssueRequestStatus(userId, idempotencyKey);
    if (!PENDING_ISSUE_STATUSES.has((last.status ?? "").toUpperCase())) {
      return { settled: true as const, status: last };
    }
    await sleep(800);
  }
  return { settled: false as const, status: last };
}

export default function EventDetail() {
  const { id } = useParams();
  const eventId = Number(id);

  const [event, setEvent] = useState<PublicEventDetailResponse | null>(null);
  const [eventError, setEventError] = useState("");
  const [coupons, setCoupons] = useState<CouponViewModel[] | null>(null);
  const [couponStatusLoading, setCouponStatusLoading] = useState(false);
  const [issue, setIssue] = useState<IssueState | null>(null);
  const [userId, setUserId] = useState<number | null>(() => getCurrentUserId());

  useEffect(() => subscribeCurrentUserId(() => setUserId(getCurrentUserId())), []);

  // 이벤트 상세 진입/새로고침(= 컴포넌트 마운트) 시마다:
  //   1) GET /events/{eventId} 로 이벤트 정보 + 연결 쿠폰 기본정보를 가져오고
  //   2) 각 쿠폰의 GET /coupons/{couponId}/status 를 병렬 조회해 "남은 수량"을 병합한다.
  // 한 이펙트 + 단일 cancelled 플래그로 모든 setState 를 가드해 StrictMode 이중 실행/경쟁을 막는다.
  useEffect(() => {
    if (!Number.isFinite(eventId)) {
      setEventError("이벤트를 찾을 수 없습니다.");
      return;
    }
    const controller = new AbortController();
    let cancelled = false;

    setEvent(null);
    setEventError("");
    setCoupons(null);
    setIssue(null);
    setCouponStatusLoading(false);

    (async () => {
      let detail: PublicEventDetailResponse;
      try {
        detail = await getPublicEventDetail(eventId, controller.signal);
      } catch (err) {
        if (cancelled || (err instanceof DOMException && err.name === "AbortError")) return;
        setEventError(err instanceof ApiError || err instanceof NetworkError ? err.message : "이벤트를 불러오지 못했습니다.");
        return;
      }
      if (cancelled) return;
      setEvent(detail);
      setCoupons(detail.coupons.map((coupon) => ({ ...coupon })));

      if (detail.coupons.length === 0) return;
      setCouponStatusLoading(true);
      // 일부 쿠폰의 status 조회가 실패해도 이벤트 상세 전체를 실패로 만들지 않는다.
      const results = await Promise.all(
        detail.coupons.map((coupon) =>
          getCouponRealtimeStatus(coupon.couponId, controller.signal)
            .then((stock) => ({ couponId: coupon.couponId, stock, stockError: false }))
            .catch((): { couponId: number; stock?: CouponRealtimeStatusResponse; stockError: boolean } => ({
              couponId: coupon.couponId,
              stock: undefined,
              stockError: true,
            })),
        ),
      );
      if (cancelled) return;
      setCoupons((prev) =>
        (prev ?? []).map((coupon) => {
          const match = results.find((r) => r.couponId === coupon.couponId);
          return match ? { ...coupon, stock: match.stock, stockError: match.stockError } : coupon;
        }),
      );
      setCouponStatusLoading(false);
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [eventId]);

  const refreshOneCouponStatus = useCallback(async (couponId: number) => {
    try {
      const stock = await getCouponRealtimeStatus(couponId);
      setCoupons((prev) => (prev ?? []).map((coupon) => (coupon.couponId === couponId ? { ...coupon, stock, stockError: false } : coupon)));
    } catch {
      /* 발급 후 재고 재조회 실패는 조용히 무시 — 다음 진입 때 다시 조회된다 */
    }
  }, []);

  const issuing = issue?.phase === "issuing" || issue?.phase === "waiting";

  async function handleIssue(couponId: number) {
    if (issuing) return;
    const currentUserId = getCurrentUserId();
    if (currentUserId === null) {
      setIssue({ couponId, phase: "error", message: "사용자 ID가 설정되지 않아 쿠폰을 발급할 수 없습니다." });
      return;
    }
    const idempotencyKey = getOrCreateIdempotencyKey(couponId, currentUserId);

    // 발급 전 보유 쿠폰 스냅샷 — status 엔드포인트가 완료 뒤에도 WAITING 을 유지하는 경우가 있어
    // 폴링만으로는 성공을 확정하기 어렵다. 발급 후 목록에 "새로" 생긴 항목으로 성공 여부를 판정한다.
    let priorIssueIds = new Set<number>();
    try {
      priorIssueIds = new Set((await listUserCouponIssues(currentUserId)).map((c) => c.couponIssueId));
    } catch {
      /* 스냅샷 실패는 무시 — 아래 확정 로직이 보수적으로 pending 처리한다 */
    }

    setIssue({ couponId, phase: "issuing" });
    try {
      await applyForCoupon(couponId, currentUserId, idempotencyKey);
      setIssue({ couponId, phase: "waiting" });
      const { settled, status } = await pollIssueResult(currentUserId, idempotencyKey);
      const statusText = (status?.status ?? "").toUpperCase();

      if (settled && FAILED_ISSUE_STATUSES.has(statusText)) {
        // 최종 상태가 실패 — 다음 시도는 새 요청이어야 하므로 키를 지운다.
        clearIdempotencyKey(couponId, currentUserId);
        setIssue({ couponId, phase: "error", message: "쿠폰 발급에 실패했습니다. 다시 시도해주세요." });
        return;
      }

      // 성공 확정: status 응답에 couponIssueId 가 있거나, 보유 쿠폰 목록에 이번에 새로 생긴 항목이 있으면 성공.
      let issuedConfirmed = !!status?.couponIssueId;
      if (!issuedConfirmed) {
        try {
          const mine = await listUserCouponIssues(currentUserId);
          issuedConfirmed = mine.some((c) => c.couponId === couponId && !priorIssueIds.has(c.couponIssueId));
        } catch {
          /* 확인 조회 실패 시 아래에서 pending 처리 */
        }
      }

      if (issuedConfirmed) {
        clearIdempotencyKey(couponId, currentUserId);
        setIssue({ couponId, phase: "success" });
      } else {
        // 접수는 됐으나 아직 처리 확인이 안 됨(에러 아님). 키는 남겨 두고 접수 안내만 표시.
        setIssue({
          couponId,
          phase: "pending",
          message: "발급 요청이 접수됐어요. 처리에 시간이 걸릴 수 있어요. 잠시 후 내 쿠폰에서 확인해 주세요.",
        });
      }
    } catch (err) {
      // ApiError는 백엔드가 응답까지 끝낸 확정 실패(품절/중복신청 등)라 같은 키로 재시도하면
      // 그 실패를 그대로 재현(REPLAY)한다 — 키를 지워 다음 시도가 새 요청으로 가게 한다.
      // NetworkError는 서버 도달 여부를 알 수 없으니 키를 남겨 안전하게 재시도한다.
      if (err instanceof ApiError) clearIdempotencyKey(couponId, currentUserId);
      setIssue({
        couponId,
        phase: "error",
        message: err instanceof ApiError || err instanceof NetworkError ? err.message : "쿠폰 발급에 실패했습니다. 다시 시도해주세요.",
      });
    } finally {
      void refreshOneCouponStatus(couponId);
    }
  }

  if (eventError) {
    return (
      <Layout area="public">
        <section className="py-10">
          <div className="container-page">
            <BackLink to="/">이벤트 목록</BackLink>
            <h1 className="mt-2">{eventError}</h1>
            <p className="mt-3 text-ink/70">주소를 다시 확인하거나 이벤트 목록에서 다시 선택해 주세요.</p>
          </div>
        </section>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout area="public">
        <section className="py-10">
          <div className="container-page">
            <div className="h-8 w-40 animate-pulse rounded-full bg-surface-2" />
            <div className="mt-4 h-[220px] animate-pulse rounded-block bg-surface-2" />
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout area="public">
      <section className="py-10">
        <div className="container-page grid gap-10 md:grid-cols-[1.15fr_1fr] md:items-center">
          <div>
            <BackLink to="/">이벤트 목록</BackLink>
            <Eyebrow>{eventStatusLabel[event.status]}</Eyebrow>
            <h1 className="mt-2">{event.name}</h1>
            {event.description ? <p className="mt-4 max-w-[56ch] text-[18px] text-ink/70">{event.description}</p> : null}
            <p className="mt-4 text-[15px] font-medium text-ink-muted">
              이벤트 기간 · {formatDateTime(event.openAt)} ~ {formatDateTime(event.closeAt)}
            </p>
            <div className="mt-8">
              <LinkButton to="#coupons">쿠폰 확인하기</LinkButton>
            </div>
          </div>
          <div>
            <BrandIllustration aspect="aspect-[4/3]" />
          </div>
        </div>
      </section>

      <section id="coupons" className="py-10">
        <div className="container-page max-w-3xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Eyebrow>
                <PawPrint weight="fill" className="h-3.5 w-3.5" aria-hidden="true" />
                이벤트 쿠폰
              </Eyebrow>
              <h2 className="mt-2">이 이벤트에서 받을 수 있는 쿠폰</h2>
              <p className="mt-2 text-[17px] text-ink/70">한 사람당 쿠폰 한 종류당 한 장만 받을 수 있어요.</p>
            </div>
          </div>

          {userId === null ? (
            <div className="mt-6 rounded-control border border-clay/30 bg-clay/10 p-4 text-sm text-clay-ink">
              <strong className="block">사용자 ID가 설정되어 있지 않아요.</strong>
              <p className="mt-1">
                쿠폰을 발급받으려면 먼저{" "}
                <Link to="/user" className="underline underline-offset-4">
                  사용자 정보
                </Link>
                에서 사용자 ID를 설정해 주세요.
              </p>
            </div>
          ) : null}

          {coupons && coupons.length === 0 ? (
            <div className="mt-6 rounded-block border border-dashed border-hairline p-10 text-center">
              <h3 className="text-lg font-semibold">아직 연결된 쿠폰이 없어요.</h3>
              <p className="mt-2 text-ink/70">이 이벤트에 쿠폰이 등록되면 이곳에서 발급받을 수 있어요.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {(coupons ?? []).map((coupon) => {
                const remaining = coupon.stock?.remainingQuantity;
                const soldOutByStock = remaining !== undefined && remaining <= 0;
                const canIssue = coupon.status === "ACTIVE" && !soldOutByStock && userId !== null && !issuing;
                const thisIssue = issue?.couponId === coupon.couponId ? issue : null;
                return (
                  <article key={coupon.couponId} className="rounded-block border border-hairline p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold">{coupon.name}</h3>
                          <StatusPill tone={couponStatusTone[coupon.status]}>{couponStatusLabel[coupon.status]}</StatusPill>
                        </div>
                        {conditionLine(coupon) ? <p className="mt-1 text-sm text-ink/70">{conditionLine(coupon)}</p> : null}
                      </div>
                      <span className="text-2xl font-semibold">{discountLabel(coupon.discountType, coupon.discountValue)}</span>
                    </div>

                    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <dt className="text-ink/50">발급 기간</dt>
                        <dd className="font-medium">
                          {formatDateTime(coupon.issueStartAt)} ~ {formatDateTime(coupon.issueEndAt)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-ink/50">사용 기한</dt>
                        <dd className="font-medium">발급 후 {coupon.validDays}일</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-ink/50">남은 수량</dt>
                        <dd className="font-medium tabular-nums">
                          {coupon.stockError ? (
                            <span className="text-clay-ink">재고 정보를 불러오지 못했습니다.</span>
                          ) : coupon.stock ? (
                            <>
                              {coupon.stock.remainingQuantity.toLocaleString()} / {coupon.stock.totalQuantity.toLocaleString()}장
                              <span className="ml-2 font-normal text-ink/50">발급 {coupon.stock.issuedQuantity.toLocaleString()}건</span>
                            </>
                          ) : couponStatusLoading ? (
                            <span className="text-ink/50">재고 확인 중…</span>
                          ) : (
                            <span className="text-ink/50">—</span>
                          )}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-5">
                      <button
                        type="button"
                        onClick={() => handleIssue(coupon.couponId)}
                        disabled={!canIssue}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-ink bg-ink px-5 text-[18px] font-medium text-paper transition-all active:scale-[0.97] hover:bg-[#262626] disabled:cursor-not-allowed disabled:border-hairline disabled:bg-surface-2 disabled:text-ink-muted disabled:hover:bg-surface-2"
                      >
                        {thisIssue?.phase === "issuing" || thisIssue?.phase === "waiting" ? (
                          <span className="h-4 w-4 flex-none animate-spin rounded-full border-2 border-paper/30 border-t-paper" aria-hidden="true" />
                        ) : null}
                        {thisIssue?.phase === "issuing"
                          ? "발급 요청 중"
                          : thisIssue?.phase === "waiting"
                            ? "발급 처리 중"
                            : coupon.status === "READY"
                              ? "발급 예정"
                              : coupon.status === "SOLD_OUT" || soldOutByStock
                                ? "소진되었습니다"
                                : coupon.status === "ENDED"
                                  ? "발급이 종료되었습니다"
                                  : "쿠폰 발급"}
                      </button>
                    </div>

                    {thisIssue && thisIssue.phase === "success" ? (
                      <div className="mt-4 rounded-control border border-success/30 bg-success/10 p-4 text-sm">
                        <strong className="block text-[#0a8f3c]">쿠폰이 발급되었습니다.</strong>
                        <LinkButton to="/user/my-coupons" variant="secondary" className="mt-3 !min-h-10 !text-[15px]">
                          내 쿠폰 보기
                        </LinkButton>
                      </div>
                    ) : null}

                    {thisIssue && thisIssue.phase === "pending" ? (
                      <div className="mt-4 rounded-control border border-hairline bg-surface-2 p-4 text-sm">
                        <strong className="block">발급 요청이 접수됐어요.</strong>
                        {thisIssue.message ? <p className="mt-1 text-ink/80">{thisIssue.message}</p> : null}
                        <LinkButton to="/user/my-coupons" variant="secondary" className="mt-3 !min-h-10 !text-[15px]">
                          내 쿠폰 보기
                        </LinkButton>
                      </div>
                    ) : null}

                    {thisIssue && thisIssue.phase === "error" ? (
                      <div className="mt-4 rounded-control border border-danger/30 bg-danger/10 p-4 text-sm">
                        <strong className="block text-danger">{thisIssue.message}</strong>
                        {userId === null ? (
                          <LinkButton to="/user" variant="secondary" className="mt-3 !min-h-10 !text-[15px]">
                            사용자 ID 설정하기
                          </LinkButton>
                        ) : (
                          <p className="mt-1 text-ink/80">잠시 후 다시 시도하거나 다른 쿠폰을 확인해 주세요.</p>
                        )}
                      </div>
                    ) : null}
                  </article>
                );
              })}

              {coupons === null ? (
                <div className="grid gap-4">
                  {[0, 1].map((i) => (
                    <div key={i} className="h-[200px] animate-pulse rounded-block border border-hairline bg-surface-2" />
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
