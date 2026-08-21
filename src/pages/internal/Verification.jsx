import DemoForm from '../../components/DemoForm';
import DemoButton from '../../components/DemoButton';
import FilterBar from '../../components/FilterBar';
import StatusBadge from '../../components/StatusBadge';
import RecordTable from '../../components/RecordTable';
import { useFilter } from '../../hooks/useFilter';
import { VERIFICATION_STATUS } from '../../config/status';

const FILTER_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'matched', label: '일치' },
  { value: 'mismatch', label: '불일치' },
];

const RECORDS = [
  {
    id: 'verify-stock-10',
    status: 'matched',
    caption: 'COUPON 10 / STOCK',
    title: '쿠폰 #10 재고',
    source: 'Redis ↔ 발급 원장',
    expected: '284',
    actual: '284',
    actionLabel: '상세',
    actionAria: '쿠폰 10 재고 검증 상세 확인',
    actionMessage: '쿠폰 #10 재고 검증 상세를 열었습니다.',
  },
  {
    id: 'verify-issue-1042',
    status: 'matched',
    caption: 'ISSUE 1042 / STATUS',
    title: '발급 #1042 상태',
    source: 'CouponIssue ↔ History',
    expected: 'ISSUED',
    actual: 'ISSUED',
    actionLabel: '상세',
    actionAria: '발급 1042 상태 검증 상세 확인',
    actionMessage: '발급 #1042 상태 검증 상세를 열었습니다.',
  },
  {
    id: 'verify-stock-11',
    status: 'mismatch',
    caption: 'COUPON 11 / STOCK',
    title: '쿠폰 #11 재고',
    source: 'Redis ↔ 발급 원장',
    expected: '128',
    actual: '127',
    actionLabel: '재검증',
    actionAria: '쿠폰 11 재고 다시 검증',
    actionMessage: '쿠폰 #11 재고 재검증을 예약했습니다.',
  },
  {
    id: 'verify-message-88419',
    status: 'mismatch',
    caption: 'MESSAGE 88419',
    title: '메시지 #88419',
    source: 'IssueMessage ↔ CouponIssue',
    expected: 'CONSUMED',
    actual: 'FAILED',
    actionLabel: '재검증',
    actionAria: '메시지 88419 다시 검증',
    actionMessage: '메시지 #88419 재검증을 예약했습니다.',
  },
];

function renderRow(record) {
  const status = VERIFICATION_STATUS[record.status];
  return (
    <tr key={record.id}>
      <td>
        <strong>{record.title}</strong>
        <small>{record.source}</small>
      </td>
      <td>{record.expected}</td>
      <td>{record.actual}</td>
      <td>
        <StatusBadge className={status.className}>{status.label}</StatusBadge>
      </td>
      <td>
        <DemoButton message={record.actionMessage} ariaLabel={record.actionAria}>
          {record.actionLabel}
        </DemoButton>
      </td>
    </tr>
  );
}

function renderCard(record) {
  const status = VERIFICATION_STATUS[record.status];
  return (
    <article className="hairline-card" key={record.id}>
      <div className="card-topline">
        <span className="caption">{record.caption}</span>
        <StatusBadge className={status.className}>{status.label}</StatusBadge>
      </div>
      <h3>
        기대 {record.expected} · 실제 {record.actual}
      </h3>
      <p>{record.source}</p>
      <DemoButton message={record.actionMessage} ariaLabel={record.actionAria}>
        {record.actionLabel}
      </DemoButton>
    </article>
  );
}

export default function Verification() {
  const { value, setValue, filtered, count } = useFilter(RECORDS);

  return (
    <>
      <section className="page-hero" aria-labelledby="verification-title">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">INTERNAL / VERIFICATION</p>
            <h1 id="verification-title">정합성 검증</h1>
            <p className="hero-copy">재고, 발급 원장과 메시지 처리 결과가 같은 사실을 가리키는지 확인하세요.</p>
          </div>
          <DemoForm className="compact-form compact-form--wide" message="선택한 범위의 정합성 검증을 완료했습니다.">
            <div className="field-group">
              <label htmlFor="verification-scope">검증 범위</label>
              <select id="verification-scope" name="scope" defaultValue="all">
                <option value="all">전체 원장</option>
                <option value="stock">쿠폰 재고</option>
                <option value="issue">발급 원장</option>
                <option value="message">메시지 처리</option>
              </select>
            </div>
            <div className="field-group">
              <label htmlFor="verification-date">기준일</label>
              <input id="verification-date" name="date" type="date" defaultValue="2026-08-21" />
            </div>
            <button className="button button--primary" type="submit">
              검증 실행
            </button>
          </DemoForm>
        </div>
      </section>

      <section className="section" aria-labelledby="verification-summary-title">
        <div className="container">
          <article className="color-block color-block--mint">
            <div className="section-head section-head--compact">
              <div>
                <p className="eyebrow">LATEST RUN</p>
                <h2 id="verification-summary-title">대부분의 원장이 일치합니다.</h2>
                <p>마지막 검증 2026.08.21 11:30 · 전체 범위</p>
              </div>
              <StatusBadge className="status--warning">2건 확인 필요</StatusBadge>
            </div>
            <dl className="metric-grid metric-grid--four">
              <div className="metric">
                <dt>검사 대상</dt>
                <dd>
                  1,248<small>쿠폰·발급·메시지</small>
                </dd>
              </div>
              <div className="metric">
                <dt>일치</dt>
                <dd>
                  1,246<small>99.84%</small>
                </dd>
              </div>
              <div className="metric">
                <dt>불일치</dt>
                <dd>
                  2<small>재고 1 · 메시지 1</small>
                </dd>
              </div>
              <div className="metric">
                <dt>검증 시간</dt>
                <dd>
                  2.8s<small>직전 대비 −0.4s</small>
                </dd>
              </div>
            </dl>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="verification-record-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">VERIFICATION RECORDS</p>
              <h2 id="verification-record-title">검증 결과</h2>
              <p>
                <span aria-live="polite">{count}개</span>의 대표 항목
              </p>
            </div>
            <FilterBar
              options={FILTER_OPTIONS}
              value={value}
              onChange={setValue}
              ariaLabel="정합성 검증 결과 필터"
              controlsId="verification-records verification-cards"
            />
          </div>

          <RecordTable
            caption="정합성 검증 결과"
            columns={['검증 항목', '기대 값', '실제 값', '결과', '확인']}
            items={filtered}
            renderRow={renderRow}
            renderCard={renderCard}
            tableId="verification-records"
            cardsId="verification-cards"
            cardsAriaLabel="정합성 검증 결과 모바일 목록"
            emptyState={
              <div className="empty-state" role="status">
                <h3>선택한 결과가 없습니다.</h3>
                <p>다른 결과 상태를 선택해 주세요.</p>
              </div>
            }
          />
        </div>
      </section>

      <section className="section" aria-labelledby="verification-guide-title">
        <div className="container editorial-row">
          <div>
            <p className="eyebrow">FOLLOW-UP</p>
            <h2 id="verification-guide-title">불일치 처리 순서</h2>
          </div>
          <ol className="numbered-list">
            <li>
              <strong>원본 확인</strong>
              <span>각 원장의 생성 시각과 마지막 변경 이력을 확인합니다.</span>
            </li>
            <li>
              <strong>재검증</strong>
              <span>일시적인 지연인지 같은 범위로 다시 비교합니다.</span>
            </li>
            <li>
              <strong>운영 조치</strong>
              <span>차이가 유지되면 실패 흐름과 담당자 기록을 연결합니다.</span>
            </li>
          </ol>
        </div>
      </section>
    </>
  );
}
