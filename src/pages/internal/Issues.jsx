import { Link } from 'react-router-dom';
import DemoForm from '../../components/DemoForm';
import DemoButton from '../../components/DemoButton';
import StatusBadge from '../../components/StatusBadge';

const PIPELINE = [
  { step: '01', title: '요청 수신', detail: '요청 해시 생성 · 12ms', badge: <time dateTime="2026-08-21T09:14:22.184">09:14:22.184</time> },
  { step: '02', title: '멱등성 검증', detail: '새 요청 확인 · 18ms', badge: <StatusBadge className="status--open">SUCCEEDED</StatusBadge> },
  { step: '03', title: '재고 선점', detail: '잔여 285 → 284 · 31ms', badge: <span className="caption">SEQUENCE 216</span> },
  { step: '04', title: '발급 저장', detail: 'CouponIssue #1042 · 89ms', badge: <StatusBadge className="status--open">ISSUED</StatusBadge> },
  { step: '05', title: '알림 전송', detail: 'Push 채널 · 34ms', badge: <StatusBadge className="status--open">SENT</StatusBadge> },
];

const RECORDS = [
  {
    title: 'IdempotencyKey',
    status: 'SUCCEEDED',
    rows: [
      ['key', 'issue:10:1:8f3a21'],
      ['request hash', 'sha256:c7a9…4d21'],
      ['expires at', '09:14:52.184'],
    ],
  },
  {
    title: 'IssueMessage',
    status: 'CONSUMED',
    rows: [
      ['message ID', '#88412'],
      ['topic', 'coupon.issue.v1'],
      ['retry count', '0'],
    ],
  },
  {
    title: 'CouponIssue',
    status: 'ISSUED',
    rows: [
      ['issue ID', '#1042'],
      ['coupon code', 'PET-7K3M-82QD'],
      ['expires at', '2026.08.28 23:59'],
    ],
  },
  {
    title: 'NotificationLog',
    status: 'SENT',
    rows: [
      ['channel', 'PUSH'],
      ['recipient', 'user:1'],
      ['sent at', '09:14:22.368'],
    ],
  },
];

export default function Issues() {
  return (
    <>
      <section className="page-hero" aria-labelledby="issues-title">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">INTERNAL / ISSUE FLOW</p>
            <h1 id="issues-title">발급 처리 흐름</h1>
            <p className="hero-copy">하나의 요청이 받은 순간부터 저장과 알림까지 이동한 경로를 살펴보세요.</p>
          </div>
          <DemoForm className="compact-form" message="REQ-20260821-8F3A21 처리 흐름을 조회했습니다.">
            <div className="field-group">
              <label htmlFor="issue-query">요청 식별자</label>
              <input id="issue-query" name="query" type="search" defaultValue="REQ-20260821-8F3A21" required />
            </div>
            <button className="button button--primary" type="submit">
              흐름 조회
            </button>
          </DemoForm>
        </div>
      </section>

      <section className="section" aria-labelledby="issue-summary-title">
        <div className="container">
          <article className="color-block color-block--lilac">
            <div className="section-head section-head--compact">
              <div>
                <p className="eyebrow">REQUEST FOUND</p>
                <h2 id="issue-summary-title">REQ-20260821-8F3A21</h2>
                <p>2026.08.21 09:14:22 · 사용자 #1 · 쿠폰 #10</p>
              </div>
              <div>
                <StatusBadge className="status--open">처리 완료</StatusBadge>
                <strong className="duration">184ms</strong>
              </div>
            </div>
            <dl className="metric-grid metric-grid--four">
              <div className="metric">
                <dt>멱등성</dt>
                <dd>
                  통과<small>중복 없음</small>
                </dd>
              </div>
              <div className="metric">
                <dt>재고 순번</dt>
                <dd>
                  216<small>잔여 284장</small>
                </dd>
              </div>
              <div className="metric">
                <dt>발급 번호</dt>
                <dd>
                  1042<small>상태 ISSUED</small>
                </dd>
              </div>
              <div className="metric">
                <dt>알림</dt>
                <dd>
                  SENT<small>Push 전송</small>
                </dd>
              </div>
            </dl>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="pipeline-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">PROCESS PIPELINE</p>
              <h2 id="pipeline-title">처리 단계</h2>
            </div>
            <DemoButton className="button button--secondary" message="요청 식별자를 복사했습니다.">
              Request ID 복사
            </DemoButton>
          </div>
          <ol className="pipeline">
            {PIPELINE.map((item) => (
              <li className="is-complete" key={item.step}>
                <span className="pipeline-index">{item.step}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </div>
                {item.badge}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="issue-record-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">RECORD DETAILS</p>
              <h2 id="issue-record-title">처리 원장</h2>
            </div>
            <Link className="text-link" to="/internal/failures">
              실패 처리 보기
            </Link>
          </div>
          <div className="card-grid card-grid--two">
            {RECORDS.map((record) => (
              <article className="hairline-card" key={record.title}>
                <div className="card-topline">
                  <h3>{record.title}</h3>
                  <StatusBadge className="status--open">{record.status}</StatusBadge>
                </div>
                <dl className="detail-list">
                  {record.rows.map(([key, val]) => (
                    <div key={key}>
                      <dt>{key}</dt>
                      <dd>{val}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
