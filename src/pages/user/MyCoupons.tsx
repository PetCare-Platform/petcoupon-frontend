import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import { Layout } from "../../components/Layout";
import { FilterBar, LinkButton } from "../../components/ui";
import { listUserCouponIssues } from "../../api/couponIssues";
import { getCurrentUserId, subscribeCurrentUserId } from "../../api/currentUser";
import { ApiError, NetworkError } from "../../api/http";
import { formatDateTime, isWithinHours } from "../../lib/date";
import type { CouponIssueDetailResponse, CouponIssueRequestResponse, IssueStatus } from "../../types/api";
import { CouponDetailModal } from "./CouponDetailModal";

type Status = "available" | "used" | "expired";

const statusFromIssueStatus: Record<IssueStatus, Status> = {
  ISSUED: "available",
  USED: "used",
  EXPIRED: "expired",
};

const statusLabel: Record<Status, string> = { available: "사용 가능", used: "사용 완료", expired: "만료" };

// 쿠폰도 첫 화면 안에서 끝나야 한다 — 이벤트 목록과 같은 4열 기준을 쓴다.
const gridClass = "mt-5 grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

function deadlineText(coupon: CouponIssueRequestResponse, status: Status): string {
  if (status === "used" && coupon.usedAt) return `${formatDateTime(coupon.usedAt)} 사용 완료`;
  if (status === "expired") return `${formatDateTime(coupon.expiresAt)} 만료`;
  return `${formatDateTime(coupon.expiresAt)}까지`;
}

export default function MyCoupons() {
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [coupons, setCoupons] = useState<CouponIssueRequestResponse[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [userId, setUserId] = useState<number | null>(() => getCurrentUserId());
  const [selectedCoupon, setSelectedCoupon] = useState<CouponIssueRequestResponse | null>(null);

  useEffect(() => subscribeCurrentUserId(() => setUserId(getCurrentUserId())), []);

  useEffect(() => {
    // userId 없음 → 조회 요청을 보내지 않고 미설정 상태만 표시한다.
    if (userId === null) {
      setCoupons(null);
      setLoadError("");
      setSelectedCoupon(null);
      return;
    }
    setSelectedCoupon(null);
    const controller = new AbortController();
    setCoupons(null);
    setLoadError("");
    listUserCouponIssues(userId, controller.signal)
      .then((result) => setCoupons(result))
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setLoadError(err instanceof ApiError || err instanceof NetworkError ? err.message : "보유 쿠폰을 불러오지 못했습니다.");
      });
    return () => controller.abort();
  }, [userId]);

  const visible = useMemo(
    () => (coupons ?? []).filter((c) => filter === "all" || statusFromIssueStatus[c.status] === filter),
    [coupons, filter],
  );
  const availableCount = (coupons ?? []).filter((c) => c.status === "ISSUED").length;
  const expiringSoon = (coupons ?? []).find((c) => c.status === "ISSUED" && isWithinHours(c.expiresAt, 48));

  const reflectDetailChange = useCallback((detail: CouponIssueDetailResponse) => {
    setCoupons((current) =>
      current?.map((coupon) =>
        coupon.couponIssueId === detail.couponIssueId
          ? {
              ...coupon,
              couponCode: detail.couponCode,
              status: detail.status,
              usedAt: detail.usedAt,
              expiresAt: detail.expiresAt,
            }
          : coupon,
      ) ?? null,
    );
  }, []);

  const closeDetailModal = useCallback(() => {
    setSelectedCoupon(null);
  }, []);

  return (
    <Layout area="user">
      <section className="py-8 md:py-10">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-1.5 text-[13px] font-medium text-accent-ink">보유 쿠폰</p>
              <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] md:text-[32px]">
                내 쿠폰을 한곳에.
              </h1>
              {/* 요약 타일이 차지하던 정보(지금 사용 가능 n개)를 이 한 줄로 접었다. */}
              <p className="mt-1.5 text-[15px] text-ink-muted">
                {coupons === null
                  ? "쿠폰을 불러오는 중이에요."
                  : `${coupons.length}개 보유 · 지금 사용 가능 ${availableCount}개`}
              </p>
            </div>
            <FilterBar
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: "전체" },
                { value: "available", label: "사용 가능" },
                { value: "used", label: "사용 완료" },
                { value: "expired", label: "만료" },
              ]}
            />
          </div>

          {/* 곧 만료 알림은 별도 섹션(패딩 포함 200px)이었다. 한 줄 띠로 접어 둔다. */}
          {expiringSoon ? (
            <button
              type="button"
              onClick={() => setSelectedCoupon(expiringSoon)}
              className="mt-4 flex w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-control border border-clay/40 bg-clay/10 px-3.5 py-2.5 text-left text-[14px] transition-colors duration-200 ease-fluid hover:border-clay"
            >
              <strong className="font-semibold text-clay-ink">곧 만료</strong>
              <span>
                {expiringSoon.couponName} · {formatDateTime(expiringSoon.expiresAt)}까지
              </span>
              <span className="ml-auto inline-flex items-center gap-1 font-medium">
                쿠폰 확인하기
                <ArrowRight weight="bold" className="h-3 w-3 flex-none" aria-hidden="true" />
              </span>
            </button>
          ) : null}

          {userId === null ? (
            <div className="mt-5 rounded-block border border-dashed border-hairline p-8 text-center">
              <h2 className="text-[19px] font-semibold">사용자 ID가 설정되어 있지 않아요.</h2>
              <p className="mt-1.5 text-[15px] text-ink-muted">보유 쿠폰은 저장된 사용자 ID로 자동 조회됩니다. 먼저 사용자 ID를 설정해 주세요.</p>
              <LinkButton to="/user" variant="secondary" className="mt-4">
                사용자 ID 설정하기
              </LinkButton>
            </div>
          ) : loadError ? (
            <div className="mt-5 rounded-block border border-dashed border-hairline p-8 text-center">
              <h2 className="text-[19px] font-semibold">{loadError}</h2>
              <p className="mt-1.5 text-[15px] text-ink-muted">잠시 후 다시 시도해 주세요.</p>
            </div>
          ) : coupons === null ? (
            <div className={gridClass}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-[150px] animate-pulse rounded-control border border-hairline bg-surface-2" />
              ))}
            </div>
          ) : (
            <div className={gridClass}>
              {visible.map((coupon) => {
                const status = statusFromIssueStatus[coupon.status];
                const soon = status === "available" && isWithinHours(coupon.expiresAt, 48);
                return (
                  <article key={coupon.couponIssueId} className="overflow-visible rounded-control border border-hairline bg-paper shadow-[0_1px_2px_rgba(29,29,27,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-ink hover:shadow-[0_8px_24px_rgba(23,36,58,0.10)]">
                    <button
                      type="button"
                      onClick={() => setSelectedCoupon(coupon)}
                      className="block w-full p-3.5 text-left"
                      aria-label={`${coupon.couponName} 상세 보기`}
                    >

                    <div className="mb-2 flex items-center justify-between">
                      {soon ? (
                        <span className="inline-flex min-h-6 items-center rounded-full border border-clay/30 bg-clay/10 px-2 text-[11px] font-semibold uppercase tracking-wide text-clay-ink">곧 만료</span>
                      ) : (
                        <span
                          className={`inline-flex min-h-6 items-center rounded-full border px-2 text-[11px] font-semibold uppercase tracking-wide ${
                            status === "available"
                              ? "border-accent/50 bg-accent/20 text-accent-ink"
                              : "border-hairline bg-hairline-soft text-ink/60"
                          }`}
                        >
                          {statusLabel[status]}
                        </span>
                      )}
                      <span className="text-[11px] text-ink/50">발급번호 {coupon.couponIssueId}
                      </span>
                    </div>
                    <h3 className="mt-0.5 text-base font-semibold">{coupon.couponName}</h3>
                    <p className="mt-1 font-mono text-sm text-ink/60">{coupon.couponCode}</p>
                    <div className="relative -mx-3.5 mt-3 flex items-center justify-between border-t border-dashed border-hairline px-3.5 pt-3 text-xs">
                      <span className="absolute -left-2 top-0 h-4 w-4 -translate-y-1/2 rounded-full bg-canvas" aria-hidden="true" />
                      <span className="absolute -right-2 top-0 h-4 w-4 -translate-y-1/2 rounded-full bg-canvas" aria-hidden="true" />
                      <span className={soon ? "font-semibold text-clay-ink" : "text-ink/60"}>{deadlineText(coupon, status)}</span>
                      <span className="group inline-flex items-center gap-1 font-medium underline underline-offset-4">
                        상세 보기
                        <ArrowRight weight="bold" className="h-3 w-3 flex-none transition-transform duration-200 ease-fluid group-hover:translate-x-0.5" aria-hidden="true" />
                      </span>
                    </div>
                    </button>
                  </article>
                );
              })}
              {visible.length === 0 ? (
                <div className="col-span-full rounded-block border border-dashed border-hairline p-8 text-center">
                  <h2 className="text-[19px] font-semibold">해당 상태의 쿠폰이 없어요.</h2>
                  <p className="mt-1.5 text-[15px] text-ink-muted">다른 상태를 선택하거나 새로운 이벤트를 둘러보세요.</p>
                  <LinkButton to="/#event-list" variant="secondary" className="mt-4">
                    이벤트 보기
                  </LinkButton>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>
      <CouponDetailModal
        coupon={selectedCoupon}
        onClose={closeDetailModal}
        onChanged={reflectDetailChange}
      />
    </Layout>
  );
}
