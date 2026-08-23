import { useMemo, useState } from "react";
import { Layout } from "../../components/Layout";
import { Eyebrow, FilterBar, LinkButton } from "../../components/ui";
import { useToast } from "../../context/ToastContext";

type Status = "open" | "scheduled" | "closed";

const EVENTS: { id: number; status: Status; title: string; period: string; coupons: number }[] = [
  { id: 1, status: "open", title: "반려동물 여름 케어 위크", period: "8.20 - 8.30", coupons: 2 },
  { id: 2, status: "scheduled", title: "건강검진 데이", period: "8.24 - 9.07", coupons: 1 },
  { id: 3, status: "open", title: "함께 걷는 계절", period: "8.15 - 8.25", coupons: 1 },
  { id: 4, status: "scheduled", title: "가을 입맛 찾기", period: "9.01 - 9.14", coupons: 2 },
  { id: 5, status: "closed", title: "웰컴 펫데이", period: "7.01 - 7.31", coupons: 1 },
];

const statusLabel: Record<Status, string> = { open: "진행 중", scheduled: "예정", closed: "종료" };
const statusClass: Record<Status, string> = {
  open: "bg-success/10 text-[#0a8f3c]",
  scheduled: "bg-surface-2 text-ink-muted",
  closed: "bg-hairline-soft text-ink-muted",
};

export default function Events() {
  const [filter, setFilter] = useState<"all" | Status>("all");
  const { showToast } = useToast();
  const visible = useMemo(() => (filter === "all" ? EVENTS : EVENTS.filter((e) => e.status === filter)), [filter]);

  return (
    <Layout area="admin" page="events">
      <section className="py-10">
        <div className="container-page flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>관리자 · 이벤트</Eyebrow>
            <h1 className="mt-2">이벤트 목록</h1>
            <p className="mt-2 text-ink/70">공개 일정과 상태, 연결된 쿠폰을 확인하고 필요한 항목을 관리하세요.</p>
          </div>
          <LinkButton to="/admin/event-form">새 이벤트</LinkButton>
        </div>
      </section>

      <section className="py-6">
        <div className="container-page">
          <div className="rounded-block border border-hairline bg-surface-2 p-6 text-ink md:p-8">
            <span className="text-xs font-semibold uppercase tracking-wide">다음 오픈</span>
            <h2 className="mt-1">건강검진 데이가 3일 뒤 시작됩니다.</h2>
            <p className="mt-2">연결 쿠폰의 발급 시간과 총 수량을 마지막으로 점검해 주세요.</p>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2>등록 이벤트</h2>
              <p className="mt-1 text-ink/70">{visible.length}개의 이벤트</p>
            </div>
            <FilterBar
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: "전체" },
                { value: "open", label: "진행 중" },
                { value: "scheduled", label: "예정" },
                { value: "closed", label: "종료" },
              ]}
            />
          </div>

          <div className="mt-6 grid gap-2.5">
            {visible.map((event) => (
              <article key={event.id} className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-hairline p-3.5">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xs text-ink/50">이벤트 {String(event.id).padStart(2, "0")}</span>
                    <span className={`inline-flex min-h-6 items-center rounded-full px-2 text-[11px] font-semibold uppercase tracking-wide ${statusClass[event.status]}`}>
                      {statusLabel[event.status]}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold">{event.title}</h3>
                  <p className="mt-0.5 text-sm text-ink/60">
                    {event.period} · 쿠폰 {event.coupons}개
                  </p>
                </div>
                <div className="flex gap-4 text-sm font-medium">
                  <LinkButton to="/admin/event-form" variant="text" className="!text-[16px]">
                    수정
                  </LinkButton>
                  <button
                    type="button"
                    onClick={() => showToast(`${event.title} 삭제를 요청했습니다.`)}
                    className="underline underline-offset-4"
                  >
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
