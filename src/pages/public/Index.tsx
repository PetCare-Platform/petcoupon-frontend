import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, PawPrint } from "@phosphor-icons/react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Layout } from "../../components/Layout";
import { PetVisual } from "../../components/PetVisual";
import { LinkButton } from "../../components/ui";
import { getPublicEvents } from "../../api/events";
import { ApiError, NetworkError } from "../../api/http";
import { formatDateTime } from "../../lib/date";
import type { EventListResponse } from "../../types/api";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const toneClass = ["bg-[#dff7ef]", "bg-[#fff0ed]", "bg-[#e5f4ff]", "bg-[#fff7cf]"];

type LoadState =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "ready"; events: EventListResponse[] };

export default function Index() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<LoadState>({ phase: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    setState({ phase: "loading" });
    getPublicEvents(controller.signal)
      .then((events) => setState({ phase: "ready", events }))
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setState({
          phase: "error",
          message: err instanceof ApiError || err instanceof NetworkError ? err.message : "이벤트 목록을 불러오지 못했습니다.",
        });
      });
    return () => controller.abort();
  }, []);

  const events = state.phase === "ready" ? state.events : [];

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo("[data-pet-visual]", { scale: 0.86, opacity: 0.45, rotate: 2 }, { scale: 1, opacity: 1, rotate: 0, duration: 1.1, ease: "power3.out" });
      gsap.utils.toArray<HTMLElement>("[data-event-card]").forEach((card) => {
        gsap.fromTo(card, { y: 48, opacity: 0.35 }, { y: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: card, start: "top 92%", end: "top 58%", scrub: true } });
      });
    },
    { scope: rootRef, dependencies: [events.length] },
  );

  return (
    <Layout area="public" page="index">
      <div ref={rootRef}>
        <section className="pb-24 pt-12 md:pb-36 md:pt-20">
          <div className="container-page grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="relative z-10">
              <p className="mb-5 flex items-center gap-2 text-sm font-bold text-accent-ink"><PawPrint weight="fill" className="h-5 w-5" aria-hidden="true" />반려생활을 더 가볍게</p>
              <h1 className="w-full max-w-6xl text-balance text-[clamp(3rem,6vw,6.5rem)] leading-[0.98]">우리 아이가 좋아할 혜택만 모았어요.</h1>
              <p className="mt-7 max-w-2xl text-[19px] leading-relaxed text-ink-muted md:text-[21px]">미용부터 건강검진, 산책용품까지. 진행 중인 이벤트에서 필요한 쿠폰을 골라 바로 받아보세요.</p>
              <div className="mt-9 flex flex-wrap gap-3"><LinkButton to="#event-list">이벤트 둘러보기</LinkButton><LinkButton to="/user/my-coupons" variant="secondary">내 쿠폰 보기</LinkButton></div>
            </div>
            <div data-pet-visual className="relative"><PetVisual /><div className="absolute -bottom-5 left-6 rounded-[1.4rem] border border-white bg-white px-5 py-4 shadow-[0_18px_40px_-24px_rgba(23,36,58,0.45)]"><strong className="block text-lg">오늘도 함께라서 좋아요</strong><span className="text-sm text-ink-muted">산책 · 건강 · 미용 혜택</span></div></div>
          </div>
        </section>

        <section id="event-list" className="py-20 md:py-24">
          <div className="container-page">
            <div className="mb-10">
              <p className="mb-3 text-sm font-bold text-accent-ink">지금 받을 수 있는 혜택</p>
              <h2 className="max-w-4xl text-balance">진행 중인 이벤트를 골라보세요.</h2>
              <p className="mt-3 text-[17px] text-ink-muted">
                {state.phase === "ready" ? <span aria-live="polite">{events.length}개의 진행 중인 이벤트</span> : "이벤트를 불러오는 중이에요."}
              </p>
            </div>

            {state.phase === "loading" ? (
              <div className="grid gap-3 md:grid-cols-2">
                {[0, 1].map((i) => (
                  <div key={i} className="h-[250px] animate-pulse rounded-[2rem] border border-white/70 bg-white/60 md:h-[290px]" />
                ))}
              </div>
            ) : state.phase === "error" ? (
              <div className="rounded-[2rem] border border-dashed border-hairline bg-white p-12 text-center">
                <h3>{state.message}</h3>
                <p className="mt-2 text-ink-muted">잠시 후 다시 시도해 주세요.</p>
              </div>
            ) : events.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-hairline bg-white p-12 text-center">
                <h3>지금 진행 중인 이벤트가 없어요.</h3>
                <p className="mt-2 text-ink-muted">새로운 이벤트가 열리면 이곳에서 확인할 수 있어요.</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {events.map((event, index) => (
                  <article key={event.eventId} data-event-card className={`group min-h-[250px] overflow-hidden rounded-[2rem] border border-white/70 p-5 shadow-[0_24px_60px_-42px_rgba(23,36,58,0.38)] md:h-[290px] ${toneClass[index % 4]}`}>
                    <div className="flex h-full flex-col">
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex min-h-8 items-center rounded-full bg-accent px-3 text-xs font-bold">진행 중</span>
                        <span className="text-sm font-semibold text-ink-muted">{formatDateTime(event.openAt)} ~ {formatDateTime(event.closeAt)}</span>
                      </div>
                      <div className="mt-auto pt-7">
                        <h3 className="max-w-2xl text-[clamp(1.75rem,3vw,3.4rem)] font-bold leading-tight tracking-[-0.035em]">{event.name}</h3>
                        {event.description ? <p className="mt-3 max-w-xl text-[17px] text-ink-muted">{event.description}</p> : null}
                        <div className="mt-5 flex items-end justify-end">
                          <Link to={`/event-detail/${event.eventId}`} className="inline-flex min-h-12 items-center gap-2 rounded-full bg-ink px-5 font-semibold text-white transition-transform duration-300 hover:-translate-y-1">
                            이벤트 보기
                            <ArrowRight weight="bold" aria-hidden="true" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="pb-24 md:pb-36"><div className="container-page"><div className="rounded-[2.5rem] bg-ink px-6 py-16 text-white md:px-14 md:py-20"><div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-end"><div><p className="text-sm font-bold text-accent">쿠폰 사용은 간단하게</p><h2 className="mt-3 max-w-xl text-balance">받고, 모아두고, 필요할 때 바로 쓰세요.</h2></div><ol className="grid gap-3 sm:grid-cols-3">{["이벤트에서 고르기", "내 쿠폰함에 보관", "필요할 때 사용"].map((label, index) => <li key={label} className="rounded-[1.5rem] bg-white/10 p-5"><span className="text-sm text-accent">0{index + 1}</span><strong className="mt-8 block text-lg">{label}</strong></li>)}</ol></div><LinkButton to="/user/my-coupons" className="mt-10 bg-white text-ink hover:bg-accent">내 쿠폰 확인하기</LinkButton></div></div></section>
      </div>
    </Layout>
  );
}
