import { Link } from 'react-router-dom';
import StatusBadge from '../../components/StatusBadge';
import RecordTable from '../../components/RecordTable';

const RECENT_EVENTS = [
  { id: 2, label: 'EVENT 02', title: '건강검진 데이', period: '8.24 — 9.07', coupons: '1개', statusLabel: '예정', statusClassName: 'status--scheduled' },
  { id: 4, label: 'EVENT 04', title: '가을 입맛 찾기', period: '9.01 — 9.14', coupons: '2개', statusLabel: '예정', statusClassName: 'status--scheduled' },
];

function renderRow(event) {
  return (
    <tr key={event.id}>
      <td>
        <strong>{event.title}</strong>
        <small>{event.label}</small>
      </td>
      <td>{event.period}</td>
      <td>
        <StatusBadge className={event.statusClassName}>{event.statusLabel}</StatusBadge>
      </td>
      <td>{event.coupons}</td>
      <td>
        <Link className="table-link" to={`/admin/event-form?id=${event.id}`}>
          수정
        </Link>
      </td>
    </tr>
  );
}

function renderCard(event) {
  return (
    <article className="hairline-card" key={event.id}>
      <div className="card-topline">
        <span className="caption">{event.label}</span>
        <StatusBadge className={event.statusClassName}>{event.statusLabel}</StatusBadge>
      </div>
      <h3>{event.title}</h3>
      <p>
        {event.period} · 쿠폰 {event.coupons}
      </p>
      <Link className="card-link" to={`/admin/event-form?id=${event.id}`}>
        수정 →
      </Link>
    </article>
  );
}

export default function AdminHome() {
  return (
    <>
      <section className="page-hero" aria-labelledby="admin-home-title">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">ADMIN / CONTROL ROOM</p>
            <h1 id="admin-home-title">
              혜택 운영을
              <br />더 선명하게.
            </h1>
            <p className="hero-copy">이벤트 일정과 쿠폰 재고, 최근 변경 사항을 한 흐름으로 관리하세요.</p>
            <div className="hero-actions">
              <Link className="button button--primary" to="/admin/event-form">
                이벤트 만들기
              </Link>
              <Link className="button button--secondary" to="/admin/coupon-form">
                쿠폰 만들기
              </Link>
            </div>
          </div>
          <aside className="hero-note" aria-label="오늘의 운영 메모">
            <span className="caption">OPS NOTE</span>
            <strong>예정 이벤트 점검</strong>
            <p>건강검진 데이 오픈 전 쿠폰 수량과 발급 기간을 확인해 주세요.</p>
          </aside>
        </div>
      </section>

      <section className="section" aria-labelledby="admin-summary-title">
        <div className="container">
          <article className="color-block color-block--lilac">
            <div className="section-head section-head--compact">
              <div>
                <p className="eyebrow">TODAY'S OVERVIEW</p>
                <h2 id="admin-summary-title">운영 요약</h2>
              </div>
              <time dateTime="2026-08-21">2026.08.21</time>
            </div>
            <dl className="metric-grid metric-grid--four">
              <div className="metric">
                <dt>진행 이벤트</dt>
                <dd>
                  2<small>예정 2개</small>
                </dd>
              </div>
              <div className="metric">
                <dt>활성 쿠폰</dt>
                <dd>
                  5<small>총 재고 1,212장</small>
                </dd>
              </div>
              <div className="metric">
                <dt>오늘 발급</dt>
                <dd>
                  216<small>전일 대비 +18%</small>
                </dd>
              </div>
              <div className="metric">
                <dt>확인 필요</dt>
                <dd>
                  3<small>실패·정합성 항목</small>
                </dd>
              </div>
            </dl>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="admin-shortcut-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">MANAGE</p>
              <h2 id="admin-shortcut-title">운영 바로가기</h2>
            </div>
          </div>
          <nav className="card-grid card-grid--four" aria-label="관리 기능 바로가기">
            <Link className="hairline-card shortcut-card" to="/admin/events">
              <span className="caption">EVENTS</span>
              <strong>이벤트 목록</strong>
              <span>일정과 상태 관리 →</span>
            </Link>
            <Link className="hairline-card shortcut-card" to="/admin/event-form">
              <span className="caption">NEW EVENT</span>
              <strong>이벤트 등록</strong>
              <span>새 일정 만들기 →</span>
            </Link>
            <Link className="hairline-card shortcut-card" to="/admin/coupons">
              <span className="caption">COUPONS</span>
              <strong>쿠폰 목록</strong>
              <span>혜택과 재고 관리 →</span>
            </Link>
            <Link className="hairline-card shortcut-card" to="/admin/coupon-form">
              <span className="caption">NEW COUPON</span>
              <strong>쿠폰 등록</strong>
              <span>새 혜택 만들기 →</span>
            </Link>
          </nav>
        </div>
      </section>

      <section className="section" aria-labelledby="recent-events-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">RECENT EVENTS</p>
              <h2 id="recent-events-title">곧 확인할 이벤트</h2>
            </div>
            <Link className="text-link" to="/admin/events">
              전체 이벤트 보기
            </Link>
          </div>
          <RecordTable
            caption="최근 관리 이벤트"
            columns={['이벤트', '일정', '상태', '쿠폰', '바로가기']}
            items={RECENT_EVENTS}
            renderRow={renderRow}
            renderCard={renderCard}
            cardsAriaLabel="최근 관리 이벤트 모바일 목록"
          />
        </div>
      </section>
    </>
  );
}
