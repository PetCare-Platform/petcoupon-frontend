import { useState } from 'react';
import { Link } from 'react-router-dom';
import DemoForm from '../../components/DemoForm';

export default function AdminCouponForm() {
  const [discountType, setDiscountType] = useState('RATE');
  const isRate = discountType === 'RATE';

  return (
    <>
      <section className="page-hero" aria-labelledby="coupon-form-page-title">
        <div className="container">
          <Link className="back-link" to="/admin/coupons">
            <span aria-hidden="true">←</span> 쿠폰 목록
          </Link>
          <p className="eyebrow">ADMIN / NEW COUPON</p>
          <h1 id="coupon-form-page-title">쿠폰 만들기</h1>
          <p className="hero-copy">혜택이 선명하게 보이도록 할인 조건과 발급 범위를 꼼꼼히 설정하세요.</p>
        </div>
      </section>

      <section className="section" aria-labelledby="coupon-form-note-title">
        <div className="container">
          <article className="color-block color-block--mint story-split">
            <div>
              <p className="eyebrow">COUPON BLUEPRINT</p>
              <h2 id="coupon-form-note-title">
                혜택은 단순하게,
                <br />
                조건은 정확하게.
              </h2>
            </div>
            <div className="story-copy">
              <p>정률 할인은 최대 할인 금액을 함께 정하고, 발급 기간은 연결 이벤트 안에서 설정하세요.</p>
              <dl className="inline-facts">
                <div>
                  <dt>사용자 한도</dt>
                  <dd>쿠폰당 1장</dd>
                </div>
                <div>
                  <dt>권장 유효기간</dt>
                  <dd>발급 후 7일</dd>
                </div>
              </dl>
            </div>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="coupon-fields-title">
        <div className="container container--form">
          <div className="section-head">
            <div>
              <p className="eyebrow">COUPON DETAILS</p>
              <h2 id="coupon-fields-title">쿠폰 정보</h2>
            </div>
            <span className="required-note">
              <span aria-hidden="true">*</span> 필수 입력
            </span>
          </div>
          <DemoForm className="form-panel" message="쿠폰 입력 내용을 저장했습니다.">
            <fieldset>
              <legend>기본 정보</legend>
              <div className="form-grid">
                <div className="field-group field-group--full">
                  <label htmlFor="coupon-event">
                    연결 이벤트 <span aria-hidden="true">*</span>
                  </label>
                  <select id="coupon-event" name="eventId" defaultValue="4" required>
                    <option value="">이벤트를 선택하세요</option>
                    <option value="2">건강검진 데이</option>
                    <option value="4">가을 입맛 찾기</option>
                  </select>
                </div>
                <div className="field-group field-group--full">
                  <label htmlFor="coupon-name">
                    쿠폰 이름 <span aria-hidden="true">*</span>
                  </label>
                  <input id="coupon-name" name="name" type="text" defaultValue="가을 사료 10% 쿠폰" maxLength={100} required />
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend>할인 조건</legend>
              <div className="choice-grid choice-grid--compact">
                <div className="choice-card">
                  <input
                    id="discount-type-rate"
                    name="discountType"
                    type="radio"
                    value="RATE"
                    checked={discountType === 'RATE'}
                    onChange={() => setDiscountType('RATE')}
                  />
                  <label htmlFor="discount-type-rate">
                    <span>
                      <strong>정률 할인</strong>
                      <small>결제 금액의 일정 비율</small>
                    </span>
                    <b>%</b>
                  </label>
                </div>
                <div className="choice-card">
                  <input
                    id="discount-type-fixed"
                    name="discountType"
                    type="radio"
                    value="FIXED_AMOUNT"
                    checked={discountType === 'FIXED_AMOUNT'}
                    onChange={() => setDiscountType('FIXED_AMOUNT')}
                  />
                  <label htmlFor="discount-type-fixed">
                    <span>
                      <strong>정액 할인</strong>
                      <small>고정 금액을 즉시 할인</small>
                    </span>
                    <b>₩</b>
                  </label>
                </div>
              </div>
              <div className="form-grid">
                <div className="field-group">
                  <label htmlFor="discount-value">
                    할인 값 <span aria-hidden="true">*</span>
                  </label>
                  <input id="discount-value" name="discountValue" type="number" defaultValue={10} min="1" required />
                </div>
                <div className="field-group">
                  <label htmlFor="minimum-order">
                    최소 주문 금액 <span aria-hidden="true">*</span>
                  </label>
                  <input id="minimum-order" name="minOrderAmount" type="number" defaultValue={30000} min="0" step="1" required />
                </div>
                <div
                  className={`field-group field-group--full${isRate ? '' : ' is-disabled'}`}
                  aria-disabled={!isRate}
                >
                  <label htmlFor="maximum-discount">최대 할인 금액</label>
                  <input
                    id="maximum-discount"
                    name="maxDiscountAmount"
                    type="number"
                    defaultValue={12000}
                    min="1"
                    step="1"
                    aria-describedby="maximum-discount-help"
                    disabled={!isRate}
                  />
                  <small id="maximum-discount-help">정률 할인일 때만 적용됩니다.</small>
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend>발급 기간과 재고</legend>
              <div className="form-grid">
                <div className="field-group">
                  <label htmlFor="issue-start">
                    발급 시작 <span aria-hidden="true">*</span>
                  </label>
                  <input id="issue-start" name="issueStartAt" type="datetime-local" defaultValue="2026-09-01T09:00" required />
                </div>
                <div className="field-group">
                  <label htmlFor="issue-end">
                    발급 종료 <span aria-hidden="true">*</span>
                  </label>
                  <input id="issue-end" name="issueEndAt" type="datetime-local" defaultValue="2026-09-12T23:59" required />
                </div>
                <div className="field-group">
                  <label htmlFor="valid-days">
                    유효 일수 <span aria-hidden="true">*</span>
                  </label>
                  <input id="valid-days" name="validDays" type="number" defaultValue={7} min="1" required />
                  <small>발급 후 사용할 수 있는 일수입니다.</small>
                </div>
                <div className="field-group">
                  <label htmlFor="total-quantity">
                    총 발급 수량 <span aria-hidden="true">*</span>
                  </label>
                  <input id="total-quantity" name="totalQuantity" type="number" defaultValue={400} min="1" required />
                </div>
              </div>
            </fieldset>

            <aside className="form-note">
              <strong>발급 정책</strong>
              <p>사용자 한 명은 같은 쿠폰을 한 장만 받을 수 있습니다.</p>
            </aside>
            <div className="form-actions">
              <button className="button button--primary" type="submit">
                쿠폰 저장
              </button>
              <Link className="button button--secondary" to="/admin/coupons">
                취소
              </Link>
            </div>
          </DemoForm>
        </div>
      </section>
    </>
  );
}
