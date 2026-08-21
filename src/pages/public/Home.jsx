import { Link } from 'react-router-dom';
import FilterBar from '../../components/FilterBar';
import EventCard from '../../components/EventCard';
import { useFilter } from '../../hooks/useFilter';
import { EVENT_STATUS } from '../../config/status';

const FILTER_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'open', label: '진행 중' },
  { value: 'scheduled', label: '오픈 예정' },
  { value: 'closed', label: '종료' },
];

const EVENTS = [
  {
    id: 1,
    status: 'open',
    label: 'EVENT 01',
    title: '반려동물 여름 케어 위크',
    description: '목욕과 미용을 함께 챙기는 계절 한정 혜택',
    period: '8.20 — 8.30',
    benefit: '최대 20%',
    cta: '이벤트 보기',
  },
  {
    id: 2,
    status: 'scheduled',
    label: 'EVENT 02',
    title: '건강검진 데이',
    description: '기본 검진 패키지를 부담 없이 시작하는 주간',
    period: '8.24 — 9.07',
    benefit: '15%',
    cta: '이벤트 보기',
  },
  {
    id: 3,
    status: 'open',
    label: 'EVENT 03',
    title: '함께 걷는 계절',
    description: '산책용품과 야외 활동을 위한 정액 할인',
    period: '8.15 — 8.25',
    benefit: '7,000원',
    cta: '이벤트 보기',
  },
  {
    id: 5,
    status: 'closed',
    label: 'EVENT 05',
    title: '웰컴 펫데이',
    description: '첫 구매 고객을 위한 반가운 시작 쿠폰',
    period: '7.01 — 7.31',
    benefit: '5,000원',
    cta: '지난 이벤트 보기',
  },
];

export default function Home() {
  const { value, setValue, filtered, count } = useFilter(EVENTS);

  return (
    <>
      <section className="page-hero" aria-labelledby="home-title">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">PUBLIC / PET BENEFITS</p>
            <h1 id="home-title">
              좋은 돌봄을
              <br />더 가볍게.
            </h1>
            <p className="hero-copy">
              미용부터 건강검진, 산책용품까지. 지금 참여할 수 있는 반려생활 혜택을 골라 쿠폰으로 간직하세요.
            </p>
            <div className="hero-actions">
              <a className="button button--primary" href="#event-list">
                이벤트 둘러보기
              </a>
              <Link className="button button--secondary" to="/user/my-coupons">
                내 쿠폰 보기
              </Link>
            </div>
          </div>
          <aside className="hero-note" aria-label="오늘의 안내">
            <span className="caption">TODAY'S NOTE</span>
            <strong>반려동물 여름 케어 위크</strong>
            <p>목욕·미용 서비스에 사용할 수 있는 시즌 쿠폰이 열려 있어요.</p>
          </aside>
        </div>
      </section>

      <section className="section" aria-labelledby="featured-title">
        <div className="container">
          <article className="color-block color-block--lime story-split">
            <div>
              <p className="eyebrow">FEATURED / OPEN NOW</p>
              <h2 id="featured-title">
                이번 여름,
                <br />
                보송한 하루를 선물하세요.
              </h2>
            </div>
            <div className="story-copy">
              <p>반려동물 여름 케어 위크에서 미용·목욕 결제에 쓸 수 있는 최대 20% 할인 쿠폰을 만나보세요.</p>
              <dl className="inline-facts">
                <div>
                  <dt>발급 마감</dt>
                  <dd>8월 30일 23:59</dd>
                </div>
                <div>
                  <dt>남은 수량</dt>
                  <dd>284장</dd>
                </div>
              </dl>
              <Link className="button button--primary" to="/event-detail?id=1">
                혜택 자세히 보기
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section id="event-list" className="section" aria-labelledby="event-list-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">EVENT DIRECTORY</p>
              <h2 id="event-list-title">지금의 이벤트</h2>
              <p>
                <span aria-live="polite">{count}개</span>의 이벤트를 보여드려요.
              </p>
            </div>
            <FilterBar
              options={FILTER_OPTIONS}
              value={value}
              onChange={setValue}
              ariaLabel="이벤트 상태 필터"
              controlsId="event-grid"
            />
          </div>

          {filtered.length > 0 ? (
            <div id="event-grid" className="card-grid card-grid--two">
              {filtered.map((event) => (
                <EventCard
                  key={event.id}
                  statusLabel={EVENT_STATUS[event.status].publicLabel}
                  statusClassName={EVENT_STATUS[event.status].className}
                  label={event.label}
                  title={event.title}
                  description={event.description}
                  period={event.period}
                  benefit={event.benefit}
                  href={`/event-detail?id=${event.id}`}
                  cta={event.cta}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state" role="status">
              <h3>조건에 맞는 이벤트가 없어요.</h3>
              <p>다른 상태를 선택해 보세요.</p>
            </div>
          )}
        </div>
      </section>

      <section className="section" aria-labelledby="service-title">
        <div className="container editorial-row">
          <div>
            <p className="eyebrow">PETCOUPON SERVICE</p>
            <h2 id="service-title">
              받고, 보관하고,
              <br />
              필요할 때 사용하세요.
            </h2>
          </div>
          <ol className="numbered-list">
            <li>
              <strong>혜택 발견</strong>
              <span>공개 이벤트에서 필요한 쿠폰을 고릅니다.</span>
            </li>
            <li>
              <strong>내 쿠폰 보관</strong>
              <span>발급한 쿠폰의 코드와 기한을 확인합니다.</span>
            </li>
            <li>
              <strong>안전한 사용</strong>
              <span>상세 화면에서 사용 상태와 이력을 관리합니다.</span>
            </li>
          </ol>
        </div>
      </section>
    </>
  );
}
