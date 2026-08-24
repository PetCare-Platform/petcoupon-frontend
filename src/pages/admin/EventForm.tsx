import { useState, type FormEvent } from "react";
import { Layout } from "../../components/Layout";
import { BackLink, Eyebrow, FieldGroup, LinkButton, inputClass } from "../../components/ui";
import { useToast } from "../../context/ToastContext";

export default function EventForm() {
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "필수로 입력해야 하는 항목이에요.";
    if (!desc.trim()) next.desc = "필수로 입력해야 하는 항목이에요.";
    if (!start) next.start = "필수로 입력해야 하는 항목이에요.";
    if (!end) next.end = "필수로 입력해야 하는 항목이에요.";
    if (start && end && end < start) next.end = "종료일은 시작일 이후여야 해요.";
    setErrors(next);
    if (Object.keys(next).length) {
      showToast("입력 내용을 확인해 주세요.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showToast("이벤트를 저장했습니다.");
    }, 500);
  }

  return (
    <Layout area="admin" page="event-form">
      <section className="py-10">
        <div className="container-page">
          <BackLink to="/admin/events">이벤트 목록</BackLink>
          <Eyebrow>관리자 · 이벤트 등록</Eyebrow>
          <h1 className="mt-2">이벤트 만들기</h1>
          <p className="mt-2 text-[18px] text-ink/70">고객에게 보여줄 이름과 설명, 정확한 공개 일정을 입력하세요.</p>
        </div>
      </section>

      <section className="py-6">
        <div className="container-page">
          <div className="rounded-block border border-hairline bg-surface-2 p-6 text-ink md:p-8">
            <span className="text-xs font-semibold uppercase tracking-wide">작성 체크리스트</span>
            <h2 className="mt-1">좋은 이벤트는 일정부터 명확해요.</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>고객이 혜택을 바로 이해하는 이름을 사용하세요.</li>
              <li>공개 시작·종료 시각을 정확히 맞추세요.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-page max-w-2xl">
          <h2>이벤트 정보</h2>
          <p className="mt-1 text-sm text-ink/60">* 필수 입력</p>

          <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-6 rounded-block border border-hairline p-6">
            <h3 className="text-lg font-semibold">기본 정보</h3>
            <FieldGroup label="이벤트 이름 *" htmlFor="event-name" error={errors.name} help="목록과 상세 화면에 함께 표시됩니다.">
              <input id="event-name" className={inputClass} placeholder="가을 입맛 찾기" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} />
            </FieldGroup>
            <FieldGroup label="이벤트 설명 *" htmlFor="event-desc" error={errors.desc}>
              <textarea id="event-desc" rows={3} className={inputClass} placeholder="환절기 반려동물의 입맛을 위한 사료와 영양 간식 할인 이벤트입니다." value={desc} onChange={(e) => setDesc(e.target.value)} aria-invalid={!!errors.desc} />
            </FieldGroup>

            <h3 className="text-lg font-semibold">공개 일정</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <FieldGroup label="시작일 *" htmlFor="event-start" error={errors.start}>
                <input id="event-start" type="date" className={inputClass} value={start} onChange={(e) => setStart(e.target.value)} aria-invalid={!!errors.start} />
              </FieldGroup>
              <FieldGroup label="종료일 *" htmlFor="event-end" error={errors.end}>
                <input id="event-end" type="date" className={inputClass} value={end} onChange={(e) => setEnd(e.target.value)} aria-invalid={!!errors.end} />
              </FieldGroup>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-ink bg-ink px-5 text-[18px] font-medium text-paper transition-all active:scale-[0.97] hover:bg-[#262626] disabled:cursor-wait disabled:opacity-70"
              >
                {submitting ? <span className="h-4 w-4 flex-none animate-spin rounded-full border-2 border-paper/30 border-t-paper" aria-hidden="true" /> : null}
                {submitting ? "저장하는 중" : "이벤트 저장"}
              </button>
              <LinkButton to="/admin/events" variant="secondary">취소</LinkButton>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
}
