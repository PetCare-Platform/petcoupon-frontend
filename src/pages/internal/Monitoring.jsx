import { Link } from 'react-router-dom';
import DemoButton from '../../components/DemoButton';
import StatusBadge from '../../components/StatusBadge';
import RecordTable from '../../components/RecordTable';
import { MONITORING_STATUS } from '../../config/status';

const COMPONENTS = [
  { name: 'Application', role: 'HTTP 요청 처리', status: 'ok', response: '42ms', checked: '11:42:08' },
  { name: 'MySQL', role: '원장과 운영 데이터', status: 'ok', response: '8ms', checked: '11:42:07' },
  { name: 'Redis', role: '재고와 중복 제어', status: 'ok', response: '3ms', checked: '11:42:07' },
  { name: 'Kafka', role: '발급 메시지 전달', status: 'warning', response: '92ms', checked: '11:42:06' },
];

const BARS = [58, 64, 72, 86, 74, 93, 81];

function renderRow(component) {
  const status = MONITORING_STATUS[component.status];
  return (
    <tr key={component.name}>
      <td>
        <strong>{component.name}</strong>
      </td>
      <td>{component.role}</td>
      <td>
        <StatusBadge className={status.className}>{status.label}</StatusBadge>
      </td>
      <td>{component.response}</td>
      <td>{component.checked}</td>
    </tr>
  );
}

function renderCard(component) {
  const status = MONITORING_STATUS[component.status];
  return (
    <article className="hairline-card" key={component.name}>
      <div className="card-topline">
        <strong>{component.name}</strong>
        <StatusBadge className={status.className}>{status.label}</StatusBadge>
      </div>
      <p>
        {component.role} · 응답 {component.response}
      </p>
      <small>{component.checked} 확인</small>
    </article>
  );
}

export default function Monitoring() {
  return (
    <>
      <section className="page-hero" aria-labelledby="monitoring-title">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">INTERNAL / MONITORING</p>
            <h1 id="monitoring-title">시스템 현황</h1>
            <p className="hero-copy">쿠폰 발급 흐름의 가용성, 처리량과 지연을 한 화면에서 점검하세요.</p>
          </div>
          <div className="hero-actions">
            <DemoButton className="button button--primary" message="시스템 현황을 최신 시각으로 갱신했습니다.">
              현황 새로고침
            </DemoButton>
            <Link className="button button--secondary" to="/internal/failures">
              실패 목록
            </Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="system-overview-title">
        <div className="container">
          <article className="color-block color-block--lime">
            <div className="section-head section-head--compact">
              <div>
                <p className="eyebrow">LIVE PULSE</p>
                <h2 id="system-overview-title">전체 흐름은 안정적입니다.</h2>
              </div>
              <div className="live-indicator">
                <span aria-hidden="true"></span> 마지막 확인 11:42:08
              </div>
            </div>
            <dl className="metric-grid metric-grid--four">
              <div className="metric">
                <dt>API 성공률</dt>
                <dd>
                  99.98%<small>최근 15분</small>
                </dd>
              </div>
              <div className="metric">
                <dt>분당 발급</dt>
                <dd>
                  186<small>평균 172건</small>
                </dd>
              </div>
              <div className="metric">
                <dt>처리 지연</dt>
                <dd>
                  184ms<small>목표 250ms 이하</small>
                </dd>
              </div>
              <div className="metric">
                <dt>실패 대기</dt>
                <dd>
                  3<small>긴급 항목 없음</small>
                </dd>
              </div>
            </dl>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="component-health-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">COMPONENT HEALTH</p>
              <h2 id="component-health-title">구성요소 상태</h2>
            </div>
            <span className="caption">SEOUL / UTC+09:00</span>
          </div>
          <RecordTable
            caption="시스템 구성요소 상태"
            columns={['구성요소', '역할', '상태', '응답', '최근 확인']}
            items={COMPONENTS}
            renderRow={renderRow}
            renderCard={renderCard}
            cardsAriaLabel="시스템 구성요소 모바일 목록"
          />
        </div>
      </section>

      <section className="section" aria-labelledby="throughput-title">
        <div className="container editorial-row">
          <div>
            <p className="eyebrow">ISSUE THROUGHPUT</p>
            <h2 id="throughput-title">최근 발급 처리량</h2>
            <p>한 시간 동안의 분당 발급 요청과 실패 비율입니다.</p>
          </div>
          <figure className="chart-card">
            <div
              className="bar-chart"
              role="img"
              aria-label="최근 한 시간 분당 발급량. 최저 128건, 최고 216건, 현재 186건"
            >
              {BARS.map((bar, index) => (
                <span key={index} style={{ '--bar': `${bar}%` }}></span>
              ))}
            </div>
            <figcaption>10:45 — 11:45 · 실패율 0.04%</figcaption>
          </figure>
        </div>
      </section>

      <section className="section" aria-labelledby="internal-links-title">
        <div className="container">
          <div className="section-head">
            <h2 id="internal-links-title">운영 상세로 이동</h2>
          </div>
          <nav className="card-grid card-grid--three" aria-label="내부 운영 화면">
            <Link className="hairline-card shortcut-card" to="/internal/issues">
              <span className="caption">ISSUE FLOW</span>
              <strong>발급 처리 흐름</strong>
              <span>요청 단계 추적 →</span>
            </Link>
            <Link className="hairline-card shortcut-card" to="/internal/failures">
              <span className="caption">FAILURES</span>
              <strong>실패 처리</strong>
              <span>Retry와 DLQ →</span>
            </Link>
            <Link className="hairline-card shortcut-card" to="/internal/verification">
              <span className="caption">VERIFY</span>
              <strong>정합성 검증</strong>
              <span>원장 차이 확인 →</span>
            </Link>
          </nav>
        </div>
      </section>
    </>
  );
}
