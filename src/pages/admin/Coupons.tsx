import { useMemo, useState } from "react";
import { Layout } from "../../components/Layout";
import { Eyebrow, FilterBar, LinkButton } from "../../components/ui";
import { useToast } from "../../context/ToastContext";

type Status = "active" | "scheduled" | "closed";

const COUPONS: { id: number; status: Status; event: string; name: string; value: string; stock: number; total: number }[] = [
  { id: 10, status: "active", event: "여름 케어 위크", name: "여름 정률 쿠폰", value: "20%", stock: 284, total: 500 },
  { id: 11, status: "active", event: "함께 걷는 계절", name: "산책용품 할인 쿠폰", value: "7,000원", stock: 128, total: 1000 },
  { id: 12, status: "scheduled", event: "건강검진 데이", name: "검진 정액 쿠폰", value: "15%", stock: 300, total: 300 },
  { id: 13, status: "scheduled", event: "가을 입맛 찾기", name: "가을 사료 쿠폰", value: "10%", stock: 400, total: 400 },
  { id: 14, status: "closed", event: "웰컴 펫데이", name: "웰컴 정액 쿠폰", value: "5,000원", stock: 0, total: 200 },
];

const statusLabel: Record<Status, string> = { active: "발급 중", scheduled: "발급 예정", closed: "종료" };
const statusClass: Record<Status, string> = {
  active: "bg-success/10 text-[#0a8f3c]",
  scheduled: "bg-surface-2 text-ink-muted",
  closed: "bg-hairline-soft text-ink-muted",
};

export default function Coupons() {
  const [filter, setFilter] = useState<"all" | Status>("all");
  const { showToast } = useToast();
  const visible = useMemo(() => (filter === "all" ? COUPONS : COUPONS.filter((c) => c.status === filter)), [filter]);

  return (
    <Layout area="admin" page="coupons">
      <section className="py-10">
        <div className="container-page flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>관리자 · 쿠폰</Eyebrow>
            <h1 className="mt-2">쿠폰 목록</h1>
            <p className="mt-2 text-[18px] text-ink/70">할인 조건과 발급 기간, 남은 재고를 빠르게 확인하세요.</p>
          </div>
          <LinkButton to="/admin/coupon-form">새 쿠폰</LinkButton>
        </div>
      </section>

      <section className="py-6">
        <div className="container-page">
          <div className="rounded-block border border-hairline bg-surface-2 p-6 text-ink md:p-8">
            <span className="text-xs font-semibold uppercase tracking-wide">재고 알림</span>
            <h2 className="mt-1">산책용품 할인 쿠폰, 재고 128장.</h2>
            <p className="mt-2">발급 종료까지 남았습니다 · 소진 속도와 이벤트 총 수량을 함께 확인하세요.</p>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2>등록 쿠폰</h2>
              <p className="mt-1 text-[17px] text-ink/70">{visible.length}개의 쿠폰</p>
            </div>
            <FilterBar
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: `전체 ${COUPONS.length}` },
                { value: "active", label: `발급 중 ${COUPONS.filter((c) => c.status === "active").length}` },
                { value: "scheduled", label: `발급 예정 ${COUPONS.filter((c) => c.status === "scheduled").length}` },
                { value: "closed", label: `종료 ${COUPONS.filter((c) => c.status === "closed").length}` },
              ]}
            />
          </div>

          <div className="mt-6 grid gap-2.5">
            {visible.map((coupon) => (
              <article key={coupon.id} className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-hairline p-3.5">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs text-ink/50">쿠폰 {coupon.id}</span>
                    <span className={`inline-flex min-h-6 items-center rounded-full px-2 text-[11px] font-semibold uppercase tracking-wide ${statusClass[coupon.status]}`}>
                      {statusLabel[coupon.status]}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold">{coupon.name}</h3>
                  <p className="mt-0.5 text-sm text-ink/60">
                    {coupon.event} · {coupon.value} · 재고 {coupon.stock}/{coupon.total}
                  </p>
                </div>
                <div className="flex gap-4 text-sm font-medium">
                  <LinkButton to="/admin/coupon-form" variant="text" className="!text-[16px]">
                    수정
                  </LinkButton>
                  <button type="button" onClick={() => showToast(`${coupon.name} 삭제를 요청했습니다.`)} className="underline underline-offset-4">
                    삭제
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
