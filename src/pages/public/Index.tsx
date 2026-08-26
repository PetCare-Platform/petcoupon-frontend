import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Cat, Dog, FirstAid, PawPrint, Scissors, ShoppingBagOpen } from "@phosphor-icons/react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Layout } from "../../components/Layout";
import { PetVisual } from "../../components/PetVisual";
import { FilterBar, LinkButton } from "../../components/ui";
import { EVENTS, type EventStatus } from "../../data/events";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const statusLabel: Record<EventStatus, string> = { open: "진행 중", scheduled: "오픈 예정", closed: "종료" };
const statusClass: Record<EventStatus, string> = { open: "bg-accent", scheduled: "bg-sky", closed: "bg-white/80 text-ink-muted" };
const spanClass = ["md:col-span-8", "md:col-span-4", "md:col-span-4", "md:col-span-8"];
const toneClass = ["bg-[#dff7ef]", "bg-[#fff0ed]", "bg-[#e5f4ff]", "bg-[#fff7cf]"];

export default function Index() {
  const [filter, setFilter] = useState<"all" | EventStatus>("all");
  const rootRef = useRef<HTMLDivElement>(null);
  const visible = useMemo(() => (filter === "all" ? EVENTS : EVENTS.filter((event) => event.status === filter)), [filter]);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo("[data-pet-visual]", { scale: 0.86, opacity: 0.45, rotate: 2 }, { scale: 1, opacity: 1, rotate: 0, duration: 1.1, ease: "power3.out" });
    gsap.utils.toArray<HTMLElement>("[data-event-card]").forEach((card) => {
      gsap.fromTo(card, { y: 48, opacity: 0.35 }, { y: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: card, start: "top 92%", end: "top 58%", scrub: true } });
    });
  }, { scope: rootRef });

  return (
    <Layout area="public" page="index">
      <div ref={rootRef}>
        <section className="pb-24 pt-12 md:pb-36 md:pt-20">
          <div className="container-page grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="relative z-10">
              <p className="mb-5 flex items-center gap-2 text-sm font-bold text-accent-ink"><PawPrint weight="fill" className="h-5 w-5" aria-hidden="true" />반려생활을 더 가볍게</p>
              <h1 className="w-full max-w-6xl text-balance text-[clamp(3rem,6vw,6.5rem)] leading-[0.98]">우리 아이가 좋아할 혜택만 모았어요.</h1>
              <p className="mt-7 max-w-2xl text-[19px] leading-relaxed text-ink-muted md:text-[21px]">미용부터 건강검진, 산책용품까지. 필요한 순간 바로 꺼내 쓰는 반려생활 쿠폰을 만나보세요.</p>
              <div className="mt-9 flex flex-wrap gap-3"><LinkButton to="#event-list">이벤트 둘러보기</LinkButton><LinkButton to="/user/my-coupons" variant="secondary">내 쿠폰 보기</LinkButton></div>
            </div>
            <div data-pet-visual className="relative"><PetVisual /><div className="absolute -bottom-5 left-6 rounded-[1.4rem] border border-white bg-white px-5 py-4 shadow-[0_18px_40px_-24px_rgba(23,36,58,0.45)]"><strong className="block text-lg">오늘도 함께라서 좋아요</strong><span className="text-sm text-ink-muted">산책 · 건강 · 미용 혜택</span></div></div>
          </div>
        </section>

        <section className="overflow-hidden border-y border-hairline bg-white/70 py-5" aria-label="PetCoupon 혜택 분야">
          <div className="flex min-w-max animate-[marquee_24s_linear_infinite] items-center gap-10 px-6 text-lg font-bold text-ink-muted motion-reduce:animate-none">
            {[Dog, Scissors, Cat, FirstAid, PawPrint, ShoppingBagOpen, Dog, Scissors, Cat, FirstAid, PawPrint, ShoppingBagOpen].map((Icon, index) => <span key={index} className="flex items-center gap-2"><Icon weight="fill" className="h-6 w-6 text-accent-ink" aria-hidden="true" />{["산책", "미용", "고양이 케어", "건강검진", "반려생활", "용품 할인"][index % 6]}</span>)}
          </div>
        </section>

        <section id="event-list" className="py-24 md:py-36">
          <div className="container-page">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-6"><div><p className="mb-3 text-sm font-bold text-accent-ink">지금 받을 수 있는 혜택</p><h2 className="max-w-4xl text-balance">필요한 쿠폰을 골라보세요.</h2><p className="mt-3 text-[17px] text-ink-muted"><span aria-live="polite">{visible.length}개</span>의 이벤트를 보여드려요.</p></div><FilterBar value={filter} onChange={setFilter} options={[{ value: "all", label: `전체 ${EVENTS.length}` }, { value: "open", label: `진행 중 ${EVENTS.filter((event) => event.status === "open").length}` }, { value: "scheduled", label: `오픈 예정 ${EVENTS.filter((event) => event.status === "scheduled").length}` }, { value: "closed", label: `종료 ${EVENTS.filter((event) => event.status === "closed").length}` }]} /></div>
            <div className="grid grid-flow-dense gap-4 md:grid-cols-12">
              {visible.map((event, index) => <article key={event.id} data-event-card className={`group min-h-[310px] overflow-hidden rounded-[2rem] border border-white/70 p-6 shadow-[0_24px_60px_-42px_rgba(23,36,58,0.38)] ${spanClass[index % 4]} ${toneClass[index % 4]}`}><div className="flex h-full flex-col"><div className="flex items-center justify-between gap-3"><span className={`inline-flex min-h-8 items-center rounded-full px-3 text-xs font-bold ${statusClass[event.status]}`}>{statusLabel[event.status]}</span><span className="text-sm font-semibold text-ink-muted">{event.period}</span></div><div className="mt-auto pt-16"><h3 className="max-w-2xl text-[clamp(1.75rem,3vw,3.4rem)] font-bold leading-tight tracking-[-0.035em]">{event.title}</h3><p className="mt-3 max-w-xl text-[17px] text-ink-muted">{event.desc}</p><div className="mt-6 flex items-end justify-between gap-4"><strong className="text-2xl">{event.benefit}</strong><Link to={`/event-detail/${event.id}`} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-5 font-semibold text-white transition-transform duration-300 hover:-translate-y-1">{event.cta}<ArrowRight weight="bold" aria-hidden="true" /></Link></div></div></div></article>)}
              {visible.length === 0 ? <div className="col-span-full rounded-[2rem] border border-dashed border-hairline bg-white p-12 text-center"><h3>조건에 맞는 이벤트가 없어요.</h3><p className="mt-2 text-ink-muted">다른 상태를 선택해 보세요.</p></div> : null}
            </div>
          </div>
        </section>

        <section className="pb-24 md:pb-36"><div className="container-page"><div className="rounded-[2.5rem] bg-ink px-6 py-16 text-white md:px-14 md:py-20"><div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-end"><div><p className="text-sm font-bold text-accent">쿠폰 사용은 간단하게</p><h2 className="mt-3 max-w-xl text-balance">받고, 모아두고, 필요할 때 바로 쓰세요.</h2></div><ol className="grid gap-3 sm:grid-cols-3">{["이벤트에서 고르기", "내 쿠폰함에 보관", "필요할 때 사용"].map((label, index) => <li key={label} className="rounded-[1.5rem] bg-white/10 p-5"><span className="text-sm text-accent">0{index + 1}</span><strong className="mt-8 block text-lg">{label}</strong></li>)}</ol></div><LinkButton to="/user/my-coupons" className="mt-10 bg-white text-ink hover:bg-accent">내 쿠폰 확인하기</LinkButton></div></div></section>
      </div>
    </Layout>
  );
}
