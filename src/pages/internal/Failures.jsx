import { Link } from 'react-router-dom';
import FilterBar from '../../components/FilterBar';
import DemoButton from '../../components/DemoButton';
import StatusBadge from '../../components/StatusBadge';
import RecordTable from '../../components/RecordTable';
import { useFilter } from '../../hooks/useFilter';
import { FAILURE_STATUS } from '../../config/status';

const FILTER_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'failed', label: 'FAILED' },
  { value: 'retry', label: 'Retry' },
  { value: 'dlq', label: 'DLQ' },
];

const MESSAGES = [
  {
    id: 88419,
    status: 'failed',
    error: 'DB_WRITE_TIMEOUT',
    trace: 'coupon-12-seq-031',
    retries: '2회',
    lastSeen: '11:38:14',
    actionLabel: '재시도',
    actionAria: '메시지 88419 재시도',
    actionMessage: '메시지 #88419 재시도를 예약했습니다.',
  },
  {
    id: 88417,
    status: 'retry',
    error: 'PUSH_RATE_LIMIT',
    trace: 'coupon-10-seq-219',
    retries: '1회',
    lastSeen: '11:35:02',
    actionLabel: '즉시 재시도',
    actionAria: '메시지 88417 즉시 재시도',
    actionMessage: '메시지 #88417 즉시 재시도를 요청했습니다.',
  },
  {
    id: 88398,
    status: 'dlq',
    error: 'INVALID_PAYLOAD',
    trace: 'coupon-11-seq-901',
    retries: '5회',
    lastSeen: '10:52:47',
    actionLabel: '검토',
    actionAria: 'DLQ 메시지 88398 검토',
    actionMessage: '메시지 #88398 상세 검토를 시작했습니다.',
  },
];

function renderRow(message) {
  const status = FAILURE_STATUS[message.status];
  return (
    <tr key={message.id}>
      <td>
        <strong>#{message.id}</strong>
        <small>{message.trace}</small>
      </td>
      <td>{message.error}</td>
      <td>{message.retries}</td>
      <td>
        <StatusBadge className={status.className}>{status.label}</StatusBadge>
      </td>
      <td>{message.lastSeen}</td>
      <td>
        <DemoButton message={message.actionMessage} ariaLabel={message.actionAria}>
          {message.actionLabel}
        </DemoButton>
      </td>
    </tr>
  );
}

function renderCard(message) {
  const status = FAILURE_STATUS[message.status];
  return (
    <article className="hairline-card" key={message.id}>
      <div className="card-topline">
        <span className="caption">MESSAGE {message.id}</span>
        <StatusBadge className={status.className}>{status.label}</StatusBadge>
      </div>
      <h3>{message.error}</h3>
      <p>
        {message.trace} · 재시도 {message.retries}
      </p>
      <DemoButton message={message.actionMessage} ariaLabel={message.actionAria}>
        {message.actionLabel}
      </DemoButton>
    </article>
  );
}

export default function Failures() {
  const { value, setValue, filtered, count } = useFilter(MESSAGES);

  return (
    <>
      <section className="page-hero" aria-labelledby="failures-title">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">INTERNAL / FAILURES</p>
            <h1 id="failures-title">FAILED · Retry · DLQ</h1>
            <p className="hero-copy">실패 원인을 분류하고 안전하게 재시도하거나 격리 큐로 이동하세요.</p>
          </div>
          <div className="hero-actions">
            <Link className="button button--primary" to="/internal/issues">
              발급 흐름 추적
            </Link>
            <Link className="button button--secondary" to="/internal/monitoring">
              시스템 현황
            </Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="failure-summary-title">
        <div className="container">
          <article className="color-block color-block--pink">
            <div className="section-head section-head--compact">
              <div>
                <p className="eyebrow">ATTENTION QUEUE</p>
                <h2 id="failure-summary-title">확인이 필요한 메시지 3건</h2>
              </div>
              <StatusBadge className="status--warning">관찰 중</StatusBadge>
            </div>
            <dl className="metric-grid metric-grid--three">
              <div className="metric">
                <dt>FAILED</dt>
                <dd>
                  1<small>원인 확인 필요</small>
                </dd>
              </div>
              <div className="metric">
                <dt>Retry 대기</dt>
                <dd>
                  1<small>다음 시도 11:45</small>
                </dd>
              </div>
              <div className="metric">
                <dt>DLQ</dt>
                <dd>
                  1<small>수동 검토 필요</small>
                </dd>
              </div>
            </dl>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="failure-record-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">FAILURE RECORDS</p>
              <h2 id="failure-record-title">실패 메시지</h2>
              <p>
                <span aria-live="polite">{count}개</span>의 항목
              </p>
            </div>
            <FilterBar
              options={FILTER_OPTIONS}
              value={value}
              onChange={setValue}
              ariaLabel="실패 메시지 상태 필터"
              controlsId="failure-records failure-cards"
            />
          </div>

          <RecordTable
            caption="실패 메시지 목록"
            columns={['메시지', '오류', '재시도', '상태', '최근 처리', '작업']}
            items={filtered}
            renderRow={renderRow}
            renderCard={renderCard}
            tableId="failure-records"
            cardsId="failure-cards"
            cardsAriaLabel="실패 메시지 모바일 목록"
            emptyState={
              <div className="empty-state" role="status">
                <h3>해당 상태의 실패 메시지가 없습니다.</h3>
                <p>다른 상태를 선택해 주세요.</p>
              </div>
            }
          />
        </div>
      </section>

      <section className="section" aria-labelledby="failure-guide-title">
        <div className="container editorial-row">
          <div>
            <p className="eyebrow">OPERATING GUIDE</p>
            <h2 id="failure-guide-title">실패 처리 원칙</h2>
          </div>
          <ol className="numbered-list">
            <li>
              <strong>원인 확인</strong>
              <span>오류 코드와 페이로드, 이전 시도 결과를 함께 봅니다.</span>
            </li>
            <li>
              <strong>안전한 재시도</strong>
              <span>중복 발급 가능성을 확인한 뒤 재시도를 실행합니다.</span>
            </li>
            <li>
              <strong>DLQ 격리</strong>
              <span>반복 실패는 격리하고 담당자 검토 기록을 남깁니다.</span>
            </li>
          </ol>
        </div>
      </section>
    </>
  );
}
