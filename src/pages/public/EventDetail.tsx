import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { ColorBlock, Eyebrow, MetricGrid, MetricTile } from "../../components/ui";
import { useToast } from "../../context/ToastContext";

const COUPONS = [
  { id: "rate", name: "여름 정률 쿠폰", detail: "3만원 이상 구매 · 최대 1만원 할인", value: "20%" },
  { id: "amount", name: "첫 만남 정액 쿠폰", detail: "2만원 이상 구매 · 첫 구매 전용", value: "5,000원" },
];

export default function EventDetail() {
  const [selected, setSelected] = useState("rate");
  const { showToast } = useToast();

  function handleIssue(event: FormEvent) {
    event.preventDefault();
    const coupon = COUPONS.find((c) => c.id === selected)!;
    showToast(`${coupon.name}이 내 쿠폰에 담겼습니다.`);
  }

  return (
    <Layout area="public" page="event-detail">
      <section className="py-10">
        <div className="container-page">
          <Link to="/" className="mb-7 inline-flex min-h-11 items-center gap-2 underline underline-offset-4">
            ← 이벤트 목록
          </Link>
          <Eyebrow>EVENT 01 / OPEN</Eyebrow>
          <h1 className="mt-2">
            반려동물
            <br />
            여름 케어 위크
          </h1>
          <p className="mt-4 max-w-[56ch] text-ink/70">더운 계절에도 산뜻하게. 제휴 미용·목욕 서비스에 사용할 수 있는 두 가지 쿠폰을 준비했어요.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#coupon-choice" className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink bg-ink px-5 text-[18px] font-medium text-paper hover:bg-[#262626]">
              쿠폰 고르기
            </a>
            <a href="#event-guide" className="inline-flex min-h-11 items-center justify-center rounded-full border border-hairline px-5 text-[18px] font-medium hover:border-ink hover:bg-surface-soft">
              사용 안내
            </a>
          </div>
        </div>
      </section>

      <section className="py-6">
        <div className="container-page">
          <ColorBlock tone="lilac">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Eyebrow>AT A GLANCE</Eyebrow>
                <h2 className="mt-1">한눈에 보는 혜택</h2>
              </div>
              <span className="inline-flex min-h-8 flex-none items-center rounded-full bg-lime px-2.5 font-mono text-xs uppercase tracking-wide">진행 중</span>
            </div>
            <div className="mt-6">
              <MetricGrid cols={4}>
                <MetricTile label="최대 할인" value="20%" hint="최대 10,000원" />
                <MetricTile label="현재 잔여" value="284" hint="총 500장" />
                <MetricTile label="발급 종료" value="D-10" hint="8월 30일 23:59" />
                <MetricTile label="사용 기한" value="7일" hint="발급 후 7일" />
              </MetricGrid>
            </div>
          </ColorBlock>
        </div>
      </section>

      <section id="coupon-choice" className="py-14">
        <div className="container-page max-w-2xl">
          <Eyebrow>CHOOSE YOUR COUPON</Eyebrow>
          <h2 className="mt-2">받을 혜택을 골라주세요.</h2>
          <p className="mt-2 text-ink/70">쿠폰별로 한 사람당 한 장만 받을 수 있어요.</p>

          <form onSubmit={handleIssue} className="mt-6 rounded-block border border-hairline p-6">
            <h3 className="mb-4 text-lg font-semibold">발급할 쿠폰</h3>
            <div className="grid gap-3">
              {COUPONS.map((coupon) => (
                <label
                  key={coupon.id}
                  className={`flex min-h-[76px] cursor-pointer items-center justify-between gap-4 rounded-control border p-4 transition-colors ${
                    selected === coupon.id ? "border-ink" : "border-hairline hover:border-ink/50"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="coupon"
                      value={coupon.id}
                      checked={selected === coupon.id}
                      onChange={() => setSelected(coupon.id)}
                      className="h-5 w-5 accent-ink"
                    />
                    <span>
                      <strong className="block">{coupon.name}</strong>
                      <span className="text-sm text-ink/60">{coupon.detail}</span>
                    </span>
                  </span>
                  <span className="text-2xl font-semibold">{coupon.value}</span>
                </label>
              ))}
            </div>

            <div className="mt-6 rounded-control bg-cream p-4 text-sm">
              <strong className="block">발급 전 확인</strong>
              <p className="mt-1 text-[#0f172a]/80">선택한 쿠폰은 사용자 계정에 바로 보관되며, 발급 후에는 다른 쿠폰으로 바꿀 수 없습니다.</p>
            </div>

            <button
              type="submit"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-ink bg-ink px-5 text-[18px] font-medium text-paper transition-all active:scale-[0.97] hover:bg-[#262626]"
            >
              선택한 쿠폰 발급하기
            </button>
          </form>
        </div>
      </section>

      <section id="event-guide" className="py-14">
        <div className="container-page grid gap-8 md:grid-cols-[1fr_1.2fr]">
          <div>
            <Eyebrow>USAGE GUIDE</Eyebrow>
            <h2 className="mt-2">사용 안내</h2>
          </div>
          <ul className="grid gap-3 text-ink/80">
            <li>다른 쿠폰과 중복 적용할 수 없습니다.</li>
            <li>결제 취소 시 매장의 환불 정책을 따릅니다.</li>
            <li>사용 기한이 지난 쿠폰은 다시 발급되지 않습니다.</li>
          </ul>
        </div>
      </section>
    </Layout>
  );
}
