import { useEffect, useMemo, useState } from "react";
import { Layout } from "../../components/Layout";
import { Eyebrow, FilterBar, LinkButton } from "../../components/ui";
import { getAllEvents } from "../../api/events";
import { ApiError, NetworkError } from "../../api/http";
import { formatDateTime } from "../../lib/date";
import type { EventListResponse, EventStatus } from "../../types/api";

const statusLabel: Record<EventStatus, string> = { OPEN: "진행 중", SCHEDULED: "예정", CLOSED: "종료" };
const statusClass: Record<EventStatus, string> = {
  OPEN: "bg-success/10 text-accent-ink",
  SCHEDULED: "bg-surface-2 text-ink-muted",
  CLOSED: "bg-hairline-soft text-ink-muted",
};

// GET /admin/events는 상태 필터가 없다 — 최대 페이지 크기(100)로 사실상 전체를 한 번에
// 가져와 클라이언트에서 상태별로 나눈다. 100건을 넘는 경우에만 안내를 보여준다.
const PAGE_SIZE = 100;

export default function Events() {
  const [filter, setFilter] = useState<"all" | EventStatus>("all");
  const [events, setEvents] = useState<EventListResponse[] | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    getAllEvents(0, PAGE_SIZE, controller.signal)
      .then((result) => {
        setEvents(result.content);
        setTotalElements(result.totalElements);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setLoadError(err instanceof ApiError || err instanceof NetworkError ? err.message : "이벤트 목록을 불러오지 못했습니다.");
      });
    return () => controller.abort();
  }, []);

  const visible = useMemo(
    () => (events ?? []).filter((event) => filter === "all" || event.status === filter),
    [events, filter],
  );
  const countOf = (status: EventStatus) => (events ?? []).filter((e) => e.status === status).length;
  const hasMore = totalElements > (events ?? []).length;

  return (
    <Layout area="admin" page="events">
      <section className="py-10">
        <div className="container-page flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow>관리자 · 이벤트</Eyebrow>
            <h1 className="mt-2">이벤트 목록</h1>
            <p className="mt-2 text-[18px] text-ink/70">
              GET /admin/events로 조회한 실제 이벤트입니다. 생성과 개별 수정도 실제 API에 연결됩니다.
            </p>
          </div>
          <LinkButton to="/admin/event-form">새 이벤트</LinkButton>
        </div>
      </section>

      <section className="py-10">
        <div className="container-page">
          {loadError ? (
            <div className="rounded-block border border-dashed border-hairline p-10 text-center">
              <h3 className="text-xl font-semibold">{loadError}</h3>
              <p className="mt-2 text-ink/70">관리자 세션이 필요할 수 있습니다.</p>
            </div>
          ) : events === null ? (
            <div className="grid gap-2.5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-control border border-hairline bg-surface-2" />
              ))}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2>등록 이벤트</h2>
                  <p className="mt-1 text-[17px] text-ink/70">
                    {visible.length}개의 이벤트
                    {hasMore ? ` · 전체 ${totalElements}건 중 ${events.length}건만 표시` : ""}
                  </p>
                </div>
                <FilterBar
                  value={filter}
                  onChange={setFilter}
                  options={[
                    { value: "all", label: `전체 ${events.length}` },
                    { value: "OPEN", label: `진행 중 ${countOf("OPEN")}` },
                    { value: "SCHEDULED", label: `예정 ${countOf("SCHEDULED")}` },
                    { value: "CLOSED", label: `종료 ${countOf("CLOSED")}` },
                  ]}
                />
              </div>

              <div className="mt-6 grid gap-2.5">
                {visible.map((event) => (
                  <article key={event.eventId} className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-hairline p-3.5">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs text-ink/50">이벤트 {event.eventId}</span>
                        <span className={`inline-flex min-h-6 items-center rounded-full px-2 text-[11px] font-semibold uppercase tracking-wide ${statusClass[event.status]}`}>
                          {statusLabel[event.status]}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold">{event.name}</h3>
                      <p className="mt-0.5 text-sm text-ink/60">
                        {formatDateTime(event.openAt)} - {formatDateTime(event.closeAt)}
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm font-medium">
                      <LinkButton to={`/admin/event-form/${event.eventId}`} variant="text" className="!text-[16px]">
                        수정
                      </LinkButton>
                    </div>
                  </article>
                ))}
                {visible.length === 0 ? (
                  <div className="rounded-block border border-dashed border-hairline p-10 text-center">
                    <h3 className="text-xl font-semibold">해당 상태의 이벤트가 없어요.</h3>
                    <p className="mt-2 text-ink/70">다른 상태를 선택해 보세요.</p>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
