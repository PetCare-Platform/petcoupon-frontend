import { Link } from 'react-router-dom';
import FilterBar from '../../components/FilterBar';
import DemoButton from '../../components/DemoButton';
import StatusBadge from '../../components/StatusBadge';
import RecordTable from '../../components/RecordTable';
import { useFilter } from '../../hooks/useFilter';
import { EVENT_STATUS } from '../../config/status';

const FILTER_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'open', label: '진행 중' },
  { value: 'scheduled', label: '예정' },
  { value: 'closed', label: '종료' },
];

const EVENTS = [
  { id: 1, status: 'open', label: 'EVENT 01', title: '반려동물 여름 케어 위크', period: '8.20 — 8.30', coupons: '2개' },
  { id: 2, status: 'scheduled', label: 'EVENT 02', title: '건강검진 데이', period: '8.24 — 9.07', coupons: '1개' },
  { id: 3, status: 'open', label: 'EVENT 03', title: '함께 걷는 계절', period: '8.15 — 8.25', coupons: '1개' },
  { id: 4, status: 'scheduled', label: 'EVENT 04', title: '가을 입맛 찾기', period: '9.01 — 9.14', coupons: '2개' },
  { id: 5, status: 'closed', label: 'EVENT 05', title: '웰컴 펫데이', period: '7.01 — 7.31', coupons: '2개' },
];

function renderRow(event) {
  const status = EVENT_STATUS[event.status];
  return (
    <tr key={event.id}>
      <td>
        <strong>{event.title}</strong>
        <small>{event.label}</small>
      </td>
      <td>{event.period}</td>
      <td>
        <StatusBadge className={status.className}>{status.adminLabel}</StatusBadge>
      </td>
      <td>{event.coupons}</td>
      <td>
        <div className="table-actions">
          <Link className="table-link" to={`/admin/event-form?id=${event.id}`}>
            수정
          </Link>
          <DemoButton message={`${event.title} 삭제 확인을 열었습니다.`} ariaLabel={`${event.title} 삭제`}>
            삭제
          </DemoButton>
        </div>
      </td>
    </tr>
  );
}

function renderCard(event) {
  const status = EVENT_STATUS[event.status];
  return (
    <article className="hairline-card" key={event.id}>
      <div className="card-topline">
        <span className="caption">{event.label}</span>
        <StatusBadge className={status.className}>{status.adminLabel}</StatusBadge>
      </div>
      <h3>{event.title}</h3>
      <p>
        {event.period} · 쿠폰 {event.coupons}
      </p>
      <div className="card-actions">
        <Link to={`/admin/event-form?id=${event.id}`}>수정</Link>
        <DemoButton message={`${event.title} 삭제 확인을 열었습니다.`} ariaLabel={`${event.title} 삭제`}>
          삭제
        </DemoButton>
      </div>
    </article>
  );
}

export default function AdminEvents() {
  const { value, setValue, filtered, count } = useFilter(EVENTS);

  return (
    <>
      <section className="page-hero" aria-labelledby="admin-events-title">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">ADMIN / EVENTS</p>
            <h1 id="admin-events-title">이벤트 목록</h1>
            <p className="hero-copy">공개 일정과 상태, 연결된 쿠폰을 확인하고 필요한 항목을 관리하세요.</p>
          </div>
          <div className="hero-actions">
            <Link className="button button--primary" to="/admin/event-form">
              새 이벤트
            </Link>
            <Link className="button button--secondary" to="/admin">
              관리자 홈
            </Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="event-status-note-title">
        <div className="container">
          <article className="color-block color-block--cream story-split">
            <div>
              <p className="eyebrow">NEXT OPEN</p>
              <h2 id="event-status-note-title">
                건강검진 데이가
                <br />3일 뒤 시작됩니다.
              </h2>
            </div>
            <div className="story-copy">
              <p>연결 쿠폰의 발급 시작 시각과 총수량을 마지막으로 점검해 주세요.</p>
              <Link className="button button--primary" to="/admin/event-form?id=2">
                이벤트 검토
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="event-record-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">EVENT RECORDS</p>
              <h2 id="event-record-title">등록 이벤트</h2>
              <p>
                <span aria-live="polite">{count}개</span>의 이벤트
              </p>
            </div>
            <FilterBar
              options={FILTER_OPTIONS}
              value={value}
              onChange={setValue}
              ariaLabel="관리 이벤트 상태 필터"
              controlsId="admin-event-records admin-event-cards"
            />
          </div>

          <RecordTable
            caption="관리 이벤트 목록"
            columns={['이벤트', '기간', '상태', '쿠폰', '관리']}
            items={filtered}
            renderRow={renderRow}
            renderCard={renderCard}
            tableId="admin-event-records"
            cardsId="admin-event-cards"
            cardsAriaLabel="관리 이벤트 모바일 목록"
            emptyState={
              <div className="empty-state" role="status">
                <h3>해당 상태의 이벤트가 없습니다.</h3>
                <p>다른 상태를 선택해 주세요.</p>
              </div>
            }
          />
        </div>
      </section>
    </>
  );
}
