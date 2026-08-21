import { Link } from 'react-router-dom';
import FilterBar from '../../components/FilterBar';
import CouponCard from '../../components/CouponCard';
import { useFilter } from '../../hooks/useFilter';
import { COUPON_WALLET_STATUS } from '../../config/status';

const FILTER_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'usable', label: '사용 가능' },
  { value: 'used', label: '사용 완료' },
  { value: 'expired', label: '만료' },
];

const COUPONS = [
  {
    id: 1042,
    status: 'usable',
    badge: 'usable',
    label: 'ISSUE 1042',
    event: '반려동물 여름 케어 위크',
    title: '여름 정률 쿠폰',
    benefit: '20%',
    condition: '3만원 이상 구매 · 최대 1만원 할인',
    date: '2026-08-28T23:59',
    dateLabel: '8월 28일 23:59까지',
    cta: '상세 보기',
  },
  {
    id: 1038,
    status: 'usable',
    badge: 'soon',
    label: 'ISSUE 1038',
    event: '함께 걷는 계절',
    title: '산책용품 할인 쿠폰',
    benefit: '7,000원',
    condition: '2만원 이상 산책용품 구매',
    date: '2026-08-25T15:22',
    dateLabel: '8월 25일 15:22까지',
    cta: '상세 보기',
  },
  {
    id: 1029,
    status: 'used',
    badge: 'used',
    label: 'ISSUE 1029',
    event: '웰컴 펫데이',
    title: '웰컴 케어 쿠폰',
    benefit: '10%',
    condition: '3만원 이상 기본 케어 · 최대 8천원 할인',
    date: '2026-07-22T17:40',
    dateLabel: '7월 22일 사용',
    cta: '이력 보기',
  },
  {
    id: 1011,
    status: 'expired',
    badge: 'expired',
    label: 'ISSUE 1011',
    event: '웰컴 펫데이',
    title: '첫 구매 쿠폰',
    benefit: '5,000원',
    condition: '2만원 이상 첫 구매 전용',
    date: '2026-07-18T23:59',
    dateLabel: '7월 18일 만료',
    cta: '이력 보기',
  },
];

export default function MyCoupons() {
  const { value, setValue, filtered, count } = useFilter(COUPONS);

  return (
    <>
      <section className="page-hero" aria-labelledby="coupon-list-page-title">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">USER / MY COUPONS</p>
            <h1 id="coupon-list-page-title">
              내 쿠폰을
              <br />한곳에.
            </h1>
            <p className="hero-copy">김하늘 님이 받은 혜택의 상태와 사용 기한을 확인하세요.</p>
          </div>
          <div className="hero-stat">
            <span className="caption">AVAILABLE NOW</span>
            <strong>2</strong>
            <p>지금 사용할 수 있는 쿠폰</p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="coupon-note-title">
        <div className="container">
          <article className="color-block color-block--cream story-split">
            <div>
              <p className="eyebrow">EXPIRING SOON</p>
              <h2 id="coupon-note-title">
                산책용품 할인 쿠폰이
                <br />곧 만료돼요.
              </h2>
            </div>
            <div className="story-copy">
              <p>8월 25일 15:22까지 사용할 수 있어요. 가까운 제휴 매장에서 산책 준비물을 챙겨보세요.</p>
              <Link className="button button--primary" to="/user/coupon-detail?id=1038">
                쿠폰 확인하기
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="my-coupon-list-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">COUPON WALLET</p>
              <h2 id="my-coupon-list-title">보유 쿠폰</h2>
              <p>
                <span aria-live="polite">{count}개</span>의 쿠폰이 있어요.
              </p>
            </div>
            <FilterBar
              options={FILTER_OPTIONS}
              value={value}
              onChange={setValue}
              ariaLabel="보유 쿠폰 상태 필터"
              controlsId="my-coupon-grid"
            />
          </div>

          {filtered.length > 0 ? (
            <div id="my-coupon-grid" className="card-grid card-grid--two">
              {filtered.map((coupon) => (
                <CouponCard
                  key={coupon.id}
                  statusLabel={COUPON_WALLET_STATUS[coupon.badge].label}
                  statusClassName={COUPON_WALLET_STATUS[coupon.badge].className}
                  label={coupon.label}
                  event={coupon.event}
                  title={coupon.title}
                  benefit={coupon.benefit}
                  condition={coupon.condition}
                  date={coupon.date}
                  dateLabel={coupon.dateLabel}
                  href={`/user/coupon-detail?id=${coupon.id}`}
                  cta={coupon.cta}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state" role="status">
              <h3>해당 상태의 쿠폰이 없어요.</h3>
              <p>다른 상태를 선택하거나 새로운 이벤트를 둘러보세요.</p>
              <Link className="button button--secondary" to="/#event-list">
                이벤트 보기
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
