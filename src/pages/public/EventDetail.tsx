import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Layout } from "../../components/Layout";
import {
  BackLink,
  BrandIllustration,
  ColorBlock,
  Eyebrow,
  LinkButton,
  MetricGrid,
  MetricTile,
  PawPrint,
  StatusPill,
} from "../../components/ui";
import { useToast } from "../../context/ToastContext";
import { EVENTS, getEvent, type EventStatus } from "../../data/events";
import { applyForCoupon, getCouponIssueRequestStatus } from "../../api/couponIssues";
import { getCouponRealtimeStatus } from "../../api/coupons";
import { getEventDetail } from "../../api/events";
import { getCurrentUserId } from "../../api/currentUser";
import { clearIdempotencyKey, getOrCreateIdempotencyKey } from "../../api/idempotency";
import { ApiError, NetworkError } from "../../api/http";
import type { EventDetailResponse } from "../../types/api";
import NotFound from "./NotFound";

const statusLabel: Record<EventStatus, string> = { open: "진행 중", scheduled: "오픈 예정", closed: "종료" };
const statusDotClass: Record<EventStatus, string> = {
  open: "bg-accent",
  scheduled: "bg-ink/30",
  closed: "bg-ink/20",
};
const realStatusLabel: Record<EventDetailResponse["status"], string> = { SCHEDULED: "오픈 예정", OPEN: "진행 중", CLOSED: "종료" };

function deadlineTone(label: string, value: string): "warning" | undefined {
  if (!label.includes("종료")) return undefined;
  const match = /^D-(\d+)$/.exec(value);
  return match && Number(match[1]) <= 3 ? "warning" : undefined;
}

function parseEventTimestamp(hint: string): Date | null {
  const match = /(\d{1,2})월\s*(\d{1,2})일\s*(\d{1,2}):(\d{2})/.exec(hint);
  if (!match) return null;
  const [, month, day, hour, minute] = match.map(Number);
  return new Date(new Date().getFullYear(), month - 1, day, hour, minute, 0);
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(Math.floor(ms / 1000), 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(totalSeconds / 3600))}:${pad(Math.floor((totalSeconds % 3600) / 60))}:${pad(totalSeconds % 60)}`;
}

/**
 * 아래 두 동작(실시간 재고 감소 시뮬레이션, 발급 성공 시뮬레이션)은 실제 백엔드
 * 없이 성공한 것처럼 보이게 하는 데모용 가짜 로직이다. 실제 API 연동 전까지는
 * 화면에 노출하지 않기 위해 비활성화한다. 다시 쓰려면 이 값을 true로 바꾸면 된다.
 */
const DEMO_SIMULATION_ENABLED = false;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/**
 * 신청 직후에는 비동기 처리가 끝나지 않아 couponIssueId가 null이다. 같은
 * Idempotency-Key로 상태 조회 API를 폴링하고, 최종 응답의 couponIssueId로 이동한다.
 */
async function pollForIssuedCoupon(userId: number, idempotencyKey: string) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const status = await getCouponIssueRequestStatus(userId, idempotencyKey);
    if (status.status !== "IN_PROGRESS") return status;
    await sleep(700);
  }
  return undefined;
}

const PAW_BURST = [
  { x: -46, y: -54, rot: -24 },
  { x: 0, y: -68, rot: 4 },
  { x: 46, y: -54, rot: 24 },
  { x: -66, y: -14, rot: -46 },
  { x: 66, y: -14, rot: 46 },
  { x: -22, y: -74, rot: -8 },
];

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const event = getEvent(Number(id));

  // CouponForm(관리자)이 쿠폰 생성 직후 만들어주는 신청 링크(?couponId=...)로 들어온
  // 경우에만 실제 백엔드 발급 API를 태운다. 이벤트별 쿠폰 목록 조회 API가 없어서
  // 목데이터 화면(위 다중 선택 UI)과는 별개로, 이 값이 있으면 그 쿠폰 한 장만 신청 대상이다.
  const realCouponIdParam = searchParams.get("couponId");
  const parsedRealCouponId = realCouponIdParam ? Number(realCouponIdParam) : NaN;
  const realCouponId = Number.isFinite(parsedRealCouponId) ? parsedRealCouponId : null;
  const realCouponName = searchParams.get("couponName") ?? "쿠폰";
  const realDiscountType = searchParams.get("discountType");
  const realDiscountValue = searchParams.get("discountValue");
  const realDiscountLabel = realDiscountValue
    ? realDiscountType === "FIXED_AMOUNT"
      ? `${Number(realDiscountValue).toLocaleString()}원`
      : `${realDiscountValue}%`
    : null;
  const [realSubmitting, setRealSubmitting] = useState(false);
  const [realEvent, setRealEvent] = useState<EventDetailResponse | null>(null);
  const [realEventError, setRealEventError] = useState("");
  const [realStock, setRealStock] = useState<{ remainingQuantity: number; issuedQuantity: number } | null>(null);
  const [selected, setSelected] = useState(event?.coupons[0]?.id ?? "");
  const [stockById, setStockById] = useState<Record<string, number>>(() =>
    Object.fromEntries((event?.coupons ?? []).map((c) => [c.id, c.stock]))
  );
  const [issuedIds, setIssuedIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [socialProof, setSocialProof] = useState<{ key: number; text: string } | null>(null);
  const [justIssuedId, setJustIssuedId] = useState<string | null>(null);
  const [celebrateKey, setCelebrateKey] = useState(0);
  const { showToast } = useToast();
  const stockRef = useRef(stockById);

  const startMetric = event?.metrics.find((m) => m.label === "발급 시작");
  const startTarget = event?.status === "scheduled" && startMetric ? parseEventTimestamp(startMetric.hint) : null;

  useEffect(() => {
    stockRef.current = stockById;
  }, [stockById]);

  useEffect(() => {
    if (!startTarget) return;
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(tick);
  }, [startTarget]);

  useEffect(() => {
    if (!DEMO_SIMULATION_ENABLED) return;
    if (!event || event.status !== "open") return;
    const sim = window.setInterval(() => {
      const current = stockRef.current;
      const claimable = event.coupons.filter((c) => (current[c.id] ?? 0) > 0);
      if (claimable.length === 0) return;
      const target = claimable[Math.floor(Math.random() * claimable.length)];
      const dec = Math.min(current[target.id] ?? 0, 1 + Math.floor(Math.random() * 2));
      const next = { ...current, [target.id]: (current[target.id] ?? 0) - dec };
      stockRef.current = next;
      setStockById(next);
      setSocialProof({ key: Date.now(), text: `방금 다른 분이 ${target.name}을 받았어요` });
    }, 3500 + Math.random() * 3000);
    return () => window.clearInterval(sim);
  }, [event]);

  useEffect(() => {
    if (!socialProof) return;
    const t = window.setTimeout(() => setSocialProof(null), 2600);
    return () => window.clearTimeout(t);
  }, [socialProof]);

  useEffect(() => {
    if (!justIssuedId) return;
    const t = window.setTimeout(() => setJustIssuedId(null), 1500);
    return () => window.clearTimeout(t);
  }, [justIssuedId]);

  // 목데이터(data/events.ts)에는 없는, 실제로 관리자가 방금 만든 이벤트일 수 있어(예: eventId 596)
  // 실 모드에서는 mock event 조회에 기대지 않고 실제 이벤트 상세 API로 따로 불러온다.
  useEffect(() => {
    if (realCouponId === null || !id) return;
    const controller = new AbortController();
    getEventDetail(Number(id), controller.signal)
      .then((data) => setRealEvent(data))
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setRealEventError(err instanceof ApiError || err instanceof NetworkError ? err.message : "이벤트를 불러오지 못했습니다.");
      });
    return () => controller.abort();
  }, [id, realCouponId]);

  useEffect(() => {
    if (realCouponId === null) return;
    const controller = new AbortController();
    const load = () => getCouponRealtimeStatus(realCouponId, controller.signal).then((data) => setRealStock(data)).catch(() => undefined);
    void load();
    const timer = window.setInterval(load, 3000);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, [realCouponId]);

  if (realCouponId !== null) {
    return (
      <Layout area="public" page="event-detail">
        {realEventError ? (
          <section className="py-10">
            <div className="container-page">
              <BackLink to="/">이벤트 목록</BackLink>
              <h1 className="mt-2">{realEventError}</h1>
            </div>
          </section>
        ) : !realEvent ? (
          <section className="py-10">
            <div className="container-page">
              <div className="h-8 w-40 animate-pulse rounded-full bg-surface-2" />
              <div className="mt-4 h-[220px] animate-pulse rounded-block bg-surface-2" />
            </div>
          </section>
        ) : (
          <>
            <section className="py-10">
              <div className="container-page grid gap-10 md:grid-cols-[1.15fr_1fr] md:items-center">
                <div>
                  <BackLink to="/">이벤트 목록</BackLink>
                  <Eyebrow>{realStatusLabel[realEvent.status].toUpperCase()}</Eyebrow>
                  <h1 className="mt-2">{realEvent.name}</h1>
                  {realEvent.description ? <p className="mt-4 max-w-[56ch] text-[18px] text-ink/70">{realEvent.description}</p> : null}
                  <div className="mt-8">
                    <LinkButton to="#coupon-choice">쿠폰 받기</LinkButton>
                  </div>
                </div>
                <div>
                  <BrandIllustration aspect="aspect-[4/3]" />
                </div>
              </div>
            </section>

            <section id="coupon-choice" className="py-14">
              <div className="container-page max-w-2xl">
                <Eyebrow>
                  <PawPrint weight="fill" className="h-3.5 w-3.5" aria-hidden="true" />
                  바로 받기
                </Eyebrow>
                <h2 className="mt-2">이 혜택을 놓치지 마세요.</h2>
                <p className="mt-2 text-[17px] text-ink/70">한 사람당 한 장만 받을 수 있어요.</p>

                <form onSubmit={handleRealApply} className="mt-6 rounded-block border border-hairline p-6">
                  <h3 className="text-lg font-semibold">발급할 쿠폰</h3>
                  <div className="mt-4 flex min-h-[92px] items-center justify-between gap-4 rounded-control border border-ink bg-paper p-4 shadow-[0_1px_2px_rgba(29,29,27,0.06)]">
                    <div><strong className="text-base">{realCouponName}</strong>{realStock ? <p className="mt-1 text-sm text-ink-muted">남은 재고 {realStock.remainingQuantity.toLocaleString()}장 · 발급 {realStock.issuedQuantity.toLocaleString()}건</p> : null}</div>
                    {realDiscountLabel ? <span className="text-2xl font-semibold">{realDiscountLabel}</span> : null}
                  </div>

                  <div className="mt-6 rounded-control border border-hairline bg-surface-2 p-4 text-sm">
                    <strong className="block">발급 전 확인</strong>
                    <p className="mt-1 text-ink/80">선택한 쿠폰은 사용자 계정에 바로 보관되며, 발급 후에는 다른 쿠폰으로 바꿀 수 없습니다.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={realSubmitting}
                    className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-ink bg-ink px-5 text-[18px] font-medium text-paper transition-all active:scale-[0.97] hover:bg-[#262626] disabled:cursor-wait disabled:opacity-70"
                  >
                    {realSubmitting ? <span className="h-4 w-4 flex-none animate-spin rounded-full border-2 border-paper/30 border-t-paper" aria-hidden="true" /> : null}
                    {realSubmitting ? "발급하는 중" : "지금 받기"}
                  </button>
                </form>
              </div>
            </section>
          </>
        )}
      </Layout>
    );
  }

  if (!event) return <NotFound />;

  const isClosed = event.status === "closed";
  const isSingleCoupon = event.coupons.length === 1;
  const selectedCoupon = event.coupons.find((c) => c.id === selected);
  const selectedAlreadyIssued = !!selectedCoupon && issuedIds.has(selectedCoupon.id);
  const selectedSoldOut = !selectedCoupon || (stockById[selectedCoupon.id] ?? 0) <= 0;
  const countdownMs = startTarget ? startTarget.getTime() - now : null;
  const countdownActive = countdownMs !== null && countdownMs > 0;

  const primaryCoupon = event.coupons.find((c) => !issuedIds.has(c.id) && (stockById[c.id] ?? 0) > 0) ?? event.coupons[0];
  const primaryRemaining = primaryCoupon ? stockById[primaryCoupon.id] ?? primaryCoupon.stock : 0;

  function handleIssue(formEvent: FormEvent) {
    formEvent.preventDefault();
    if (!DEMO_SIMULATION_ENABLED) return;
    if (!event || isClosed || !selectedCoupon || submitting) return;
    if (issuedIds.has(selectedCoupon.id)) {
      showToast("이미 발급받은 쿠폰이에요. 한 사람당 한 장만 받을 수 있어요.");
      return;
    }
    const remaining = stockById[selectedCoupon.id] ?? 0;
    if (remaining <= 0) {
      showToast("방금 재고가 모두 소진됐어요. 다른 쿠폰을 선택해 주세요.");
      return;
    }
    setSubmitting(true);
    window.setTimeout(() => {
      const next = remaining - 1;
      const orderNumber = selectedCoupon.total - next;
      const nextStock = { ...stockRef.current, [selectedCoupon.id]: next };
      stockRef.current = nextStock;
      setStockById(nextStock);
      setIssuedIds((prev) => new Set(prev).add(selectedCoupon.id));
      setSubmitting(false);
      setJustIssuedId(selectedCoupon.id);
      setCelebrateKey((k) => k + 1);
      showToast(`${orderNumber}번째로 받으셨어요! ${selectedCoupon.name} · 남은 재고 ${next}장`);
    }, 450 + Math.random() * 150);
  }

  async function handleRealApply(formEvent: FormEvent) {
    formEvent.preventDefault();
    if (realCouponId === null || realSubmitting) return;
    const userId = getCurrentUserId();
    const idempotencyKey = getOrCreateIdempotencyKey(realCouponId, userId);
    setRealSubmitting(true);
    try {
      await applyForCoupon(realCouponId, userId, idempotencyKey);
      const issued = await pollForIssuedCoupon(userId, idempotencyKey);
      clearIdempotencyKey(realCouponId, userId);
      if (issued?.couponIssueId) {
        navigate(`/user/coupon-detail/${issued.couponIssueId}`);
      } else {
        showToast("신청은 접수됐어요. 잠시 후 보유 쿠폰에서 확인해 주세요.");
        navigate("/user/my-coupons");
      }
    } catch (err) {
      // ApiError는 백엔드가 응답까지 끝낸 확정 실패(품절/중복신청 등)라 idempotencyKeyService가
      // 이미 실패로 기록해뒀다 — 같은 키로 재시도하면 그 실패를 그대로 재현(REPLAY)해버려서
      // 상황이 바뀌어도 영원히 같은 에러만 받는다. 키를 지워 다음 시도가 새 요청으로 가게 한다.
      // NetworkError는 요청이 서버에 실제로 도달했는지 알 수 없으니 키를 그대로 남겨 안전하게 재시도한다.
      if (err instanceof ApiError) {
        clearIdempotencyKey(realCouponId, userId);
      }
      showToast(err instanceof ApiError || err instanceof NetworkError ? err.message : "신청하지 못했습니다.");
    } finally {
      setRealSubmitting(false);
    }
  }

  return (
    <Layout area="public" page="event-detail">
      <section className="py-10">
        <div className="container-page grid gap-10 md:grid-cols-[1.15fr_1fr] md:items-center">
          <div>
            <BackLink to="/">이벤트 목록</BackLink>
            <Eyebrow>데모 이벤트 · {statusLabel[event.status]}</Eyebrow>
            <h1 className="mt-2">{event.title}</h1>
            <p className="mt-4 max-w-[56ch] text-[18px] text-ink/70">{event.detailDesc}</p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <LinkButton to="#coupon-choice">쿠폰 고르기</LinkButton>
              <a href="#event-guide" className="inline-flex min-h-11 items-center gap-2 text-[18px] font-medium underline underline-offset-4 hover:underline-offset-[6px]">
                사용 안내
              </a>
            </div>
          </div>
          <div>
            <BrandIllustration aspect="aspect-[4/3]" />
          </div>
        </div>
      </section>

      <section className="py-2">
        <div className="container-page">
          <p className="mb-2.5 text-sm font-semibold text-ink-muted">다른 이벤트로 넘어가기</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {EVENTS.map((e) => {
              const isCurrent = e.id === event.id;
              return (
                <Link
                  key={e.id}
                  to={`/event-detail/${e.id}`}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`inline-flex min-h-10 flex-none items-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-colors duration-200 ease-fluid ${
                    isCurrent ? "border-ink bg-ink text-paper" : "border-hairline text-ink hover:border-ink"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 flex-none rounded-full ${isCurrent ? "bg-paper" : statusDotClass[e.status]}`} aria-hidden="true" />
                  {e.title}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-6">
        <div className="container-page">
          <ColorBlock tone="surface">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2>한눈에 보는 혜택</h2>
              </div>
              <StatusPill tone={event.status}>{statusLabel[event.status]}</StatusPill>
            </div>
            <div className="mt-6">
              <MetricGrid cols={4}>
                {event.metrics.map((metric) => {
                  const isCountdownTile = metric.label === "발급 시작" && countdownActive;
                  return (
                    <MetricTile
                      key={metric.label}
                      label={metric.label}
                      value={isCountdownTile ? formatCountdown(countdownMs!) : metric.value}
                      hint={isCountdownTile ? "발급 시작까지 남은 시간" : metric.hint}
                      tone={isCountdownTile ? "warning" : deadlineTone(metric.label, metric.value)}
                    />
                  );
                })}
              </MetricGrid>
            </div>
          </ColorBlock>
        </div>
      </section>

      <section id="coupon-choice" className="py-14">
        <div className="container-page max-w-2xl">
          <Eyebrow>
            <PawPrint weight="fill" className="h-3.5 w-3.5" aria-hidden="true" />
            {isSingleCoupon ? "바로 받기" : "쿠폰 선택"}
          </Eyebrow>
          <h2 className="mt-2">{isSingleCoupon ? "이 혜택을 놓치지 마세요." : "받을 혜택을 골라주세요."}</h2>
          <p className="mt-2 text-[17px] text-ink/70">한 사람당 한 장만 받을 수 있어요.</p>

          <form onSubmit={handleIssue} className="mt-6 rounded-block border border-hairline p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">발급할 쿠폰</h3>
              <span
                className="flex items-center gap-1.5 text-xs font-medium text-ink/60 transition-all duration-500 ease-fluid"
                style={{ opacity: socialProof ? 1 : 0, transform: socialProof ? "translateY(0)" : "translateY(-4px)" }}
                aria-live="polite"
              >
                {socialProof ? (
                  <>
                    <PawPrint weight="fill" className="h-3 w-3 flex-none text-accent" aria-hidden="true" />
                    {socialProof.text}
                  </>
                ) : null}
              </span>
            </div>
            <div className="grid gap-4">
              {event.coupons.map((coupon) => {
                const remaining = stockById[coupon.id] ?? coupon.stock;
                const ratio = coupon.total > 0 ? remaining / coupon.total : 0;
                const soldOut = remaining <= 0;
                const alreadyIssued = issuedIds.has(coupon.id);
                const unavailable = soldOut || alreadyIssued;
                const urgent = !unavailable && ratio <= 0.2;
                return (
                  <label
                    key={coupon.id}
                    className={`relative flex min-h-[92px] overflow-visible rounded-control border bg-paper shadow-[0_1px_2px_rgba(29,29,27,0.06)] transition-all duration-700 ease-fluid ${
                      unavailable
                        ? "cursor-not-allowed border-hairline opacity-60"
                        : isSingleCoupon
                          ? "cursor-default border-ink"
                          : selected === coupon.id
                            ? "cursor-pointer border-ink"
                            : "cursor-pointer border-hairline hover:border-ink/50"
                    } ${justIssuedId === coupon.id ? "ring-2 ring-accent ring-offset-2 ring-offset-canvas" : ""}`}
                  >
                    <span className="flex flex-1 items-center gap-3 p-4">
                      {isSingleCoupon ? null : (
                        <input
                          type="radio"
                          name="coupon"
                          value={coupon.id}
                          checked={selected === coupon.id}
                          disabled={unavailable}
                          onChange={() => setSelected(coupon.id)}
                          className="h-5 w-5 flex-none accent-ink"
                        />
                      )}
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-1.5">
                          <strong className="block">{coupon.name}</strong>
                          {alreadyIssued ? (
                            <span className="inline-flex min-h-5 items-center rounded-full border border-accent/30 bg-accent/10 px-2 text-[11px] font-semibold uppercase tracking-wide text-accent-ink">발급 완료</span>
                          ) : soldOut ? (
                            <span className="inline-flex min-h-5 items-center rounded-full bg-hairline-soft px-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">품절</span>
                          ) : urgent ? (
                            <span className="inline-flex min-h-5 items-center rounded-full border border-clay/30 bg-clay/10 px-2 text-[11px] font-semibold uppercase tracking-wide text-clay-ink">마감 임박</span>
                          ) : null}
                        </span>
                        <span className="block text-sm text-ink/60">{coupon.detail}</span>
                        <span className="mt-2 flex items-center gap-2">
                          <span className="h-1.5 flex-1 max-w-32 overflow-hidden rounded-full bg-hairline-soft">
                            <span
                              className={`block h-full rounded-full ${urgent ? "bg-clay-ink" : "bg-accent"}`}
                              style={{ width: `${Math.max(ratio * 100, soldOut ? 0 : 3)}%` }}
                            />
                          </span>
                          <span className={`inline-flex items-center gap-1 text-xs font-medium tabular-nums ${urgent ? "text-clay-ink" : "text-ink/60"}`}>
                            <PawPrint weight="fill" className="h-3 w-3 flex-none" aria-hidden="true" />
                            선착순 {remaining}/{coupon.total}장
                          </span>
                        </span>
                      </span>
                    </span>
                    <span className="relative flex w-28 flex-none items-center justify-center border-l border-dashed border-hairline">
                      <span className="absolute -top-2.5 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full bg-canvas" aria-hidden="true" />
                      <span className="text-2xl font-semibold">{coupon.value}</span>
                      <span className="absolute -bottom-2.5 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full bg-canvas" aria-hidden="true" />
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="mt-6 rounded-control border border-hairline bg-surface-2 p-4 text-sm">
              <strong className="block">발급 전 확인</strong>
              <p className="mt-1 text-ink/80">선택한 쿠폰은 사용자 계정에 바로 보관되며, 발급 후에는 다른 쿠폰으로 바꿀 수 없습니다.</p>
            </div>

            <span className="relative mt-6 inline-block">
              <button
                type="submit"
                disabled={isClosed || selectedSoldOut || selectedAlreadyIssued || submitting}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-ink bg-ink px-5 text-[18px] font-medium text-paper transition-all active:scale-[0.97] hover:bg-[#262626] disabled:cursor-not-allowed disabled:border-hairline disabled:bg-surface-2 disabled:text-ink-muted disabled:active:scale-100 disabled:hover:bg-surface-2"
              >
                {submitting ? <span className="h-4 w-4 flex-none animate-spin rounded-full border-2 border-paper/30 border-t-paper" aria-hidden="true" /> : null}
                {submitting
                  ? "발급하는 중"
                  : isClosed
                    ? "발급이 종료되었습니다"
                    : selectedAlreadyIssued
                      ? "이미 발급받은 쿠폰이에요"
                      : selectedSoldOut
                        ? "품절된 쿠폰이에요"
                        : isSingleCoupon
                          ? "지금 받기"
                          : "선택한 쿠폰 발급하기"}
              </button>
              {celebrateKey > 0 ? (
                <span key={celebrateKey} className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true">
                  {PAW_BURST.map((offset, i) => (
                    <PawPrint
                      key={i}
                      weight="fill"
                      className="absolute left-1/2 top-1/2 h-4 w-4 animate-paw-pop text-accent"
                      style={{ "--paw-x": `${offset.x}px`, "--paw-y": `${offset.y}px`, "--paw-rot": `${offset.rot}deg` } as CSSProperties}
                    />
                  ))}
                </span>
              ) : null}
            </span>
          </form>
        </div>
      </section>

      <section id="event-guide" className="py-14">
        <div className="container-page grid gap-8 md:grid-cols-[1fr_1.2fr]">
          <div>
            <h2>사용 안내</h2>
          </div>
          <ul className="grid gap-3 text-ink/80">
            {event.guide.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      {event.status === "open" && primaryCoupon ? (
        <a
          href="#coupon-choice"
          className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-between gap-3 rounded-full border border-ink bg-ink px-4 py-3 text-paper shadow-[0_16px_32px_-12px_rgba(29,29,27,0.45)] md:hidden"
        >
          <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
            <PawPrint weight="fill" className="h-4 w-4 flex-none text-accent" aria-hidden="true" />
            <span className="truncate">
              선착순 <span className="tabular-nums">{primaryRemaining}</span>장 남음
            </span>
          </span>
          <span className="inline-flex min-h-9 flex-none items-center rounded-full bg-accent px-4 text-sm font-semibold text-ink">발급받기</span>
        </a>
      ) : null}
    </Layout>
  );
}
