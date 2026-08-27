import { useEffect, useState } from "react";
import { Layout } from "../../components/Layout";
import { Eyebrow, FieldGroup, FilterBar, LinkButton, inputClass } from "../../components/ui";
import { useToast } from "../../context/ToastContext";
import { getCouponRealtimeStatus, getCoupons, updateCoupon } from "../../api/coupons";
import { ApiError, NetworkError } from "../../api/http";
import type { CouponListResponse, CouponPageResponse, CouponRealtimeStatusResponse, CouponStatus } from "../../types/api";

const statusLabel: Record<CouponStatus, string> = { READY: "발급 대기", ACTIVE: "발급 중", SOLD_OUT: "품절", ENDED: "종료" };
const statusClass: Record<CouponStatus, string> = {
  READY: "bg-surface-2 text-ink-muted",
  ACTIVE: "bg-success/10 text-[#0a8f3c]",
  SOLD_OUT: "bg-clay/10 text-clay-ink",
  ENDED: "bg-hairline-soft text-ink-muted",
};

function discountLabel(coupon: Pick<CouponListResponse, "discountType" | "discountValue">): string {
  return coupon.discountType === "RATE" ? `${coupon.discountValue}%` : `${coupon.discountValue.toLocaleString()}원`;
}

export default function Coupons() {
  const { showToast } = useToast();

  // 목록 — GET /admin/coupons (eventId·status 둘 다 선택 필터)
  const [statusFilter, setStatusFilter] = useState<"all" | CouponStatus>("all");
  const [eventIdFilter, setEventIdFilter] = useState("");
  const [page, setPage] = useState(0);
  const [list, setList] = useState<CouponPageResponse | null>(null);
  const [listError, setListError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const parsedEventId = eventIdFilter.trim() === "" ? undefined : Number(eventIdFilter);
    const validEventId = parsedEventId !== undefined && Number.isInteger(parsedEventId) && parsedEventId > 0 ? parsedEventId : undefined;
    setListError("");
    getCoupons(
      { eventId: validEventId, status: statusFilter === "all" ? undefined : statusFilter },
      page,
      20,
      controller.signal,
    )
      .then((result) => setList(result))
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setListError(err instanceof ApiError || err instanceof NetworkError ? err.message : "쿠폰 목록을 불러오지 못했습니다.");
      });
    return () => controller.abort();
  }, [statusFilter, eventIdFilter, page]);

  // 실시간 재고 조회
  const [statusCouponId, setStatusCouponId] = useState("");
  const [realtime, setRealtime] = useState<CouponRealtimeStatusResponse | null>(null);

  // 발급 전 부분 수정 — 목록의 "수정"을 누르면 이 폼에 값이 채워진다.
  const [editEventId, setEditEventId] = useState("");
  const [editCouponId, setEditCouponId] = useState("");
  const [editName, setEditName] = useState("");
  const [editTotalQuantity, setEditTotalQuantity] = useState("");
  const [apiBusy, setApiBusy] = useState(false);

  function messageFrom(error: unknown): string {
    return error instanceof ApiError || error instanceof NetworkError ? error.message : "요청을 처리하지 못했습니다.";
  }

  function startEdit(coupon: CouponListResponse) {
    setEditEventId(String(coupon.eventId));
    setEditCouponId(String(coupon.couponId));
    setEditName(coupon.name);
    setEditTotalQuantity(String(coupon.totalQuantity));
    document.getElementById("coupon-api-edit-id")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function loadRealtimeStatus() {
    const parsedCouponId = Number(statusCouponId);
    if (!Number.isInteger(parsedCouponId) || parsedCouponId < 1) {
      showToast("유효한 쿠폰 ID를 입력해 주세요.");
      return;
    }
    setApiBusy(true);
    try {
      setRealtime(await getCouponRealtimeStatus(parsedCouponId));
    } catch (error) {
      showToast(messageFrom(error));
    } finally {
      setApiBusy(false);
    }
  }

  async function patchCoupon() {
    const parsedEventId = Number(editEventId);
    const parsedCouponId = Number(editCouponId);
    const parsedQuantity = editTotalQuantity === "" ? undefined : Number(editTotalQuantity);
    if (!Number.isInteger(parsedEventId) || parsedEventId < 1 || !Number.isInteger(parsedCouponId) || parsedCouponId < 1) {
      showToast("유효한 이벤트 ID와 쿠폰 ID를 입력해 주세요.");
      return;
    }
    if (!editName.trim() && parsedQuantity === undefined) {
      showToast("변경할 쿠폰 이름이나 총 재고를 입력해 주세요.");
      return;
    }
    if (parsedQuantity !== undefined && (!Number.isInteger(parsedQuantity) || parsedQuantity < 1)) {
      showToast("총 재고는 1 이상의 정수여야 합니다.");
      return;
    }
    setApiBusy(true);
    try {
      const updated = await updateCoupon(parsedEventId, parsedCouponId, {
        ...(editName.trim() ? { name: editName.trim() } : {}),
        ...(parsedQuantity === undefined ? {} : { totalQuantity: parsedQuantity }),
      });
      showToast(`${updated.name} 쿠폰을 수정했습니다.`);
      setEditName("");
      setEditTotalQuantity("");
      // 방금 수정한 값이 바로 보이게 같은 필터·페이지로 목록을 다시 가져온다.
      setList(
        await getCoupons(
          { eventId: eventIdFilter.trim() ? Number(eventIdFilter) : undefined, status: statusFilter === "all" ? undefined : statusFilter },
          page,
          20,
        ),
      );
    } catch (error) {
      showToast(messageFrom(error));
    } finally {
      setApiBusy(false);
    }
  }

  return (
    <Layout area="admin" page="coupons">
      <section className="py-10">
        <div className="container-page flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>관리자 · 쿠폰</Eyebrow>
            <h1 className="mt-2">쿠폰 목록</h1>
            <p className="mt-2 text-[18px] text-ink/70">
              GET /admin/coupons로 조회한 실제 쿠폰입니다. 재고는 DB 기준(확정값)이며, 실시간 값은 아래에서 단건으로 확인하세요.
            </p>
          </div>
          <LinkButton to="/admin/coupon-form">새 쿠폰</LinkButton>
        </div>
      </section>

      <section className="py-6">
        <div className="container-page grid gap-4 lg:grid-cols-2">
          <div className="rounded-block border border-hairline p-6">
            <Eyebrow>실제 API · 쿠폰 실시간 재고 조회</Eyebrow>
            <div className="mt-4 grid gap-4">
              <FieldGroup label="쿠폰 ID" htmlFor="coupon-api-id">
                <input id="coupon-api-id" type="number" min={1} className={inputClass} value={statusCouponId} onChange={(event) => setStatusCouponId(event.target.value)} />
              </FieldGroup>
              <button type="button" disabled={apiBusy} onClick={loadRealtimeStatus} className="rounded-full bg-ink px-5 py-3 text-paper disabled:opacity-50">실시간 재고 조회</button>
              {realtime ? <p className="text-sm text-ink/70">총 {realtime.totalQuantity} · 잔여 {realtime.remainingQuantity} · 발급 {realtime.issuedQuantity} · Redis {realtime.initialized ? "초기화됨" : "미초기화"}</p> : null}
            </div>
          </div>
          <div className="rounded-block border border-hairline p-6">
            <Eyebrow>실제 API · 발급 전 부분 수정</Eyebrow>
            <p className="mt-1 text-sm text-ink/60">아래 목록에서 "수정"을 누르면 여기에 값이 채워집니다.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FieldGroup label="이벤트 ID" htmlFor="coupon-api-event-id">
                <input id="coupon-api-event-id" type="number" min={1} className={inputClass} value={editEventId} onChange={(event) => setEditEventId(event.target.value)} />
              </FieldGroup>
              <FieldGroup label="쿠폰 ID" htmlFor="coupon-api-edit-id">
                <input id="coupon-api-edit-id" type="number" min={1} className={inputClass} value={editCouponId} onChange={(event) => setEditCouponId(event.target.value)} />
              </FieldGroup>
              <FieldGroup label="새 이름" htmlFor="coupon-api-name">
                <input id="coupon-api-name" className={inputClass} value={editName} onChange={(event) => setEditName(event.target.value)} />
              </FieldGroup>
              <FieldGroup label="새 총 재고" htmlFor="coupon-api-quantity">
                <input id="coupon-api-quantity" type="number" min={1} className={inputClass} value={editTotalQuantity} onChange={(event) => setEditTotalQuantity(event.target.value)} />
              </FieldGroup>
            </div>
            <button type="button" disabled={apiBusy} onClick={patchCoupon} className="mt-4 rounded-full bg-ink px-5 py-3 text-paper disabled:opacity-50">입력한 항목만 수정</button>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2>등록 쿠폰</h2>
              <p className="mt-1 text-[17px] text-ink/70">{list ? `전체 ${list.totalElements}개 중 ${list.content.length}개 표시` : "불러오는 중…"}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <FieldGroup label="이벤트 ID로 좁히기" htmlFor="coupons-filter-event-id">
                <input
                  id="coupons-filter-event-id"
                  type="number"
                  min={1}
                  placeholder="전체"
                  className={`${inputClass} w-32`}
                  value={eventIdFilter}
                  onChange={(event) => {
                    setPage(0);
                    setEventIdFilter(event.target.value);
                  }}
                />
              </FieldGroup>
              <FilterBar
                value={statusFilter}
                onChange={(value) => {
                  setPage(0);
                  setStatusFilter(value);
                }}
                options={[
                  { value: "all", label: "전체" },
                  { value: "READY", label: statusLabel.READY },
                  { value: "ACTIVE", label: statusLabel.ACTIVE },
                  { value: "SOLD_OUT", label: statusLabel.SOLD_OUT },
                  { value: "ENDED", label: statusLabel.ENDED },
                ]}
              />
            </div>
          </div>

          {listError ? (
            <div className="mt-6 rounded-block border border-dashed border-hairline p-10 text-center">
              <h3 className="text-xl font-semibold">{listError}</h3>
              <p className="mt-2 text-ink/70">관리자 세션이 필요할 수 있습니다.</p>
            </div>
          ) : list === null ? (
            <div className="mt-6 grid gap-2.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-20 animate-pulse rounded-control border border-hairline bg-surface-2" />
              ))}
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-2.5">
                {list.content.map((coupon) => (
                  <article key={coupon.couponId} className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-hairline p-3.5">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs text-ink/50">쿠폰 {coupon.couponId}</span>
                        <span className={`inline-flex min-h-6 items-center rounded-full px-2 text-[11px] font-semibold uppercase tracking-wide ${statusClass[coupon.status]}`}>
                          {statusLabel[coupon.status]}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold">{coupon.name}</h3>
                      <p className="mt-0.5 text-sm text-ink/60">
                        {coupon.eventName} · {discountLabel(coupon)} · 재고 {coupon.remainingQuantity}/{coupon.totalQuantity} (DB 기준)
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm font-medium">
                      <button type="button" onClick={() => startEdit(coupon)} className="underline underline-offset-4">
                        수정
                      </button>
                    </div>
                  </article>
                ))}
                {list.content.length === 0 ? (
                  <div className="rounded-block border border-dashed border-hairline p-10 text-center">
                    <h3 className="text-xl font-semibold">해당 조건의 쿠폰이 없어요.</h3>
                    <p className="mt-2 text-ink/70">필터를 바꿔서 다시 확인해 보세요.</p>
                  </div>
                ) : null}
              </div>

              {list.totalPages > 1 ? (
                <div className="mt-6 flex items-center justify-center gap-3">
                  <button type="button" disabled={list.first} onClick={() => setPage((p) => Math.max(p - 1, 0))} className="rounded-full border border-hairline px-4 py-2 disabled:opacity-40">
                    이전
                  </button>
                  <span className="text-sm text-ink/60">{list.page + 1} / {list.totalPages}</span>
                  <button type="button" disabled={list.last} onClick={() => setPage((p) => p + 1)} className="rounded-full border border-hairline px-4 py-2 disabled:opacity-40">
                    다음
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
