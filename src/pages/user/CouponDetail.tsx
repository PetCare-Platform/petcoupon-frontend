import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Layout } from "../../components/Layout";
import { BackLink, Eyebrow, StatusPill } from "../../components/ui";
import { useToast } from "../../context/ToastContext";
import { cancelCouponIssue, getCouponIssueDetail, useCouponIssue } from "../../api/couponIssues";
import { getCurrentUserId } from "../../api/currentUser";
import { ApiError, NetworkError } from "../../api/http";
import { formatDateTime } from "../../lib/date";
import type { CouponIssueDetailResponse } from "../../types/api";

const statusLabel: Record<CouponIssueDetailResponse["status"], string> = {
  ISSUED: "사용 가능",
  USED: "사용 완료",
  EXPIRED: "만료",
};

export default function CouponDetail() {
  const { couponIssueId } = useParams();
  const { showToast } = useToast();
  const [detail, setDetail] = useState<CouponIssueDetailResponse | null>(null);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    (signal?: AbortSignal) => {
      if (!couponIssueId) return;
      getCouponIssueDetail(Number(couponIssueId), signal)
        .then((result) => setDetail(result))
        .catch((err) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setLoadError(err instanceof ApiError || err instanceof NetworkError ? err.message : "쿠폰 정보를 불러오지 못했습니다.");
        });
    },
    [couponIssueId],
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  async function copyCode() {
    if (!detail) return;
    try {
      await navigator.clipboard.writeText(detail.couponCode);
      showToast("클립보드에 복사했습니다.");
    } catch {
      showToast("복사하지 못했습니다.");
    }
  }

  async function markUsed() {
    if (!couponIssueId || busy) return;
    setBusy(true);
    try {
      await useCouponIssue(Number(couponIssueId), { userId: getCurrentUserId() });
      showToast("쿠폰을 사용 완료로 표시했습니다.");
      load();
    } catch (err) {
      showToast(err instanceof ApiError || err instanceof NetworkError ? err.message : "처리하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  async function cancelUse() {
    if (!couponIssueId || busy) return;
    setBusy(true);
    try {
      await cancelCouponIssue(Number(couponIssueId), { userId: getCurrentUserId() });
      showToast("쿠폰 사용을 취소했습니다.");
      load();
    } catch (err) {
      showToast(err instanceof ApiError || err instanceof NetworkError ? err.message : "처리하지 못했습니다.");
    } finally {
      setBusy(false);
    }
  }

  if (!couponIssueId) {
    return (
      <Layout area="user" page="coupon-detail">
        <section className="py-10">
          <div className="container-page">
            <BackLink to="/user/my-coupons">내 쿠폰</BackLink>
            <p>발급 번호가 없어 쿠폰을 찾을 수 없어요.</p>
          </div>
        </section>
      </Layout>
    );
  }

  if (loadError) {
    return (
      <Layout area="user" page="coupon-detail">
        <section className="py-10">
          <div className="container-page">
            <BackLink to="/user/my-coupons">내 쿠폰</BackLink>
            <h1 className="mt-2">{loadError}</h1>
          </div>
        </section>
      </Layout>
    );
  }

  if (!detail) {
    return (
      <Layout area="user" page="coupon-detail">
        <section className="py-10">
          <div className="container-page">
            <BackLink to="/user/my-coupons">내 쿠폰</BackLink>
            <div className="h-8 w-40 animate-pulse rounded-full bg-surface-2" />
            <div className="mt-4 h-[220px] animate-pulse rounded-block bg-surface-2" />
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout area="user" page="coupon-detail">
      <section className="py-10">
        <div className="container-page">
          <BackLink to="/user/my-coupons">내 쿠폰</BackLink>
          <Eyebrow>쿠폰 발급 · {detail.couponIssueId}</Eyebrow>
          <h1 className="mt-2">{statusLabel[detail.status]}</h1>
          <p className="mt-2 text-[18px] text-ink/70">{formatDateTime(detail.createdAt)}에 발급받았어요.</p>
        </div>
      </section>

      <section className="py-4">
        <div className="container-page">
          <div className="rounded-block border border-hairline bg-surface-2 p-6 text-ink md:p-8">
            <StatusPill tone={detail.status === "ISSUED" ? "open" : "closed"}>{statusLabel[detail.status]}</StatusPill>
            <h2 className="mt-4">
              결제 전에
              <br />
              이 코드를 보여주세요.
            </h2>
            <div className="mt-6 flex flex-col items-center gap-6 rounded-control bg-paper p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink/60">쿠폰 코드</span>
                <p className="mt-2 font-mono text-3xl font-bold tracking-wide">{detail.couponCode}</p>
                <button
                  type="button"
                  onClick={copyCode}
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full border border-ink bg-ink px-5 text-[16px] font-medium text-paper transition-all active:scale-[0.97] hover:bg-[#262626]"
                >
                  코드 복사
                </button>
              </div>
              <div className="flex flex-none flex-col items-center gap-2">
                <div className="rounded-control border border-hairline p-2.5">
                  <QRCodeSVG value={detail.couponCode} size={112} fgColor="#1d1d1b" level="M" />
                </div>
                <span className="text-[11px] text-ink/50">매장에서 QR로 제시하세요</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-page">
          <h2>발급 정보</h2>
          <Link to="/user/my-coupons" className="mt-2 inline-block underline underline-offset-4">
            보유 쿠폰 목록으로
          </Link>
          <div className="mt-6 rounded-block border border-hairline p-6">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-ink/60">발급일</dt>
                <dd className="font-medium">{formatDateTime(detail.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-ink/60">사용 기한</dt>
                <dd className="font-medium">{formatDateTime(detail.expiresAt)}</dd>
              </div>
              {detail.usedAt ? (
                <div>
                  <dt className="text-ink/60">사용일시</dt>
                  <dd className="font-medium">{formatDateTime(detail.usedAt)}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-page">
          <div className="rounded-block border border-hairline bg-surface-2 p-6 text-ink md:p-8">
            <Eyebrow>쿠폰 처리</Eyebrow>
            <h2 className="mt-2">
              사용 상태를
              <br />
              정확하게 남겨주세요.
            </h2>
            <p className="mt-2">결제가 확정된 뒤 사용 처리하세요. 잘못 처리했다면 사용 취소로 되돌릴 수 있습니다.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={markUsed}
                disabled={busy || !detail.isUsable}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink bg-ink px-5 text-[18px] font-medium text-white transition-all active:scale-[0.97] hover:bg-ink-muted disabled:cursor-not-allowed disabled:border-hairline disabled:bg-surface-2 disabled:text-ink-muted"
              >
                쿠폰 사용
              </button>
              <button
                type="button"
                onClick={cancelUse}
                disabled={busy || detail.status !== "USED"}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink px-5 text-[18px] font-medium transition-all active:scale-[0.97] hover:bg-white/40 disabled:cursor-not-allowed disabled:border-hairline disabled:text-ink-muted"
              >
                사용 취소
              </button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
