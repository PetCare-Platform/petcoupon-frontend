import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import { Layout } from "../../components/Layout";
import { Eyebrow, FilterBar, LinkButton, MetricTile } from "../../components/ui";
import { listUserCouponIssues } from "../../api/couponIssues";
import { getCurrentUserId, subscribeCurrentUserId } from "../../api/currentUser";
import { ApiError, NetworkError } from "../../api/http";
import { formatDateTime, isWithinHours } from "../../lib/date";
import type { CouponIssueRequestResponse, IssueStatus } from "../../types/api";

type Status = "available" | "used" | "expired";

const statusFromIssueStatus: Record<IssueStatus, Status> = {
  ISSUED: "available",
  USED: "used",
  EXPIRED: "expired",
};

const statusLabel: Record<Status, string> = { available: "사용 가능", used: "사용 완료", expired: "만료" };

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

  useEffect(() => subscribeCurrentUserId(() => setUserId(getCurrentUserId())), []);

  useEffect(() => {
    // userId 없음 → 조회 요청을 보내지 않고 미설정 상태만 표시한다.
    if (userId === null) {
      setCoupons(null);
      setLoadError("");
      return;
    }
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

  return (
    <Layout area="user" page="my-coupons">
      <section className="py-10">
        <div className="container-page">
          <Eyebrow>보유 쿠폰</Eyebrow>
          <h1 className="mt-2">
            내 쿠폰을
            <br />
            한곳에.
          </h1>
          <p className="mt-2 text-[18px] text-ink/70">받은 혜택의 상태와 사용 기한을 확인하세요.</p>
          <div className="mt-6 max-w-xs">
            <MetricTile label="지금 사용 가능" value={availableCount} hint="지금 사용할 수 있는 쿠폰" />
          </div>
        </div>
      </section>

      {expiringSoon ? (
        <section className="py-4">
          <div className="container-page">
            <div className="rounded-block border border-hairline bg-surface-2 p-6 text-ink md:p-8">
              <h3 className="text-xl font-semibold">
                {expiringSoon.couponName}이 <span className="text-clay-ink">곧 만료</span>돼요.
              </h3>
              <p className="mt-2">{formatDateTime(expiringSoon.expiresAt)}까지 사용할 수 있어요.</p>
              <Link
                to={`/user/coupon-detail/${expiringSoon.couponIssueId}`}
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-[18px] font-medium text-white hover:bg-ink-muted"
              >
                쿠폰 확인하기
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-10">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2>보유 쿠폰</h2>
              <p className="mt-1 text-[17px] text-ink/70">{(coupons ?? []).length}개의 쿠폰이 있어요.</p>
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

          {userId === null ? (
            <div className="mt-8 rounded-block border border-dashed border-hairline p-10 text-center">
              <h3 className="text-xl font-semibold">사용자 ID가 설정되어 있지 않아요.</h3>
              <p className="mt-2 text-ink/70">보유 쿠폰은 저장된 사용자 ID로 자동 조회됩니다. 먼저 사용자 ID를 설정해 주세요.</p>
              <LinkButton to="/user" variant="secondary" className="mt-4">
                사용자 ID 설정하기
              </LinkButton>
            </div>
          ) : loadError ? (
            <div className="mt-8 rounded-block border border-dashed border-hairline p-10 text-center">
              <h3 className="text-xl font-semibold">{loadError}</h3>
              <p className="mt-2 text-ink/70">잠시 후 다시 시도해 주세요.</p>
            </div>
          ) : coupons === null ? (
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[0, 1].map((i) => (
                <div key={i} className="h-[168px] animate-pulse rounded-control border border-hairline bg-surface-2" />
              ))}
            </div>
          ) : (
            <div className="mt-8 grid items-start gap-3 sm:grid-cols-2">
              {visible.map((coupon) => {
                const status = statusFromIssueStatus[coupon.status];
                const soon = status === "available" && isWithinHours(coupon.expiresAt, 48);
                return (
                  <article key={coupon.couponIssueId} className="overflow-visible rounded-control border border-hairline bg-paper p-3.5 shadow-[0_1px_2px_rgba(29,29,27,0.06)]">
                    <div className="mb-2 flex items-center justify-between">
                      {soon ? (
                        <span className="inline-flex min-h-6 items-center rounded-full border border-clay/30 bg-clay/10 px-2 text-[11px] font-semibold uppercase tracking-wide text-clay-ink">곧 만료</span>
                      ) : (
                        <span className="inline-flex min-h-6 items-center rounded-full bg-hairline-soft px-2 text-[11px] font-semibold uppercase tracking-wide">{statusLabel[status]}</span>
                      )}
                      <span className="text-[11px] text-ink/50">발급번호 {coupon.couponIssueId}</span>
                    </div>
                    <h3 className="mt-0.5 text-base font-semibold">{coupon.couponName}</h3>
                    <p className="mt-1 font-mono text-sm text-ink/60">{coupon.couponCode}</p>
                    <div className="relative -mx-3.5 mt-3 flex items-center justify-between border-t border-dashed border-hairline px-3.5 pt-3 text-xs">
                      <span className="absolute -left-2 top-0 h-4 w-4 -translate-y-1/2 rounded-full bg-canvas" aria-hidden="true" />
                      <span className="absolute -right-2 top-0 h-4 w-4 -translate-y-1/2 rounded-full bg-canvas" aria-hidden="true" />
                      <span className={soon ? "font-semibold text-clay-ink" : "text-ink/60"}>{deadlineText(coupon, status)}</span>
                      <Link to={`/user/coupon-detail/${coupon.couponIssueId}`} className="group inline-flex items-center gap-1 font-medium underline underline-offset-4">
                        상세 보기
                        <ArrowRight weight="bold" className="h-3 w-3 flex-none transition-transform duration-200 ease-fluid group-hover:translate-x-0.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                );
              })}
              {visible.length === 0 ? (
                <div className="col-span-full rounded-block border border-dashed border-hairline p-10 text-center">
                  <h3 className="text-xl font-semibold">해당 상태의 쿠폰이 없어요.</h3>
                  <p className="mt-2 text-ink/70">다른 상태를 선택하거나 새로운 이벤트를 둘러보세요.</p>
                  <LinkButton to="/#event-list" variant="secondary" className="mt-4">
                    이벤트 보기
                  </LinkButton>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
