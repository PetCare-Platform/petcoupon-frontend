import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { BackLink, Eyebrow, FieldGroup, LinkButton, inputClass } from "../../components/ui";
import { useToast } from "../../context/ToastContext";
import { ApiError, NetworkError } from "../../api/http";
import { createEvent, getEventDetail, updateEvent } from "../../api/events";
import type { EventDetailResponse, EventStatus } from "../../types/api";

const STATUS_LABEL: Record<EventStatus, string> = { SCHEDULED: "오픈 예정", OPEN: "진행 중", CLOSED: "종료" };

/** LocalDateTime("yyyy-MM-ddTHH:mm:ss") <-> <input type=datetime-local> 값 변환 */
function toDateTimeLocal(iso: string): string {
  return iso.slice(0, 16);
}
function toLocalDateTime(value: string): string {
  return value.length === 16 ? `${value}:00` : value;
}

export default function EventForm() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const isEdit = Boolean(eventId);
  const { showToast } = useToast();

  const [loadingEvent, setLoadingEvent] = useState(isEdit);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [event, setEvent] = useState<EventDetailResponse | null>(null);

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [createdCouponLink, setCreatedCouponLink] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit) return;
    const controller = new AbortController();
    setLoadingEvent(true);
    getEventDetail(Number(eventId), controller.signal)
      .then((data) => {
        setEvent(data);
        setName(data.name);
        setDesc(data.description ?? "");
        setStart(toDateTimeLocal(data.openAt));
        setEnd(toDateTimeLocal(data.closeAt));
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setLoadError(err instanceof ApiError || err instanceof NetworkError ? err.message : "이벤트를 불러오지 못했습니다.");
      })
      .finally(() => setLoadingEvent(false));
    return () => controller.abort();
  }, [eventId, isEdit]);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "필수로 입력해야 하는 항목이에요.";
    if (!desc.trim()) next.desc = "필수로 입력해야 하는 항목이에요.";
    if (!start) next.start = "필수로 입력해야 하는 항목이에요.";
    if (!end) next.end = "필수로 입력해야 하는 항목이에요.";
    if (start && end && end <= start) next.end = "종료 시각은 시작 시각 이후여야 해요.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(formEvent: FormEvent) {
    formEvent.preventDefault();
    if (!validate() || submitting) {
      if (Object.keys(errors).length) showToast("입력 내용을 확인해 주세요.");
      return;
    }
    setSubmitting(true);
    try {
      if (isEdit && event) {
        const openAt = toLocalDateTime(start);
        const closeAt = toLocalDateTime(end);
        await updateEvent(event.eventId, { name, description: desc, openAt, closeAt });
        showToast("이벤트를 수정했습니다.");
        navigate("/admin/events");
      } else {
        const created = await createEvent({
          name,
          description: desc,
          openAt: toLocalDateTime(start),
          closeAt: toLocalDateTime(end),
        });
        showToast("이벤트를 만들었습니다. 이어서 쿠폰을 등록해 주세요.");
        setCreatedCouponLink(`/admin/coupon-form/${created.eventId}`);
      }
    } catch (err) {
      showToast(err instanceof ApiError || err instanceof NetworkError ? err.message : "저장하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  if (isEdit && loadingEvent) {
    return (
      <Layout area="admin" page="event-form">
        <section className="py-10">
          <div className="container-page">불러오는 중…</div>
        </section>
      </Layout>
    );
  }

  if (isEdit && loadError) {
    return (
      <Layout area="admin" page="event-form">
        <section className="py-10">
          <div className="container-page">
            <BackLink to="/admin/events">이벤트 목록</BackLink>
            <p className="text-danger">{loadError}</p>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout area="admin" page="event-form">
      <section className="py-10">
        <div className="container-page">
          <BackLink to="/admin/events">이벤트 목록</BackLink>
          <Eyebrow>관리자 · {isEdit ? "이벤트 수정" : "이벤트 등록"}</Eyebrow>
          <h1 className="mt-2">{isEdit ? event?.name ?? "이벤트 수정" : "이벤트 만들기"}</h1>
          {isEdit && event ? (
            <p className="mt-2 text-[15px] text-ink/60">현재 상태: {STATUS_LABEL[event.status]}</p>
          ) : (
            <p className="mt-2 text-[18px] text-ink/70">고객에게 보여줄 이름과 설명, 정확한 공개 일정을 입력하세요.</p>
          )}
        </div>
      </section>

      {createdCouponLink ? (
        <section className="py-6">
          <div className="container-page">
            <div className="rounded-block border border-accent/30 bg-accent/[0.07] p-6 text-ink md:p-8">
              <strong className="block">이벤트가 만들어졌습니다.</strong>
              <p className="mt-1 text-ink/80">이 이벤트에 연결할 쿠폰을 바로 만들 수 있어요.</p>
              <div className="mt-4 flex gap-3">
                <LinkButton to={createdCouponLink}>쿠폰 만들기</LinkButton>
                <LinkButton to="/admin/events" variant="secondary">이벤트 목록으로</LinkButton>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="py-10">
          <div className="container-page max-w-2xl">
            <h2>이벤트 정보</h2>
            <p className="mt-1 text-sm text-ink/60">* 필수 입력</p>

            <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-6 rounded-block border border-hairline p-6">
              <h3 className="text-lg font-semibold">기본 정보</h3>
              <FieldGroup label="이벤트 이름 *" htmlFor="event-name" error={errors.name} help="목록과 상세 화면에 함께 표시됩니다.">
                <input id="event-name" className={inputClass} placeholder="가을 입맛 찾기" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} maxLength={100} />
              </FieldGroup>
              <FieldGroup label="이벤트 설명 *" htmlFor="event-desc" error={errors.desc}>
                <textarea id="event-desc" rows={3} className={inputClass} placeholder="환절기 반려동물의 입맛을 위한 사료와 영양 간식 할인 이벤트입니다." value={desc} onChange={(e) => setDesc(e.target.value)} aria-invalid={!!errors.desc} maxLength={500} />
              </FieldGroup>

              <h3 className="text-lg font-semibold">공개 일정</h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <FieldGroup label="시작 일시 *" htmlFor="event-start" error={errors.start}>
                  <input id="event-start" type="datetime-local" className={inputClass} value={start} onChange={(e) => setStart(e.target.value)} aria-invalid={!!errors.start} />
                </FieldGroup>
                <FieldGroup label="종료 일시 *" htmlFor="event-end" error={errors.end}>
                  <input id="event-end" type="datetime-local" className={inputClass} value={end} onChange={(e) => setEnd(e.target.value)} aria-invalid={!!errors.end} />
                </FieldGroup>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-ink bg-ink px-5 text-[18px] font-medium text-paper transition-all active:scale-[0.97] hover:bg-[#262626] disabled:cursor-wait disabled:opacity-70"
                >
                  {submitting ? <span className="h-4 w-4 flex-none animate-spin rounded-full border-2 border-paper/30 border-t-paper" aria-hidden="true" /> : null}
                  {submitting ? "저장하는 중" : isEdit ? "변경사항 저장" : "이벤트 저장"}
                </button>
                <LinkButton to="/admin/events" variant="secondary">취소</LinkButton>
              </div>
            </form>
          </div>
        </section>
      )}
    </Layout>
  );
}
