import { Link } from 'react-router-dom';
import FilterBar from '../../components/FilterBar';
import DemoButton from '../../components/DemoButton';
import StatusBadge from '../../components/StatusBadge';
import RecordTable from '../../components/RecordTable';
import { useFilter } from '../../hooks/useFilter';
import { ADMIN_COUPON_STATUS } from '../../config/status';

const FILTER_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'issuing', label: '발급 중' },
  { value: 'ready', label: '발급 예정' },
  { value: 'ended', label: '종료' },
];

const COUPONS = [
  { id: 10, status: 'issuing', label: 'COUPON 10', title: '여름 정률 쿠폰', event: '여름 케어 위크', benefit: '20% · 최대 1만원', stock: '284 / 500' },
  { id: 11, status: 'issuing', label: 'COUPON 11', title: '산책용품 할인 쿠폰', event: '함께 걷는 계절', benefit: '7,000원', stock: '128 / 1,000' },
  { id: 12, status: 'ready', label: 'COUPON 12', title: '건강검진 할인 쿠폰', event: '건강검진 데이', benefit: '15% · 최대 1만5천원', stock: '300 / 300' },
  { id: 13, status: 'ready', label: 'COUPON 13', title: '가을 사료 할인 쿠폰', event: '가을 입맛 찾기', benefit: '10%', stock: '400 / 400' },
  { id: 9, status: 'ended', label: 'COUPON 09', title: '첫 구매 쿠폰', event: '웰컴 펫데이', benefit: '5,000원', stock: '0 / 500' },
];

function renderRow(coupon) {
  const status = ADMIN_COUPON_STATUS[coupon.status];
  return (
    <tr key={coupon.id}>
      <td>
        <strong>{coupon.title}</strong>
        <small>{coupon.label}</small>
      </td>
      <td>{coupon.event}</td>
      <td>{coupon.benefit}</td>
      <td>{coupon.stock}</td>
      <td>
        <StatusBadge className={status.className}>{status.label}</StatusBadge>
      </td>
      <td>
        <div className="table-actions">
          <Link className="table-link" to={`/admin/coupon-form?id=${coupon.id}`}>
            수정
          </Link>
          <DemoButton message={`${coupon.title} 삭제 확인을 열었습니다.`} ariaLabel={`${coupon.title} 삭제`}>
            삭제
          </DemoButton>
        </div>
      </td>
    </tr>
  );
}

function renderCard(coupon) {
  const status = ADMIN_COUPON_STATUS[coupon.status];
  return (
    <article className="hairline-card" key={coupon.id}>
      <div className="card-topline">
        <span className="caption">{coupon.label}</span>
        <StatusBadge className={status.className}>{status.label}</StatusBadge>
      </div>
      <h3>{coupon.title}</h3>
      <p>
        {coupon.event} · {coupon.benefit} · 재고 {coupon.stock}
      </p>
      <div className="card-actions">
        <Link to={`/admin/coupon-form?id=${coupon.id}`}>수정</Link>
        <DemoButton message={`${coupon.title} 삭제 확인을 열었습니다.`} ariaLabel={`${coupon.title} 삭제`}>
          삭제
        </DemoButton>
      </div>
    </article>
  );
}

export default function AdminCoupons() {
  const { value, setValue, filtered, count } = useFilter(COUPONS);

  return (
    <>
      <section className="page-hero" aria-labelledby="admin-coupons-title">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">ADMIN / COUPONS</p>
            <h1 id="admin-coupons-title">쿠폰 목록</h1>
            <p className="hero-copy">할인 조건과 발급 기간, 남은 재고를 빠르게 확인하세요.</p>
          </div>
          <div className="hero-actions">
            <Link className="button button--primary" to="/admin/coupon-form">
              새 쿠폰
            </Link>
            <Link className="button button--secondary" to="/admin">
              관리자 홈
            </Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="coupon-stock-note-title">
        <div className="container">
          <article className="color-block color-block--coral story-split">
            <div>
              <p className="eyebrow">STOCK SIGNAL</p>
              <h2 id="coupon-stock-note-title">
                산책용품 할인 쿠폰,
                <br />재고 128장.
              </h2>
            </div>
            <div className="story-copy">
              <p>발급 종료까지 나흘 남았습니다. 소진 속도와 이벤트 노출 상태를 함께 확인해 주세요.</p>
              <Link className="button button--primary" to="/admin/coupon-form?id=11">
                쿠폰 검토
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="coupon-record-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">COUPON RECORDS</p>
              <h2 id="coupon-record-title">등록 쿠폰</h2>
              <p>
                <span aria-live="polite">{count}개</span>의 쿠폰
              </p>
            </div>
            <FilterBar
              options={FILTER_OPTIONS}
              value={value}
              onChange={setValue}
              ariaLabel="관리 쿠폰 상태 필터"
              controlsId="admin-coupon-records admin-coupon-cards"
            />
          </div>

          <RecordTable
            caption="관리 쿠폰 목록"
            columns={['쿠폰', '이벤트', '혜택', '재고', '상태', '관리']}
            items={filtered}
            renderRow={renderRow}
            renderCard={renderCard}
            tableId="admin-coupon-records"
            cardsId="admin-coupon-cards"
            cardsAriaLabel="관리 쿠폰 모바일 목록"
            emptyState={
              <div className="empty-state" role="status">
                <h3>해당 상태의 쿠폰이 없습니다.</h3>
                <p>다른 상태를 선택해 주세요.</p>
              </div>
            }
          />
        </div>
      </section>
    </>
  );
}
