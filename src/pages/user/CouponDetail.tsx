import { useCallback, useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Layout } from "../../components/Layout";
import { StatusPill } from "../../components/ui";
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
  // 상세 API(GET /coupon-issues/{id})는 쿠폰 이름을 주지 않는다. 목록에서 넘겨준
  // 값을 쓰고, 주소로 바로 들어온 경우엔 상태 배지만으로 표시한다.
  const routeState = useLocation().state as { couponName?: string } | null;
  const couponName = routeState?.couponName ?? null;
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
    const userId = getCurrentUserId();
    if (userId === null) {
      showToast("사용자 ID가 설정되지 않아 쿠폰을 사용 처리할 수 없습니다.");
      return;
    }
    setBusy(true);
    try {
      await useCouponIssue(Number(couponIssueId), { userId });
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
    const userId = getCurrentUserId();
    if (userId === null) {
      showToast("사용자 ID가 설정되지 않아 쿠폰 사용을 취소할 수 없습니다.");
      return;
    }
    setBusy(true);
    try {
      await cancelCouponIssue(Number(couponIssueId), { userId });
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
      <Layout area="user">
        <section className="py-6">
          <div className="container-page">
            <p className="text-[15px] text-ink-muted">발급 번호가 없어 쿠폰을 찾을 수 없어요.</p>
          </div>
        </section>
      </Layout>
    );
  }

  if (loadError) {
    return (
      <Layout area="user">
        <section className="py-6">
          <div className="container-page">
            <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] md:text-[32px]">{loadError}</h1>
          </div>
        </section>
      </Layout>
    );
  }

  if (!detail) {
    return (
      <Layout area="user">
        <section className="py-6">
          <div className="container-page">
            <div className="h-8 w-40 animate-pulse rounded-full bg-surface-2" />
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
              <div className="h-[210px] animate-pulse rounded-block bg-surface-2" />
              <div className="h-[130px] animate-pulse rounded-block bg-surface-2" />
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout area="user">
      {/* 네 개로 쪼개져 있던 섹션(발급 헤더 / 코드 / 발급 정보 / 쿠폰 처리)을
          한 섹션 2단 그리드로 합친다. 스크롤 없이 한 화면에서 끝나야 한다. */}
      <section className="py-6">
        <div className="container-page">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] md:text-[32px]">
              {couponName ?? "쿠폰 상세"}
            </h1>
            <StatusPill tone={detail.status === "ISSUED" ? "open" : "closed"}>{statusLabel[detail.status]}</StatusPill>
          </div>
          <p className="mt-1.5 text-[15px] text-ink-muted">
            발급번호 {detail.couponIssueId} · {formatDateTime(detail.createdAt)}에 발급받았어요.
          </p>

          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
            <div className="rounded-block border border-hairline bg-surface-2 p-4">
              <p className="text-[13px] font-medium text-accent-ink">결제 전에 이 코드를 보여주세요.</p>

              <div className="mt-3 flex flex-col items-center gap-4 rounded-control bg-paper p-3.5 sm:flex-row sm:items-start sm:justify-between">
                {/* 코드 블록만 세로 가운데. 오른쪽 QR·복사 버튼은 아래 정렬을 유지한다. */}
                <div className="flex flex-col items-center text-center sm:items-start sm:self-center sm:text-left">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-ink/60">쿠폰 코드</span>
                  <p className="mt-1 font-mono text-2xl font-semibold tracking-wide">{detail.couponCode}</p>
                </div>
                {/* 복사 버튼은 코드 아래(= 쿠폰 사용 바로 위)가 아니라 QR 왼쪽에 세로 가운데로 둔다. */}
                <div className="flex flex-none items-end gap-4">
                  <button
                    type="button"
                    onClick={copyCode}
                    className="inline-flex min-h-9 items-center justify-center self-center rounded-full border border-accent bg-accent px-4 text-[14px] font-medium text-ink transition-all active:scale-[0.97] hover:border-accent-ink hover:bg-accent-ink hover:text-paper"
                  >
                    코드 복사
                  </button>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="rounded-control border border-hairline p-2">
                      <QRCodeSVG value={detail.couponCode} size={80} fgColor="#1d1d1b" level="M" />
                    </div>
                    <span className="text-[11px] text-ink/50">매장에서 QR로 제시하세요</span>
                  </div>
                </div>
              </div>

              {/* '쿠폰 처리'는 별도 섹션이었다. 제목 두 줄을 걷고 버튼만 남긴다. */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={markUsed}
                  disabled={busy || !detail.isUsable}
                  className="inline-flex min-h-9 items-center justify-center rounded-full border border-accent bg-accent px-4 text-[14px] font-medium text-ink transition-all active:scale-[0.97] hover:border-accent-ink hover:bg-accent-ink hover:text-paper disabled:cursor-not-allowed disabled:border-hairline disabled:bg-surface-2 disabled:text-ink-muted"
                >
                  쿠폰 사용
                </button>
                <button
                  type="button"
                  onClick={cancelUse}
                  disabled={busy || detail.status !== "USED"}
                  className="inline-flex min-h-9 items-center justify-center rounded-full border border-hairline bg-paper px-4 text-[14px] font-medium transition-all active:scale-[0.97] hover:border-ink disabled:cursor-not-allowed disabled:border-hairline-soft disabled:text-ink-muted"
                >
                  사용 취소
                </button>
                <p className="text-[13px] text-ink-muted">결제 확정 후 사용 처리하세요. 잘못 처리했다면 되돌릴 수 있어요.</p>
              </div>
            </div>

            <div className="rounded-block border border-hairline p-4">
              <h2 className="text-[17px] font-semibold">발급 정보</h2>
              <dl className="mt-3 divide-y divide-hairline-soft text-[14px]">
                <div className="flex items-baseline justify-between gap-3 py-2">
                  <dt className="text-ink-muted">발급일</dt>
                  <dd className="font-medium">{formatDateTime(detail.createdAt)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 py-2">
                  <dt className="text-ink-muted">사용 기한</dt>
                  <dd className="font-medium">{formatDateTime(detail.expiresAt)}</dd>
                </div>
                {detail.usedAt ? (
                  <div className="flex items-baseline justify-between gap-3 py-2">
                    <dt className="text-ink-muted">사용일시</dt>
                    <dd className="font-medium">{formatDateTime(detail.usedAt)}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
