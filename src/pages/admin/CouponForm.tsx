import { useState, type FormEvent } from "react";
import { Layout } from "../../components/Layout";
import { BackLink, Eyebrow, FieldGroup, LinkButton, inputClass } from "../../components/ui";
import { useToast } from "../../context/ToastContext";

export default function CouponForm() {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [discountType, setDiscountType] = useState<"RATE" | "AMOUNT">("RATE");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [validDays, setValidDays] = useState("7");
  const [quantity, setQuantity] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "필수로 입력해야 하는 항목이에요.";
    if (discountType === "RATE" && !maxDiscount.trim()) next.maxDiscount = "정률 할인은 최대 할인 금액이 필요해요.";
    if (!quantity.trim()) next.quantity = "필수로 입력해야 하는 항목이에요.";
    else if (Number(quantity) <= 0) next.quantity = "1장 이상 입력해 주세요.";
    setErrors(next);
    if (Object.keys(next).length) {
      showToast("입력 내용을 확인해 주세요.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showToast("쿠폰을 저장했습니다.");
    }, 500);
  }

  return (
    <Layout area="admin" page="coupon-form">
      <section className="py-10">
        <div className="container-page">
          <BackLink to="/admin/coupons">쿠폰 목록</BackLink>
          <Eyebrow>관리자 · 쿠폰 등록</Eyebrow>
          <h1 className="mt-2">쿠폰 만들기</h1>
        </div>
      </section>

      <section className="py-6">
        <div className="container-page">
          <div className="rounded-block border border-hairline bg-surface-2 p-6 text-ink md:p-8">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-semibold">사용자 한도</span>
                <p>쿠폰당 1장</p>
              </div>
              <div>
                <span className="text-sm font-semibold">권장 유효기간</span>
                <p>발급 후 7일</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-page max-w-2xl">
          <h2>쿠폰 정보</h2>
          <p className="mt-1 text-sm text-ink/60">* 필수 입력</p>

          <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-6 rounded-block border border-hairline p-6">
            <h3 className="text-lg font-semibold">기본 정보</h3>
            <FieldGroup label="연결 이벤트 *" htmlFor="coupon-event">
              <select id="coupon-event" className={inputClass} defaultValue="가을 입맛 찾기">
                <option>가을 입맛 찾기</option>
                <option>건강검진 데이</option>
                <option>함께 걷는 계절</option>
              </select>
            </FieldGroup>
            <FieldGroup label="쿠폰 이름 *" htmlFor="coupon-name" error={errors.name}>
              <input id="coupon-name" className={inputClass} placeholder="가을 사료 10% 쿠폰" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} />
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
                  <input type="radio" name="discountType" checked={discountType === "AMOUNT"} onChange={() => setDiscountType("AMOUNT")} className="h-5 w-5 accent-ink" />
                  정액(원)
                </label>
              </div>
            </div>
            <FieldGroup label="최대 할인 금액" htmlFor="max-discount" error={errors.maxDiscount} help={discountType === "AMOUNT" ? "정액 할인에는 적용되지 않아요." : undefined}>
              <input
                id="max-discount"
                type="number"
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
              <FieldGroup label="유효 기간(일)" htmlFor="valid-days" help="발급 후 사용할 수 있는 일수입니다.">
                <input id="valid-days" type="number" className={inputClass} value={validDays} onChange={(e) => setValidDays(e.target.value)} />
              </FieldGroup>
              <FieldGroup label="총 발급 수량 *" htmlFor="quantity" error={errors.quantity}>
                <input id="quantity" type="number" className={inputClass} placeholder="400" value={quantity} onChange={(e) => setQuantity(e.target.value)} aria-invalid={!!errors.quantity} />
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
