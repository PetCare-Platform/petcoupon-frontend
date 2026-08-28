import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Copy, Ticket, X } from "@phosphor-icons/react";
import { QRCodeSVG } from "qrcode.react";
import { cancelCouponIssue, getCouponIssueDetail, useCouponIssue } from "../../api/couponIssues";
import { getCurrentUserId } from "../../api/currentUser";
import { ApiError, NetworkError } from "../../api/http";
import { StatusPill } from "../../components/ui";
import { useToast } from "../../context/ToastContext";
import { formatDateTime } from "../../lib/date";
import type { CouponIssueDetailResponse, CouponIssueRequestResponse } from "../../types/api";

const statusLabel: Record<CouponIssueDetailResponse["status"], string> = {
  ISSUED: "사용 가능",
  USED: "사용 완료",
  EXPIRED: "만료",
};

interface CouponDetailModalProps {
  coupon: CouponIssueRequestResponse | null;
  onClose: () => void;
  onChanged: (detail: CouponIssueDetailResponse) => void;
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError || error instanceof NetworkError
    ? error.message
    : fallback;
}

export function CouponDetailModal({ coupon, onClose, onChanged }: CouponDetailModalProps) {
  const { showToast } = useToast();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [detail, setDetail] = useState<CouponIssueDetailResponse | null>(null);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      if (!coupon) return;

      setLoadError("");
      try {
        const result = await getCouponIssueDetail(coupon.couponIssueId, signal);
        setDetail(result);
        onChanged(result);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setLoadError(errorMessage(error, "쿠폰 정보를 불러오지 못했습니다."));
      }
    },
    [coupon, onChanged],
  );

  useEffect(() => {
    if (!coupon) return;

    setDetail(null);
    setLoadError("");
    setBusy(false);

    const controller = new AbortController();
    void load(controller.signal);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      controller.abort();
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [coupon, load, onClose]);

  async function copyCode() {
    if (!detail) return;
    try {
      await navigator.clipboard.writeText(detail.couponCode);
      showToast("쿠폰 코드를 복사했습니다.");
    } catch {
      showToast("쿠폰 코드를 복사하지 못했습니다.");
    }
  }

  async function changeCouponStatus(action: "use" | "cancel") {
    if (!coupon || busy) return;

    const userId = getCurrentUserId();
    if (userId === null) {
      showToast(
        action === "use"
          ? "사용자 ID가 설정되지 않아 쿠폰을 사용할 수 없습니다."
          : "사용자 ID가 설정되지 않아 사용을 취소할 수 없습니다.",
      );
      return;
    }

    setBusy(true);
    try {
      if (action === "use") {
        await useCouponIssue(coupon.couponIssueId, { userId });
        showToast("쿠폰을 사용 완료로 표시했습니다.");
      } else {
        await cancelCouponIssue(coupon.couponIssueId, { userId });
        showToast("쿠폰 사용을 취소했습니다.");
      }
      await load();
    } catch (error) {
      showToast(errorMessage(error, "쿠폰 상태를 변경하지 못했습니다."));
    } finally {
      setBusy(false);
    }
  }

  if (!coupon) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/55 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="coupon-detail-title"
        aria-describedby="coupon-detail-description"
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-[560px] overflow-y-auto rounded-panel border border-hairline bg-paper shadow-[0_24px_80px_rgba(23,36,58,0.28)]"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-hairline-soft bg-paper/95 px-5 py-4 backdrop-blur md:px-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 id="coupon-detail-title" className="truncate text-[22px] font-semibold tracking-[-0.02em]">
                {coupon.couponName}
              </h2>
              {detail ? (
                <StatusPill tone={detail.status === "ISSUED" ? "open" : "closed"}>
                  {statusLabel[detail.status]}
                </StatusPill>
              ) : null}
            </div>
            <p id="coupon-detail-description" className="mt-1 text-[13px] text-ink-muted">
              발급번호 {coupon.couponIssueId}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="쿠폰 상세 닫기"
            className="grid h-9 w-9 flex-none place-items-center rounded-full border border-hairline bg-paper transition-colors hover:border-ink hover:bg-surface-2"
          >
            <X weight="bold" className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {loadError ? (
          <div className="px-5 py-12 text-center md:px-6">
            <Ticket className="mx-auto h-9 w-9 text-ink/30" aria-hidden="true" />
            <p className="mt-3 font-semibold">{loadError}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-4 inline-flex min-h-9 items-center justify-center rounded-full border border-hairline px-4 text-[14px] font-medium hover:border-ink"
            >
              다시 시도
            </button>
          </div>
        ) : !detail ? (
          <div className="space-y-4 px-5 py-6 md:px-6">
            <div className="mx-auto h-[136px] w-[136px] animate-pulse rounded-control bg-surface-2" />
            <div className="mx-auto h-7 w-52 animate-pulse rounded-full bg-surface-2" />
            <div className="h-20 animate-pulse rounded-control bg-surface-2" />
          </div>
        ) : (
          <div className="px-5 py-5 md:px-6 md:py-6">
            <div className="flex flex-col items-center">
              <div className="rounded-control border border-hairline bg-white p-3 shadow-[0_6px_20px_rgba(23,36,58,0.08)]">
                <QRCodeSVG value={detail.couponCode} size={132} fgColor="#17243a" level="M" />
              </div>
              <p className="mt-3 text-[12px] text-ink-muted">결제할 때 매장 직원에게 QR 또는 코드를 보여주세요.</p>

              <button
                type="button"
                onClick={copyCode}
                className="group mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline bg-surface-2 px-4 font-mono text-[18px] font-semibold tracking-[0.08em] transition-colors hover:border-accent-ink hover:bg-accent/15"
                aria-label={`쿠폰 코드 ${detail.couponCode} 복사`}
              >
                {detail.couponCode}
                <Copy weight="bold" className="h-4 w-4 text-accent-ink transition-transform group-active:scale-90" aria-hidden="true" />
              </button>
            </div>

            <dl className="mt-5 divide-y divide-hairline-soft rounded-control border border-hairline px-4 text-[14px]">
              <div className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="text-ink-muted">발급일</dt>
                <dd className="text-right font-medium">{formatDateTime(detail.createdAt)}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="text-ink-muted">사용 기한</dt>
                <dd className="text-right font-medium">{formatDateTime(detail.expiresAt)}</dd>
              </div>
              {detail.usedAt ? (
                <div className="flex items-baseline justify-between gap-4 py-2.5">
                  <dt className="text-ink-muted">사용일시</dt>
                  <dd className="text-right font-medium">{formatDateTime(detail.usedAt)}</dd>
                </div>
              ) : null}
            </dl>

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => void changeCouponStatus("use")}
                disabled={busy || !detail.isUsable}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-accent bg-accent px-4 text-[14px] font-semibold text-ink transition-all hover:border-accent-ink hover:bg-accent-ink hover:text-paper active:scale-[0.98] disabled:cursor-not-allowed disabled:border-hairline disabled:bg-surface-2 disabled:text-ink-muted"
              >
                {busy ? "처리 중..." : "쿠폰 사용"}
              </button>
              <button
                type="button"
                onClick={() => void changeCouponStatus("cancel")}
                disabled={busy || detail.status !== "USED"}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-hairline bg-paper px-4 text-[14px] font-semibold transition-all hover:border-ink hover:bg-surface-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:border-hairline-soft disabled:bg-paper disabled:text-ink-muted"
              >
                사용 취소
              </button>
            </div>
            <p className="mt-2.5 text-center text-[12px] leading-relaxed text-ink-muted">
              결제 완료 후에만 사용 처리해 주세요. 잘못 처리한 경우 사용 취소로 되돌릴 수 있어요.
            </p>
          </div>
        )}
      </section>
    </div>,
    document.body,
  );
}
