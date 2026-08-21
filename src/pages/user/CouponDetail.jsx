import { Link } from 'react-router-dom';
import CopyButton from '../../components/CopyButton';
import DemoButton from '../../components/DemoButton';
import StatusBadge from '../../components/StatusBadge';

const COUPON_CODE = 'PET-7K3M-82QD';

export default function CouponDetail() {
  return (
    <>
      <section className="page-hero" aria-labelledby="coupon-detail-title">
        <div className="container">
          <Link className="back-link" to="/user/my-coupons">
            <span aria-hidden="true">←</span> 내 쿠폰
          </Link>
          <p className="eyebrow">COUPON ISSUE / 1042</p>
          <h1 id="coupon-detail-title">여름 정률 쿠폰</h1>
          <p className="hero-copy">반려동물 여름 케어 위크 · 미용과 목욕 서비스에 사용할 수 있어요.</p>
        </div>
      </section>

      <section className="section" aria-labelledby="coupon-code-title">
        <div className="container">
          <article className="color-block color-block--pink coupon-pass">
            <div>
              <p className="eyebrow">READY TO USE</p>
              <h2 id="coupon-code-title">
                결제 전에
                <br />이 코드를 보여주세요.
              </h2>
              <StatusBadge className="status--open">사용 가능</StatusBadge>
            </div>
            <div className="coupon-code-panel">
              <span className="caption">COUPON CODE</span>
              <code id="coupon-code">{COUPON_CODE}</code>
              <CopyButton text={COUPON_CODE} ariaLabel={`쿠폰 코드 ${COUPON_CODE} 복사`}>
                코드 복사
              </CopyButton>
            </div>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="coupon-condition-title">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">BENEFIT &amp; RULES</p>
              <h2 id="coupon-condition-title">혜택과 조건</h2>
            </div>
            <Link className="text-link" to="/event-detail?id=1">
              연결 이벤트 보기
            </Link>
          </div>
          <div className="card-grid card-grid--two">
            <article className="hairline-card">
              <h3>할인 정보</h3>
              <dl className="detail-list">
                <div>
                  <dt>할인 유형</dt>
                  <dd>정률 할인</dd>
                </div>
                <div>
                  <dt>할인 값</dt>
                  <dd>20%</dd>
                </div>
                <div>
                  <dt>최소 주문</dt>
                  <dd>30,000원</dd>
                </div>
                <div>
                  <dt>최대 할인</dt>
                  <dd>10,000원</dd>
                </div>
              </dl>
            </article>
            <article className="hairline-card">
              <h3>발급 정보</h3>
              <dl className="detail-list">
                <div>
                  <dt>발급 시각</dt>
                  <dd>2026.08.21 09:14</dd>
                </div>
                <div>
                  <dt>만료 시각</dt>
                  <dd>2026.08.28 23:59</dd>
                </div>
                <div>
                  <dt>발급 순번</dt>
                  <dd>216번</dd>
                </div>
                <div>
                  <dt>사용 한도</dt>
                  <dd>사용자당 1장</dd>
                </div>
              </dl>
            </article>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="coupon-history-title">
        <div className="container editorial-row">
          <div>
            <p className="eyebrow">STATUS HISTORY</p>
            <h2 id="coupon-history-title">쿠폰의 기록</h2>
          </div>
          <ol className="timeline">
            <li className="is-current">
              <span className="timeline-marker" aria-hidden="true"></span>
              <div>
                <time dateTime="2026-08-21T09:14">2026.08.21 09:14</time>
                <h3>쿠폰 발급</h3>
                <p>선착순 발급 순번 216번으로 발급되었습니다.</p>
              </div>
            </li>
            <li>
              <span className="timeline-marker" aria-hidden="true"></span>
              <div>
                <span className="caption">NEXT</span>
                <h3>사용 대기</h3>
                <p>유효기간 안에 제휴 매장에서 사용할 수 있습니다.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="coupon-action-title">
        <div className="container">
          <article className="color-block color-block--lime story-split">
            <div>
              <p className="eyebrow">COUPON ACTION</p>
              <h2 id="coupon-action-title">
                사용 상태를
                <br />
                정확하게 남겨주세요.
              </h2>
            </div>
            <div className="story-copy">
              <p>결제가 확정된 뒤 사용 처리하세요. 잘못 처리했다면 사용 취소 이력도 함께 남길 수 있습니다.</p>
              <div className="button-row">
                <DemoButton className="button button--primary" message="여름 정률 쿠폰을 사용 완료로 표시했습니다.">
                  쿠폰 사용
                </DemoButton>
                <DemoButton className="button button--secondary" message="쿠폰 사용 취소 요청을 기록했습니다.">
                  사용 취소
                </DemoButton>
              </div>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
