import { Link } from 'react-router-dom';
import DemoForm from '../../components/DemoForm';
import StatusBadge from '../../components/StatusBadge';
import { EVENT_STATUS } from '../../config/status';

export default function EventDetail() {
  return (
    <>
      <section className="page-hero" aria-labelledby="event-title">
        <div className="container">
          <Link className="back-link" to="/#event-list">
            <span aria-hidden="true">←</span> 이벤트 목록
          </Link>
          <p className="eyebrow">EVENT 01 / OPEN</p>
          <h1 id="event-title">
            반려동물
            <br />
            여름 케어 위크
          </h1>
          <p className="hero-copy">더운 계절에도 산뜻하게. 제휴 미용·목욕 서비스에 사용할 수 있는 두 가지 쿠폰을 준비했어요.</p>
          <div className="hero-actions">
            <a className="button button--primary" href="#coupon-choice">
              쿠폰 고르기
            </a>
            <a className="button button--secondary" href="#event-guide">
              사용 안내
            </a>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="event-summary-title">
        <div className="container">
          <article className="color-block color-block--lilac">
            <div className="section-head section-head--compact">
              <div>
                <p className="eyebrow">AT A GLANCE</p>
                <h2 id="event-summary-title">한눈에 보는 혜택</h2>
              </div>
              <StatusBadge className={EVENT_STATUS.open.className}>{EVENT_STATUS.open.publicLabel}</StatusBadge>
            </div>
            <dl className="metric-grid metric-grid--four">
              <div className="metric">
                <dt>최대 할인</dt>
                <dd>
                  20%<small>최대 10,000원</small>
                </dd>
              </div>
              <div className="metric">
                <dt>현재 잔여</dt>
                <dd>
                  284<small>총 500장</small>
                </dd>
              </div>
              <div className="metric">
                <dt>발급 종료</dt>
                <dd>
                  D−10<small>8월 30일 23:59</small>
                </dd>
              </div>
              <div className="metric">
                <dt>사용 기한</dt>
                <dd>
                  7일<small>발급 후 7일</small>
                </dd>
              </div>
            </dl>
          </article>
        </div>
      </section>

      <section id="coupon-choice" className="section" aria-labelledby="coupon-choice-title">
        <div className="container container--reading">
          <div className="section-head">
            <div>
              <p className="eyebrow">CHOOSE YOUR COUPON</p>
              <h2 id="coupon-choice-title">받을 혜택을 골라주세요.</h2>
              <p>쿠폰별로 한 사람당 한 장만 받을 수 있어요.</p>
            </div>
          </div>
          <DemoForm className="form-panel" message="여름 케어 쿠폰이 내 쿠폰에 담겼습니다.">
            <fieldset className="choice-fieldset">
              <legend>발급할 쿠폰</legend>
              <div className="choice-grid">
                <div className="choice-card">
                  <input id="coupon-rate" name="couponChoice" type="radio" value="rate" defaultChecked />
                  <label htmlFor="coupon-rate">
                    <span>
                      <strong>여름 정률 쿠폰</strong>
                      <small>3만원 이상 구매 · 최대 1만원 할인</small>
                    </span>
                    <b>20%</b>
                  </label>
                </div>
                <div className="choice-card">
                  <input id="coupon-fixed" name="couponChoice" type="radio" value="fixed" />
                  <label htmlFor="coupon-fixed">
                    <span>
                      <strong>첫 만남 정액 쿠폰</strong>
                      <small>2만원 이상 구매 · 첫 구매 전용</small>
                    </span>
                    <b>5,000원</b>
                  </label>
                </div>
              </div>
            </fieldset>
            <div className="form-note">
              <strong>발급 전 확인</strong>
              <p>선택한 쿠폰은 사용자 계정에 바로 보관되며, 발급 후에는 다른 쿠폰으로 바꿀 수 없습니다.</p>
            </div>
            <button className="button button--primary" type="submit">
              선택한 쿠폰 발급하기
            </button>
          </DemoForm>
        </div>
      </section>

      <section id="event-guide" className="section" aria-labelledby="event-guide-title">
        <div className="container editorial-row">
          <div>
            <p className="eyebrow">HOW TO USE</p>
            <h2 id="event-guide-title">
              받은 뒤에는
              <br />
              이렇게 사용하세요.
            </h2>
          </div>
          <ol className="numbered-list">
            <li>
              <strong>쿠폰 코드 확인</strong>
              <span>내 쿠폰 상세에서 코드와 만료 시각을 확인합니다.</span>
            </li>
            <li>
              <strong>결제 전 제시</strong>
              <span>제휴 매장 직원에게 쿠폰 코드를 보여주세요.</span>
            </li>
            <li>
              <strong>사용 처리</strong>
              <span>결제가 확정되면 쿠폰 상세에서 사용 상태를 변경합니다.</span>
            </li>
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="notice-title">
        <div className="container">
          <article className="color-block color-block--cream story-split">
            <div>
              <p className="eyebrow">PLEASE NOTE</p>
              <h2 id="notice-title">사용 전 꼭 확인해 주세요.</h2>
            </div>
            <div className="story-copy">
              <ul className="bullet-list">
                <li>다른 쿠폰과 중복 적용할 수 없습니다.</li>
                <li>결제 취소 시 매장의 환불 정책을 따릅니다.</li>
                <li>사용 기한이 지난 쿠폰은 다시 발급되지 않습니다.</li>
              </ul>
              <Link className="button button--secondary" to="/user/my-coupons">
                내 쿠폰으로 이동
              </Link>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
