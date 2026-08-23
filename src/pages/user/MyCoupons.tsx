import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { Eyebrow, FilterBar, LinkButton, MetricTile } from "../../components/ui";

type Status = "available" | "used" | "expired";

const COUPONS: { issue: number; status: Status; badge?: string; event: string; name: string; value: string; condition: string; deadline: string }[] = [
  { issue: 1042, status: "available", event: "반려동물 여름 케어 위크", name: "여름 정률 쿠폰", value: "20%", condition: "3만원 이상 구매 · 최대 1만원 할인", deadline: "8월 28일 23:59까지" },
  { issue: 1038, status: "available", badge: "곧 만료", event: "함께 걷는 계절", name: "산책용품 할인 쿠폰", value: "7,000원", condition: "2만원 이상 산책용품 구매", deadline: "8월 25일 15:22까지" },
  { issue: 1029, status: "used", event: "웰컴 펫데이", name: "웰컴 정액 쿠폰", value: "5,000원", condition: "첫 구매 전용", deadline: "7월 22일 사용 완료" },
  { issue: 1017, status: "expired", event: "봄맞이 청소 위크", name: "미용 정률 쿠폰", value: "15%", condition: "미용 서비스 전용", deadline: "6월 30일 만료" },
];

const statusLabel: Record<Status, string> = { available: "사용 가능", used: "사용 완료", expired: "만료" };

export default function MyCoupons() {
  const [filter, setFilter] = useState<"all" | Status>("all");
  const visible = useMemo(() => (filter === "all" ? COUPONS : COUPONS.filter((c) => c.status === filter)), [filter]);
  const availableCount = COUPONS.filter((c) => c.status === "available").length;

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
          <p className="mt-2 text-ink/70">김하늘 님이 받은 혜택의 상태와 사용 기한을 확인하세요.</p>
          <div className="mt-6 max-w-xs">
            <MetricTile label="지금 사용 가능" value={availableCount} hint="지금 사용할 수 있는 쿠폰" />
          </div>
        </div>
      </section>

      <section className="py-4">
        <div className="container-page">
          <div className="rounded-block border border-hairline bg-surface-2 p-6 text-ink md:p-8">
            <h3 className="text-xl font-semibold">산책용품 할인 쿠폰이 곧 만료돼요.</h3>
            <p className="mt-2">8월 25일 15:22까지 사용할 수 있어요. 가까운 제휴 매장에서 산책 준비물을 챙겨보세요.</p>
            <Link to="/user/coupon-detail" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-[18px] font-medium text-white hover:bg-ink-muted">
              쿠폰 확인하기
            </Link>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2>보유 쿠폰</h2>
              <p className="mt-1 text-ink/70">{COUPONS.length}개의 쿠폰이 있어요.</p>
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

          <div className="mt-8 grid items-start gap-3 sm:grid-cols-2">
            {visible.map((coupon) => (
              <article key={coupon.issue} className="rounded-control border border-hairline p-3.5">
                <div className="mb-2 flex items-center justify-between">
                  {coupon.badge ? (
                    <span className="inline-flex min-h-6 items-center rounded-full border border-accent/30 bg-accent/10 px-2 text-[11px] font-semibold uppercase tracking-wide text-accent-ink">{coupon.badge}</span>
                  ) : (
                    <span className="inline-flex min-h-6 items-center rounded-full bg-hairline-soft px-2 text-[11px] font-semibold uppercase tracking-wide">{statusLabel[coupon.status]}</span>
                  )}
                  <span className="text-[11px] text-ink/50">발급번호 {coupon.issue}</span>
                </div>
                <p className="text-xs text-ink/60">{coupon.event}</p>
                <h3 className="mt-0.5 text-base font-semibold">{coupon.name}</h3>
                <p className="mt-1 text-xl font-semibold">{coupon.value}</p>
                <p className="mt-0.5 text-xs text-ink/60">{coupon.condition}</p>
                <div className="mt-3 flex items-center justify-between border-t border-hairline-soft pt-3 text-xs">
                  <span className="text-ink/60">{coupon.deadline}</span>
                  <Link to="/user/coupon-detail" className="font-medium underline underline-offset-4">
                    상세 보기 →
                  </Link>
                </div>
              </article>
            ))}
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
        </div>
      </section>
    </Layout>
  );
}
