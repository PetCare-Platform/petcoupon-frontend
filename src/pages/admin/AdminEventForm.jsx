import { Link } from 'react-router-dom';
import DemoForm from '../../components/DemoForm';

export default function AdminEventForm() {
  return (
    <>
      <section className="page-hero" aria-labelledby="event-form-page-title">
        <div className="container">
          <Link className="back-link" to="/admin/events">
            <span aria-hidden="true">←</span> 이벤트 목록
          </Link>
          <p className="eyebrow">ADMIN / NEW EVENT</p>
          <h1 id="event-form-page-title">이벤트 만들기</h1>
          <p className="hero-copy">고객에게 보여줄 이름과 설명, 정확한 공개 일정을 입력하세요.</p>
        </div>
      </section>

      <section className="section" aria-labelledby="event-form-note-title">
        <div className="container">
          <article className="color-block color-block--lime story-split">
            <div>
              <p className="eyebrow">EDITOR'S CHECKLIST</p>
              <h2 id="event-form-note-title">
                좋은 이벤트는
                <br />
                일정부터 명확해요.
              </h2>
            </div>
            <div className="story-copy">
              <ul className="bullet-list">
                <li>고객이 혜택을 바로 이해하는 이름을 사용하세요.</li>
                <li>오픈과 종료 시각 사이에 충분한 참여 기간을 두세요.</li>
                <li>저장 후 연결 쿠폰을 별도로 등록하세요.</li>
              </ul>
            </div>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="event-fields-title">
        <div className="container container--form">
          <div className="section-head">
            <div>
              <p className="eyebrow">EVENT DETAILS</p>
              <h2 id="event-fields-title">이벤트 정보</h2>
            </div>
            <span className="required-note">
              <span aria-hidden="true">*</span> 필수 입력
            </span>
          </div>
          <DemoForm className="form-panel" message="이벤트 입력 내용을 저장했습니다.">
            <fieldset>
              <legend>기본 정보</legend>
              <div className="form-grid">
                <div className="field-group field-group--full">
                  <label htmlFor="event-name">
                    이벤트 이름 <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="event-name"
                    name="name"
                    type="text"
                    defaultValue="가을 입맛 찾기"
                    maxLength={100}
                    aria-describedby="event-name-help"
                    required
                  />
                  <small id="event-name-help">목록과 상세 화면에 함께 표시됩니다.</small>
                </div>
                <div className="field-group field-group--full">
                  <label htmlFor="event-description">
                    이벤트 설명 <span aria-hidden="true">*</span>
                  </label>
                  <textarea
                    id="event-description"
                    name="description"
                    rows={5}
                    maxLength={500}
                    aria-describedby="event-description-help"
                    defaultValue="환절기 반려동물의 입맛을 위한 사료와 영양 간식 할인 이벤트입니다."
                    required
                  />
                  <small id="event-description-help">혜택과 참여 방법을 간결하게 설명해 주세요.</small>
                </div>
              </div>
            </fieldset>
            <fieldset>
              <legend>공개 일정</legend>
              <div className="form-grid">
                <div className="field-group">
                  <label htmlFor="event-open-at">
                    오픈 시각 <span aria-hidden="true">*</span>
                  </label>
                  <input id="event-open-at" name="openAt" type="datetime-local" defaultValue="2026-09-01T09:00" required />
                </div>
                <div className="field-group">
                  <label htmlFor="event-close-at">
                    종료 시각 <span aria-hidden="true">*</span>
                  </label>
                  <input id="event-close-at" name="closeAt" type="datetime-local" defaultValue="2026-09-14T23:59" required />
                </div>
              </div>
            </fieldset>
            <aside className="form-note">
              <strong>저장 후 상태</strong>
              <p>새 이벤트는 예정 상태로 저장되며, 연결할 쿠폰은 쿠폰 등록 화면에서 추가할 수 있습니다.</p>
            </aside>
            <div className="form-actions">
              <button className="button button--primary" type="submit">
                이벤트 저장
              </button>
              <Link className="button button--secondary" to="/admin/events">
                취소
              </Link>
            </div>
          </DemoForm>
        </div>
      </section>
    </>
  );
}
