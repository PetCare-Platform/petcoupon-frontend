import { useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { BackLink, Eyebrow, FieldGroup, LinkButton, inputClass } from "../../components/ui";
import { useToast } from "../../context/ToastContext";
import { ApiError, NetworkError } from "../../api/http";
import { createCoupon } from "../../api/coupons";
import type { CouponCreateResponse, DiscountType } from "../../types/api";

function toLocalDateTime(value: string): string {
  return value.length === 16 ? `${value}:00` : value;
}

export default function CouponForm() {
  const { eventId } = useParams();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [discountType, setDiscountType] = useState<DiscountType>("RATE");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("0");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [issueStart, setIssueStart] = useState("");
  const [issueEnd, setIssueEnd] = useState("");
  const [validDays, setValidDays] = useState("7");
  const [quantity, setQuantity] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<CouponCreateResponse | null>(null);

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "필수로 입력해야 하는 항목이에요.";
    if (!discountValue.trim() || Number(discountValue) <= 0) next.discountValue = "0보다 큰 값을 입력해 주세요.";
    if (discountType === "RATE" && (!maxDiscount.trim() || Number(maxDiscount) <= 0)) {
      next.maxDiscount = "정률 할인은 최대 할인 금액이 필요해요.";
    }
    if (minOrderAmount.trim() === "" || Number(minOrderAmount) < 0) next.minOrderAmount = "0 이상의 값을 입력해 주세요.";
    if (!issueStart) next.issueStart = "필수로 입력해야 하는 항목이에요.";
    if (!issueEnd) next.issueEnd = "필수로 입력해야 하는 항목이에요.";
    if (issueStart && issueEnd && issueEnd <= issueStart) next.issueEnd = "종료 시각은 시작 시각 이후여야 해요.";
    if (!validDays.trim() || Number(validDays) <= 0) next.validDays = "1 이상의 값을 입력해 주세요.";
    if (!quantity.trim() || Number(quantity) <= 0) next.quantity = "1장 이상 입력해 주세요.";
    return next;
  }

  async function handleSubmit(formEvent: FormEvent) {
    formEvent.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) {
      showToast("입력 내용을 확인해 주세요.");
      return;
    }
    if (!eventId) return;
    setSubmitting(true);
    try {
      const response = await createCoupon(Number(eventId), {
        name,
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount),
        maxDiscountAmount: discountType === "RATE" ? Number(maxDiscount) : undefined,
        issueStartAt: toLocalDateTime(issueStart),
        issueEndAt: toLocalDateTime(issueEnd),
        validDays: Number(validDays),
        totalQuantity: Number(quantity),
      });
      setCreated(response);
      showToast("쿠폰을 만들었습니다.");
    } catch (err) {
      showToast(err instanceof ApiError || err instanceof NetworkError ? err.message : "저장하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!eventId) {
    return (
      <Layout area="admin" page="coupon-form">
        <section className="py-10">
          <div className="container-page">
            <BackLink to="/admin/events">이벤트 목록</BackLink>
            <p>쿠폰은 특정 이벤트에 소속돼요. 이벤트를 먼저 선택하거나 만들어 주세요.</p>
            <div className="mt-4">
              <LinkButton to="/admin/event-form">이벤트 만들기</LinkButton>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (created) {
    // 공개 이벤트 상세(GET /events/{eventId})가 이벤트에 연결된 쿠폰 목록을 함께 내려주므로
    // 더 이상 ?couponId= 우회 링크가 필요 없다 — 이벤트 상세로 바로 이동한다.
    const applyLink = `/event-detail/${created.eventId}`;
    return (
      <Layout area="admin" page="coupon-form">
        <section className="py-10">
          <div className="container-page max-w-2xl">
            <BackLink to="/admin/coupons">쿠폰 목록</BackLink>
            <Eyebrow>관리자 · 쿠폰 등록 완료</Eyebrow>
            <h1 className="mt-2">{created.name}</h1>
            <div className="mt-6 rounded-block border border-hairline p-6">
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div><dt className="text-ink/60">쿠폰 ID</dt><dd className="font-medium">{created.couponId}</dd></div>
                <div><dt className="text-ink/60">총 발급 수량</dt><dd className="font-medium">{created.totalQuantity}장</dd></div>
                <div><dt className="text-ink/60">할인</dt><dd className="font-medium">{created.discountType === "RATE" ? `${created.discountValue}%` : `${created.discountValue.toLocaleString()}원`}</dd></div>
                <div><dt className="text-ink/60">유효기간</dt><dd className="font-medium">발급 후 {created.validDays}일</dd></div>
              </dl>
            </div>
            <div className="mt-6 rounded-block border border-accent/30 bg-accent/[0.07] p-6">
              <strong className="block">공개 이벤트 상세</strong>
              <p className="mt-1 text-ink/80">
                이 쿠폰은 이벤트 상세 화면의 쿠폰 목록에 표시되며, 사용자는 그곳에서 바로 발급받을 수 있어요.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <LinkButton to={applyLink}>이벤트 상세 보기</LinkButton>
                <LinkButton to="/admin/coupons" variant="secondary">쿠폰 목록으로</LinkButton>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout area="admin" page="coupon-form">
      <section className="py-10">
        <div className="container-page">
          <BackLink to="/admin/coupons">쿠폰 목록</BackLink>
          <Eyebrow>관리자 · 쿠폰 등록</Eyebrow>
          <h1 className="mt-2">쿠폰 만들기</h1>
          <p className="mt-2 text-[15px] text-ink/60">이벤트 #{eventId}에 연결됩니다.</p>
        </div>
      </section>

      <section className="py-10">
        <div className="container-page max-w-2xl">
          <h2>쿠폰 정보</h2>
          <p className="mt-1 text-sm text-ink/60">* 필수 입력</p>

          <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-6 rounded-block border border-hairline p-6">
            <h3 className="text-lg font-semibold">기본 정보</h3>
            <FieldGroup label="쿠폰 이름 *" htmlFor="coupon-name" error={errors.name}>
              <input id="coupon-name" className={inputClass} placeholder="가을 사료 10% 쿠폰" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} maxLength={100} />
            </FieldGroup>

            <h3 className="text-lg font-semibold">할인 조건</h3>
            <div className="grid gap-2">
              <span className="text-[18px] font-medium">할인 방식</span>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" name="discountType" checked={discountType === "RATE"} onChange={() => setDiscountType("RATE")} className="h-5 w-5 accent-ink" />
                  정률(%)
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="discountType" checked={discountType === "FIXED_AMOUNT"} onChange={() => setDiscountType("FIXED_AMOUNT")} className="h-5 w-5 accent-ink" />
                  정액(원)
                </label>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <FieldGroup label={discountType === "RATE" ? "할인율(%) *" : "할인 금액(원) *"} htmlFor="discount-value" error={errors.discountValue}>
                <input id="discount-value" type="number" min={1} className={inputClass} value={discountValue} onChange={(e) => setDiscountValue(e.target.value)} aria-invalid={!!errors.discountValue} />
              </FieldGroup>
              <FieldGroup label="최소 주문 금액(원) *" htmlFor="min-order" error={errors.minOrderAmount}>
                <input id="min-order" type="number" min={0} className={inputClass} value={minOrderAmount} onChange={(e) => setMinOrderAmount(e.target.value)} aria-invalid={!!errors.minOrderAmount} />
              </FieldGroup>
            </div>
            <FieldGroup label="최대 할인 금액(원)" htmlFor="max-discount" error={errors.maxDiscount} help={discountType === "FIXED_AMOUNT" ? "정액 할인에는 적용되지 않아요." : "정률 할인에는 필수예요."}>
              <input
                id="max-discount"
                type="number"
                min={1}
                className={inputClass}
                placeholder="10000"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                disabled={discountType !== "RATE"}
                aria-invalid={!!errors.maxDiscount}
              />
            </FieldGroup>

            <h3 className="text-lg font-semibold">발급 조건</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <FieldGroup label="발급 시작 *" htmlFor="issue-start" error={errors.issueStart}>
                <input id="issue-start" type="datetime-local" className={inputClass} value={issueStart} onChange={(e) => setIssueStart(e.target.value)} aria-invalid={!!errors.issueStart} />
              </FieldGroup>
              <FieldGroup label="발급 종료 *" htmlFor="issue-end" error={errors.issueEnd}>
                <input id="issue-end" type="datetime-local" className={inputClass} value={issueEnd} onChange={(e) => setIssueEnd(e.target.value)} aria-invalid={!!errors.issueEnd} />
              </FieldGroup>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <FieldGroup label="유효 기간(일) *" htmlFor="valid-days" error={errors.validDays} help="발급 후 사용할 수 있는 일수입니다.">
                <input id="valid-days" type="number" min={1} className={inputClass} value={validDays} onChange={(e) => setValidDays(e.target.value)} aria-invalid={!!errors.validDays} />
              </FieldGroup>
              <FieldGroup label="총 발급 수량 *" htmlFor="quantity" error={errors.quantity}>
                <input id="quantity" type="number" min={1} className={inputClass} placeholder="400" value={quantity} onChange={(e) => setQuantity(e.target.value)} aria-invalid={!!errors.quantity} />
              </FieldGroup>
            </div>

            <div className="rounded-control border border-hairline bg-surface-2 p-4 text-sm">
              <strong className="block">발급 정책</strong>
              <p className="mt-1 text-ink/80">사용자 한 명은 같은 쿠폰을 한 장만 받을 수 있습니다.</p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-ink bg-ink px-5 text-[18px] font-medium text-paper transition-all active:scale-[0.97] hover:bg-[#262626] disabled:cursor-wait disabled:opacity-70"
              >
                {submitting ? <span className="h-4 w-4 flex-none animate-spin rounded-full border-2 border-paper/30 border-t-paper" aria-hidden="true" /> : null}
                {submitting ? "저장하는 중" : "쿠폰 저장"}
              </button>
              <LinkButton to="/admin/coupons" variant="secondary">취소</LinkButton>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
}
