import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { ColorBlock, Eyebrow, ImageCrossfade, MetricGrid, MetricTile, PET_SHOWCASE_IMAGES_EVENT, StatusPill } from "../../components/ui";
import { useToast } from "../../context/ToastContext";
import { getEvent, type EventStatus } from "../../data/events";
import NotFound from "./NotFound";

const statusLabel: Record<EventStatus, string> = { open: "진행 중", scheduled: "오픈 예정", closed: "종료" };

export default function EventDetail() {
  const { id } = useParams();
  const event = getEvent(Number(id));
  const [selected, setSelected] = useState(event?.coupons[0]?.id ?? "");
  const { showToast } = useToast();

  if (!event) return <NotFound />;

  const isClosed = event.status === "closed";

  function handleIssue(formEvent: FormEvent) {
    formEvent.preventDefault();
    if (!event || isClosed) return;
    const coupon = event.coupons.find((c) => c.id === selected)!;
    showToast(`${coupon.name}이 내 쿠폰에 담겼습니다.`);
  }

  return (
    <Layout area="public" page="event-detail">
      <section className="py-10">
        <div className="container-page grid gap-10 md:grid-cols-[1.15fr_1fr] md:items-center">
          <div>
            <Link to="/" className="mb-7 inline-flex min-h-11 items-center gap-2 underline underline-offset-4">
              ← 이벤트 목록
            </Link>
            <Eyebrow>
              {event.label} / {statusLabel[event.status].toUpperCase()}
            </Eyebrow>
            <h1 className="mt-2">{event.title}</h1>
            <p className="mt-4 max-w-[56ch] text-ink/70">{event.detailDesc}</p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <a
                href="#coupon-choice"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-accent bg-accent px-5 text-[18px] font-medium text-ink hover:bg-[#c85319]"
              >
                쿠폰 고르기
              </a>
              <a href="#event-guide" className="inline-flex min-h-11 items-center gap-2 text-[18px] font-medium underline underline-offset-4 hover:underline-offset-[6px]">
                사용 안내
              </a>
            </div>
          </div>
          <div>
            <ImageCrossfade images={PET_SHOWCASE_IMAGES_EVENT} aspect="aspect-[4/3]" />
          </div>
        </div>
      </section>

      <section className="py-6">
        <div className="container-page">
          <ColorBlock tone="surface">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2>한눈에 보는 혜택</h2>
              </div>
              <StatusPill tone={event.status}>{statusLabel[event.status]}</StatusPill>
            </div>
            <div className="mt-6">
              <MetricGrid cols={4}>
                {event.metrics.map((metric) => (
                  <MetricTile key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
                ))}
              </MetricGrid>
            </div>
          </ColorBlock>
        </div>
      </section>

      <section id="coupon-choice" className="py-14">
        <div className="container-page max-w-2xl">
          <Eyebrow>CHOOSE YOUR COUPON</Eyebrow>
          <h2 className="mt-2">받을 혜택을 골라주세요.</h2>
          <p className="mt-2 text-ink/70">쿠폰별로 한 사람당 한 장만 받을 수 있어요.</p>

          <form onSubmit={handleIssue} className="mt-6 rounded-block border border-hairline p-6">
            <h3 className="mb-4 text-lg font-semibold">발급할 쿠폰</h3>
            <div className="grid gap-3">
              {event.coupons.map((coupon) => (
                <label
                  key={coupon.id}
                  className={`flex min-h-[76px] cursor-pointer items-center justify-between gap-4 rounded-control border p-4 transition-colors ${
                    selected === coupon.id ? "border-ink" : "border-hairline hover:border-ink/50"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="coupon"
                      value={coupon.id}
                      checked={selected === coupon.id}
                      onChange={() => setSelected(coupon.id)}
                      className="h-5 w-5 accent-ink"
                    />
                    <span>
                      <strong className="block">{coupon.name}</strong>
                      <span className="text-sm text-ink/60">{coupon.detail}</span>
                    </span>
                  </span>
                  <span className="text-2xl font-semibold">{coupon.value}</span>
                </label>
              ))}
            </div>

            <div className="mt-6 rounded-control border border-hairline bg-surface-2 p-4 text-sm">
              <strong className="block">발급 전 확인</strong>
              <p className="mt-1 text-ink/80">선택한 쿠폰은 사용자 계정에 바로 보관되며, 발급 후에는 다른 쿠폰으로 바꿀 수 없습니다.</p>
            </div>

            <button
              type="submit"
              disabled={isClosed}
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-ink bg-ink px-5 text-[18px] font-medium text-paper transition-all active:scale-[0.97] hover:bg-[#262626] disabled:cursor-not-allowed disabled:border-hairline disabled:bg-surface-2 disabled:text-ink-muted disabled:active:scale-100"
            >
              {isClosed ? "발급이 종료되었습니다" : "선택한 쿠폰 발급하기"}
            </button>
          </form>
        </div>
      </section>

      <section id="event-guide" className="py-14">
        <div className="container-page grid gap-8 md:grid-cols-[1fr_1.2fr]">
          <div>
            <h2>사용 안내</h2>
          </div>
          <ul className="grid gap-3 text-ink/80">
            {event.guide.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </Layout>
  );
}
