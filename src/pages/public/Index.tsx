import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { LinkButton, ColorBlock, Eyebrow, FilterBar } from "../../components/ui";

type Status = "open" | "scheduled" | "closed";

const EVENTS: { id: number; status: Status; label: string; title: string; desc: string; period: string; benefit: string; cta: string }[] = [
  { id: 1, status: "open", label: "EVENT 01", title: "반려동물 여름 케어 위크", desc: "목욕과 미용을 함께 챙기는 계절 한정 혜택", period: "8.20 — 8.30", benefit: "최대 20%", cta: "이벤트 보기" },
  { id: 2, status: "scheduled", label: "EVENT 02", title: "건강검진 데이", desc: "기본 검진 패키지를 부담 없이 시작하는 주간", period: "8.24 — 9.07", benefit: "15%", cta: "이벤트 보기" },
  { id: 3, status: "open", label: "EVENT 03", title: "함께 걷는 계절", desc: "산책용품과 야외 활동을 위한 정액 할인", period: "8.15 — 8.25", benefit: "7,000원", cta: "이벤트 보기" },
  { id: 5, status: "closed", label: "EVENT 05", title: "웰컴 펫데이", desc: "첫 구매 고객을 위한 반가운 시작 쿠폰", period: "7.01 — 7.31", benefit: "5,000원", cta: "지난 이벤트 보기" },
];

const statusLabel: Record<Status, string> = { open: "진행 중", scheduled: "오픈 예정", closed: "종료" };
const statusClass: Record<Status, string> = {
  open: "bg-lime",
  scheduled: "bg-lilac",
  closed: "bg-hairline-soft",
};

export default function Index() {
  const [filter, setFilter] = useState<"all" | Status>("all");
  const visible = useMemo(() => (filter === "all" ? EVENTS : EVENTS.filter((e) => e.status === filter)), [filter]);

  return (
    <Layout area="public" page="index">
      <section className="py-14 md:py-20">
        <div className="container-page grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-start">
          <div className="animate-reveal-up">
            <Eyebrow>PUBLIC / PET BENEFITS</Eyebrow>
            <h1 className="mt-2">
              좋은 돌봄을
              <br />더 가볍게.
            </h1>
            <p className="mt-4 max-w-[52ch] text-ink/70">
              미용부터 건강검진, 산책용품까지. 지금 참여할 수 있는 반려생활 혜택을 골라 쿠폰으로 간직하세요.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#event-list" className="inline-flex min-h-11 items-center justify-center rounded-full border border-ink bg-ink px-5 text-[18px] font-medium text-paper transition-colors hover:bg-[#262626]">
                이벤트 둘러보기
              </a>
              <LinkButton to="/user/my-coupons" variant="secondary">내 쿠폰 보기</LinkButton>
            </div>
          </div>
          <aside aria-label="오늘의 안내" className="animate-reveal-up rounded-block bg-lilac p-6 text-[#0f172a]">
            <span className="font-mono text-xs uppercase tracking-wide">TODAY'S NOTE</span>
            <strong className="mt-2 block text-xl">반려동물 여름 케어 위크</strong>
            <p className="mt-2">목욕·미용 서비스에 사용할 수 있는 시즌 쿠폰이 열려 있어요.</p>
          </aside>
        </div>
      </section>

      <section className="py-10">
        <div className="container-page">
          <ColorBlock tone="lime">
            <Eyebrow>FEATURED / OPEN NOW</Eyebrow>
            <h2 className="mt-2">
              이번 여름,
              <br />
              보송한 하루를 선물하세요.
            </h2>
            <p className="mt-4 max-w-[56ch]">반려동물 여름 케어 위크에서 미용·목욕 결제에 쓸 수 있는 최대 20% 할인 쿠폰을 만나보세요.</p>
            <dl className="mt-6 grid max-w-md grid-cols-2 gap-4 border-t border-[#0f172a]/20 pt-4">
              <div>
                <dt className="text-sm text-[#0f172a]/70">발급 마감</dt>
                <dd className="font-semibold">8월 30일 23:59</dd>
              </div>
              <div>
                <dt className="text-sm text-[#0f172a]/70">남은 수량</dt>
                <dd className="font-semibold">284장</dd>
              </div>
            </dl>
            <Link to="/event-detail" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-[#0f172a] px-5 text-[18px] font-medium text-white transition-colors hover:bg-[#1e293b]">
              혜택 자세히 보기
            </Link>
          </ColorBlock>
        </div>
      </section>

      <section id="event-list" className="py-14">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>EVENT DIRECTORY</Eyebrow>
              <h2 className="mt-2">지금의 이벤트</h2>
              <p className="mt-1 text-ink/70">
                <span aria-live="polite">{visible.length}개</span>의 이벤트를 보여드려요.
              </p>
            </div>
            <FilterBar
              value={filter}
              onChange={setFilter}
              options={[
                { value: "all", label: "전체" },
                { value: "open", label: "진행 중" },
                { value: "scheduled", label: "오픈 예정" },
                { value: "closed", label: "종료" },
              ]}
            />
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {visible.map((event, i) => (
              <article
                key={event.id}
                className="animate-reveal-up flex min-h-full flex-col rounded-block border border-hairline p-6 transition-all duration-200 ease-fluid hover:-translate-y-0.5 hover:border-ink"
                style={{ animationDelay: `${Math.min(i, 4) * 60}ms` }}
              >
                <div className="mb-7 flex items-center justify-between gap-3">
                  <span className={`inline-flex min-h-8 items-center rounded-full px-2.5 font-mono text-xs uppercase tracking-wide text-[#0f172a] ${statusClass[event.status]}`}>
                    {statusLabel[event.status]}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-wide text-ink/60">{event.label}</span>
                </div>
                <h3 className="mb-3 text-2xl font-semibold">{event.title}</h3>
                <p className="text-ink/70">{event.desc}</p>
                <dl className="my-6 space-y-2">
                  <div className="flex justify-between border-b border-hairline-soft pb-2 text-sm">
                    <dt className="text-ink/60">기간</dt>
                    <dd className="font-medium">{event.period}</dd>
                  </div>
                  <div className="flex justify-between pb-2 text-sm">
                    <dt className="text-ink/60">대표 혜택</dt>
                    <dd className="font-medium">{event.benefit}</dd>
                  </div>
                </dl>
                <Link to="/event-detail" className="mt-auto inline-flex items-center justify-between gap-2 text-[18px] font-medium underline underline-offset-4 transition-all hover:gap-3">
                  {event.cta} <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
            {visible.length === 0 ? (
              <div className="col-span-full rounded-block border border-dashed border-hairline p-10 text-center">
                <h3 className="text-xl font-semibold">조건에 맞는 이벤트가 없어요.</h3>
                <p className="mt-2 text-ink/70">다른 상태를 선택해 보세요.</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container-page grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div>
            <Eyebrow>PETCOUPON SERVICE</Eyebrow>
            <h2 className="mt-2">
              받고, 보관하고,
              <br />
              필요할 때 사용하세요.
            </h2>
          </div>
          <ol className="grid gap-6">
            {[
              ["혜택 발견", "공개 이벤트에서 필요한 쿠폰을 고릅니다."],
              ["내 쿠폰 보관", "발급한 쿠폰의 코드와 기한을 확인합니다."],
              ["안전한 사용", "상세 화면에서 사용 상태와 이력을 관리합니다."],
            ].map(([title, desc], i) => (
              <li key={title} className="flex gap-4">
                <span className="font-mono text-sm text-ink/50">0{i + 1}</span>
                <div>
                  <strong className="block">{title}</strong>
                  <span className="text-ink/70">{desc}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </Layout>
  );
}
