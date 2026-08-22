import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { ColorBlock, Eyebrow, FilterBar, ImageCrossfade, LinkButton, PET_SHOWCASE_IMAGES_HOME, TextLink } from "../../components/ui";
import { EVENTS, type EventStatus } from "../../data/events";

const statusLabel: Record<EventStatus, string> = { open: "진행 중", scheduled: "오픈 예정", closed: "종료" };
const statusClass: Record<EventStatus, string> = {
  open: "bg-success/10 text-[#0a8f3c]",
  scheduled: "bg-surface-2 text-ink-muted",
  closed: "bg-hairline-soft text-ink-muted",
};

const FEATURED_EVENT = EVENTS[0];

export default function Index() {
  const [filter, setFilter] = useState<"all" | EventStatus>("all");
  const visible = useMemo(() => (filter === "all" ? EVENTS : EVENTS.filter((e) => e.status === filter)), [filter]);

  return (
    <Layout area="public" page="index">
      <section className="py-14 md:py-20">
        <div className="container-page grid gap-10 md:grid-cols-[1.15fr_1fr] md:items-center">
          <div className="animate-reveal-up">
            <Eyebrow>PET BENEFITS</Eyebrow>
            <h1 className="mt-2">
              좋은 돌봄을
              <br />더 <span className="text-accent">가볍게</span>.
            </h1>
            <p className="mt-4 max-w-[52ch] text-ink/70">
              미용부터 건강검진, 산책용품까지. 지금 참여할 수 있는 반려생활 혜택을 골라 쿠폰으로 간직하세요.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <LinkButton to="#event-list">이벤트 둘러보기</LinkButton>
              <TextLink to="/user/my-coupons">내 쿠폰 보기</TextLink>
            </div>
          </div>
          <div className="animate-reveal-up" style={{ animationDelay: "160ms" }}>
            <ImageCrossfade images={PET_SHOWCASE_IMAGES_HOME} />
            <p className="mt-3 text-sm text-ink/60">강아지든 고양이든, 우리 아이를 위한 혜택이 늘 열려 있어요.</p>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-page">
          <ColorBlock tone="accent">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-6 -top-10 select-none font-mono text-[180px] font-bold leading-none text-accent/10 md:text-[240px]"
            >
              {FEATURED_EVENT.benefit.replace("최대 ", "")}
            </span>
            <Eyebrow>지금 가장 주목받는 이벤트</Eyebrow>
            <h2 className="mt-2">
              이번 여름,
              <br />
              <span className="text-accent">보송한</span> 하루를 선물하세요.
            </h2>
            <p className="mt-4 max-w-[56ch]">
              {FEATURED_EVENT.title}에서 미용·목욕 결제에 쓸 수 있는 {FEATURED_EVENT.benefit}{" "}
              <strong className="font-semibold text-accent-ink">할인</strong> 쿠폰을 만나보세요.
            </p>
            <dl className="mt-6 grid max-w-md grid-cols-2 gap-4 border-t border-hairline pt-4">
              <div>
                <dt className="text-sm text-ink-muted">발급 마감</dt>
                <dd className="font-semibold">{FEATURED_EVENT.metrics.find((m) => m.label === "발급 종료")?.hint}</dd>
              </div>
              <div>
                <dt className="text-sm text-ink-muted">남은 수량</dt>
                <dd className="font-semibold">{FEATURED_EVENT.metrics.find((m) => m.label === "현재 잔여")?.value}장</dd>
              </div>
            </dl>
            <LinkButton to={`/event-detail/${FEATURED_EVENT.id}`} className="mt-6">
              혜택 자세히 보기
            </LinkButton>
          </ColorBlock>
        </div>
      </section>

      <section id="event-list" className="py-14">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2>진행 중인 이벤트 전체</h2>
              <p className="mt-1 text-ink/70">
                <span aria-live="polite">{visible.length}개</span>의 이벤트를 보여드려요. 각 이벤트를 눌러 전용 쿠폰을 확인하세요.
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

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {visible.map((event, i) => (
              <article
                key={event.id}
                className="animate-reveal-up flex min-h-full flex-col rounded-control border border-hairline p-4 transition-all duration-200 ease-fluid hover:-translate-y-0.5 hover:border-ink"
                style={{ animationDelay: `${Math.min(i, 4) * 60}ms` }}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className={`inline-flex min-h-7 items-center rounded-full px-2 font-mono text-xs uppercase tracking-wide ${statusClass[event.status]}`}>
                    {statusLabel[event.status]}
                  </span>
                  <span className="font-mono text-xs uppercase tracking-wide text-ink/60">{event.label}</span>
                </div>
                <h3 className="mb-1.5 text-lg font-semibold">{event.title}</h3>
                <p className="text-sm text-ink/70">{event.desc}</p>
                <dl className="my-3 space-y-1.5">
                  <div className="flex justify-between border-b border-hairline-soft pb-2 text-sm">
                    <dt className="text-ink/60">기간</dt>
                    <dd className="font-medium">{event.period}</dd>
                  </div>
                  <div className="flex justify-between border-b border-hairline-soft pb-2 text-sm">
                    <dt className="text-ink/60">대표 혜택</dt>
                    <dd className="font-medium">{event.benefit}</dd>
                  </div>
                  <div className="flex justify-between pb-2 text-sm">
                    <dt className="text-ink/60">{event.metrics[1].label}</dt>
                    <dd className={`font-medium ${event.status === "open" ? "text-accent-ink" : ""}`}>{event.metrics[1].value}장</dd>
                  </div>
                </dl>
                <Link
                  to={`/event-detail/${event.id}`}
                  className="mt-auto inline-flex items-center justify-between gap-2 text-[18px] font-medium underline underline-offset-4 transition-all hover:gap-3"
                >
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
            <h2>
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
        <div className="container-page mt-10 flex justify-center">
          <LinkButton to="#event-list">이벤트 둘러보기</LinkButton>
        </div>
      </section>
    </Layout>
  );
}
