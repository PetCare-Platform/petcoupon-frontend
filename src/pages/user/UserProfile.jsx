import { Link } from 'react-router-dom';
import DemoForm from '../../components/DemoForm';
import StatusBadge from '../../components/StatusBadge';
import RecordTable from '../../components/RecordTable';

const RECENT_ACTIVITY = [
  {
    id: 1,
    date: '2026.08.21 09:14',
    dateIso: '2026-08-21T09:14',
    dateShort: '8월 21일 09:14',
    action: '쿠폰 발급',
    coupon: '여름 정률 쿠폰',
    statusLabel: '사용 가능',
    statusClassName: 'status--open',
  },
  {
    id: 2,
    date: '2026.07.22 17:40',
    dateIso: '2026-07-22T17:40',
    dateShort: '7월 22일 17:40',
    action: '쿠폰 사용',
    coupon: '웰컴 케어 쿠폰',
    statusLabel: '사용 완료',
    statusClassName: 'status--used',
  },
];

function renderRow(activity) {
  return (
    <tr key={activity.id}>
      <td>{activity.date}</td>
      <td>{activity.action}</td>
      <td>{activity.coupon}</td>
      <td>
        <StatusBadge className={activity.statusClassName}>{activity.statusLabel}</StatusBadge>
      </td>
    </tr>
  );
}

function renderCard(activity) {
  return (
    <article className="hairline-card" key={activity.id}>
      <div className="card-topline">
        <time dateTime={activity.dateIso}>{activity.dateShort}</time>
        <StatusBadge className={activity.statusClassName}>{activity.statusLabel}</StatusBadge>
      </div>
      <h3>{activity.coupon}</h3>
      <p>{activity.action}</p>
    </article>
  );
}

export default function UserProfile() {
  return (
    <>
      <section className="page-hero" aria-labelledby="user-page-title">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">USER / PROFILE</p>
            <h1 id="user-page-title">
              사용자 정보를
              <br />한눈에.
            </h1>
            <p className="hero-copy">계정 상태와 연락처, 보유 쿠폰 활동을 확인하세요.</p>
          </div>
          <DemoForm className="compact-form" message="사용자 #1 정보를 불러왔습니다.">
            <div className="field-group">
              <label htmlFor="user-id">사용자 번호</label>
              <input id="user-id" name="userId" type="number" defaultValue={1} min="1" required />
            </div>
            <button className="button button--primary" type="submit">
              사용자 조회
            </button>
          </DemoForm>
        </div>
      </section>

      <section className="section" aria-labelledby="profile-title">
        <div className="container">
          <article className="color-block color-block--mint profile-block">
            <div className="profile-heading">
              <div className="initial-mark" aria-hidden="true">
                김
              </div>
              <div>
                <p className="eyebrow">ACTIVE MEMBER</p>
                <h2 id="profile-title">김하늘 님</h2>
                <p>반려생활을 꼼꼼하게 기록하는 PetCoupon 회원</p>
              </div>
              <StatusBadge className="status--open">정상</StatusBadge>
            </div>
            <dl className="profile-facts">
              <div>
                <dt>이메일</dt>
                <dd>haneul.kim@example.com</dd>
              </div>
              <div>
                <dt>휴대전화</dt>
                <dd>010-27**-84**</dd>
              </div>
              <div>
                <dt>가입일</dt>
                <dd>2026년 3월 12일</dd>
              </div>
              <div>
                <dt>사용자 번호</dt>
                <dd>#1</dd>
              </div>
            </dl>
            <Link className="button button--primary" to="/user/my-coupons">
              보유 쿠폰 보기
            </Link>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="activity-summary-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">COUPON ACTIVITY</p>
              <h2 id="activity-summary-title">쿠폰 활동 요약</h2>
            </div>
          </div>
          <dl className="metric-grid metric-grid--three">
            <div className="metric hairline-card">
              <dt>사용 가능</dt>
              <dd>
                2장<small>이번 주 만료 1장</small>
              </dd>
            </div>
            <div className="metric hairline-card">
              <dt>사용 완료</dt>
              <dd>
                1장<small>최근 사용 7월 22일</small>
              </dd>
            </div>
            <div className="metric hairline-card">
              <dt>누적 절약</dt>
              <dd>
                24,800원<small>올해 기준</small>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="section" aria-labelledby="recent-activity-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">RECENT HISTORY</p>
              <h2 id="recent-activity-title">최근 활동</h2>
            </div>
          </div>
          <RecordTable
            caption="김하늘 사용자의 최근 쿠폰 활동"
            columns={['일시', '활동', '쿠폰', '상태']}
            items={RECENT_ACTIVITY}
            renderRow={renderRow}
            renderCard={renderCard}
            cardsAriaLabel="최근 쿠폰 활동 모바일 목록"
          />
        </div>
      </section>
    </>
  );
}
