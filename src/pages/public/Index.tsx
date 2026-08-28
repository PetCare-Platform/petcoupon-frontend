import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "@phosphor-icons/react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Layout } from "../../components/Layout";
import { getPublicEvents } from "../../api/events";
import { ApiError, NetworkError } from "../../api/http";
import { formatDateTime } from "../../lib/date";
import type { EventListResponse } from "../../types/api";

gsap.registerPlugin(useGSAP);

type LoadState =
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "ready"; events: EventListResponse[] };

// 목록은 첫 화면 안에서 끝나야 한다 — 1024px 이상은 한 줄, 그 아래는 두 줄로 깔고
// 스크롤을 유발하는 히어로·하단 배너는 두지 않는다.
const gridClass = "grid gap-4 sm:grid-cols-2 lg:grid-cols-4";

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

  // 스크롤 연동(ScrollTrigger)은 접힘선 아래를 전제하는데 이제 목록이 전부 첫
  // 화면에 있다. 진입 시 한 번 스태거로 올려주는 것으로 바꾼다.
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        "[data-event-card]",
        { y: 16, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.45, stagger: 0.06, ease: "power2.out" },
      );
    },
    { scope: rootRef, dependencies: [events.length] },
  );

  return (
    <Layout area="public" page="index">
      <div ref={rootRef}>
        <section id="event-list" className="py-8 md:py-10">
          <div className="container-page">
            <div className="mb-6">
              <p className="mb-1.5 text-[13px] font-medium text-accent-ink">지금 받을 수 있는 혜택</p>
              <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] md:text-[32px]">
                진행 중인 이벤트를 골라보세요.
              </h1>
              <p className="mt-1.5 text-[15px] text-ink-muted">
                {state.phase === "ready" ? (
                  <span aria-live="polite">{events.length}개의 진행 중인 이벤트</span>
                ) : (
                  "이벤트를 불러오는 중이에요."
                )}
              </p>
            </div>

            {state.phase === "loading" ? (
              <div className={gridClass}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-[190px] animate-pulse rounded-[1.25rem] border border-accent/40 bg-paper/60" />
                ))}
              </div>
            ) : state.phase === "error" ? (
              <div className="rounded-[1.25rem] border border-dashed border-hairline bg-white p-8 text-center">
                <h2 className="text-[19px] font-semibold">{state.message}</h2>
                <p className="mt-1.5 text-[15px] text-ink-muted">잠시 후 다시 시도해 주세요.</p>
              </div>
            ) : events.length === 0 ? (
              <div className="rounded-[1.25rem] border border-dashed border-hairline bg-white p-8 text-center">
                <h2 className="text-[19px] font-semibold">지금 진행 중인 이벤트가 없어요.</h2>
                <p className="mt-1.5 text-[15px] text-ink-muted">새로운 이벤트가 열리면 이곳에서 확인할 수 있어요.</p>
              </div>
            ) : (
              <div className={gridClass}>
                {events.map((event) => (
                  // 카드 전체가 링크다 — 하단 "이벤트 보기" 버튼 줄이 빠지면서
                  // 카드 높이가 290px에서 190px로 내려간다.
                  <Link
                    key={event.eventId}
                    to={`/event-detail/${event.eventId}`}
                    data-event-card
                    className="group flex min-h-[190px] flex-col rounded-[1.25rem] border border-accent bg-paper p-4 shadow-[0_12px_30px_-24px_rgba(23,36,58,0.35)] transition-all duration-200 ease-fluid hover:-translate-y-0.5 hover:border-accent-ink"
                  >
                    <span className="inline-flex min-h-6 w-fit items-center rounded-full bg-accent/25 px-2.5 text-[12px] font-medium text-accent-ink">
                      진행 중
                    </span>
                    <h2 className="mt-3 text-[19px] font-semibold leading-snug tracking-[-0.015em]">{event.name}</h2>
                    {event.description ? (
                      <p className="mt-1.5 line-clamp-2 text-[14px] leading-relaxed text-ink-muted">{event.description}</p>
                    ) : null}
                    <div className="mt-auto pt-3">
                      <p className="text-[12px] text-ink-muted">
                        {formatDateTime(event.openAt)} ~ {formatDateTime(event.closeAt)}
                      </p>
                      <span className="mt-1.5 inline-flex items-center gap-1 text-[14px] font-medium">
                        이벤트 보기
                        <ArrowRight weight="bold" className="h-[0.85em] w-[0.85em] transition-transform duration-200 ease-fluid group-hover:translate-x-0.5" aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
}
