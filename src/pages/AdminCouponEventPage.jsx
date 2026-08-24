import { useState } from 'react'
import { IconPlus, IconTicket, IconChevronDown, IconChevronUp } from '@tabler/icons-react'
import styles from './AdminCouponEventPage.module.css'

// 백엔드 DTO와 필드명을 맞춰뒀다 (EventCreateRequest / CouponCreateRequest).
// 지금은 로컬 상태만 바꾸는 목업이고, 나중에 실제 API 연동 시 이 필드 그대로 body에 실으면 된다.
const EMPTY_EVENT_FORM = {
  name: '',
  description: '',
  openAt: '',
  closeAt: '',
}

const EMPTY_COUPON_FORM = {
  name: '',
  discountType: 'FIXED_AMOUNT',
  discountValue: '',
  minOrderAmount: '',
  maxDiscountAmount: '',
  issueStartAt: '',
  issueEndAt: '',
  validDays: '',
  totalQuantity: '',
}

let nextEventId = 1
let nextCouponId = 1

function AdminCouponEventPage() {
  const [events, setEvents] = useState([])
  const [eventForm, setEventForm] = useState(EMPTY_EVENT_FORM)
  const [eventFormError, setEventFormError] = useState(null)

  const [openCouponFormFor, setOpenCouponFormFor] = useState(null)
  const [couponForm, setCouponForm] = useState(EMPTY_COUPON_FORM)
  const [couponFormError, setCouponFormError] = useState(null)

  function handleCreateEvent(e) {
    e.preventDefault()
    if (!eventForm.name || !eventForm.openAt || !eventForm.closeAt) {
      setEventFormError('이벤트명, 오픈 일시, 마감 일시는 필수입니다.')
      return
    }
    if (eventForm.openAt >= eventForm.closeAt) {
      setEventFormError('마감 일시는 오픈 일시보다 늦어야 합니다.')
      return
    }
    setEventFormError(null)
    setEvents((prev) => [
      ...prev,
      {
        eventId: nextEventId++,
        name: eventForm.name,
        description: eventForm.description,
        openAt: eventForm.openAt,
        closeAt: eventForm.closeAt,
        status: 'SCHEDULED',
        coupons: [],
      },
    ])
    setEventForm(EMPTY_EVENT_FORM)
  }

  function handleCreateCoupon(e, eventId) {
    e.preventDefault()
    const required = [
      'name',
      'discountValue',
      'minOrderAmount',
      'issueStartAt',
      'issueEndAt',
      'validDays',
      'totalQuantity',
    ]
    if (required.some((field) => !couponForm[field])) {
      setCouponFormError('선택 항목(최대 할인 금액)을 제외한 모든 값을 입력해주세요.')
      return
    }
    setCouponFormError(null)
    setEvents((prev) =>
      prev.map((event) =>
        event.eventId === eventId
          ? {
              ...event,
              coupons: [
                ...event.coupons,
                {
                  couponId: nextCouponId++,
                  eventId,
                  name: couponForm.name,
                  discountType: couponForm.discountType,
                  discountValue: Number(couponForm.discountValue),
                  minOrderAmount: Number(couponForm.minOrderAmount),
                  maxDiscountAmount: couponForm.maxDiscountAmount
                    ? Number(couponForm.maxDiscountAmount)
                    : null,
                  issueStartAt: couponForm.issueStartAt,
                  issueEndAt: couponForm.issueEndAt,
                  validDays: Number(couponForm.validDays),
                  totalQuantity: Number(couponForm.totalQuantity),
                  status: 'READY',
                },
              ],
            }
          : event,
      ),
    )
    setCouponForm(EMPTY_COUPON_FORM)
    setOpenCouponFormFor(null)
  }

  return (
    <div>
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>쿠폰·이벤트 생성</h1>
          <p className={styles.pageSubtitle}>
            아직 API 연동 전 목업입니다 · 필드는 백엔드 요청 형식과 동일하게 맞춰뒀어요
          </p>
        </div>
      </header>

      <div className={styles.card}>
        <p className={styles.cardTitle}>새 이벤트 만들기</p>
        <form className={styles.form} onSubmit={handleCreateEvent}>
          <div className={styles.formRow}>
            <label className={styles.field}>
              <span>이벤트명</span>
              <input
                type="text"
                value={eventForm.name}
                onChange={(e) => setEventForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="가을맞이 건강검진 위크"
              />
            </label>
          </div>
          <div className={styles.formRow}>
            <label className={styles.field}>
              <span>설명 (선택)</span>
              <input
                type="text"
                value={eventForm.description}
                onChange={(e) => setEventForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="쿠폰이 순차로 열리는 이벤트입니다"
              />
            </label>
          </div>
          <div className={styles.formRow}>
            <label className={styles.field}>
              <span>오픈 일시</span>
              <input
                type="datetime-local"
                value={eventForm.openAt}
                onChange={(e) => setEventForm((f) => ({ ...f, openAt: e.target.value }))}
              />
            </label>
            <label className={styles.field}>
              <span>마감 일시</span>
              <input
                type="datetime-local"
                value={eventForm.closeAt}
                onChange={(e) => setEventForm((f) => ({ ...f, closeAt: e.target.value }))}
              />
            </label>
          </div>
          {eventFormError && <p className={styles.formError}>{eventFormError}</p>}
          <button className={styles.submitButton} type="submit">
            <IconPlus size={14} stroke={1.75} />
            이벤트 생성
          </button>
        </form>
      </div>

      <div className={styles.card}>
        <p className={styles.cardTitle}>생성된 이벤트 ({events.length})</p>

        {events.length === 0 ? (
          <p className={styles.emptyState}>아직 만든 이벤트가 없습니다.</p>
        ) : (
          <div className={styles.eventList}>
            {events.map((event) => (
              <div key={event.eventId} className={styles.eventItem}>
                <div className={styles.eventHead}>
                  <div>
                    <p className={styles.eventName}>{event.name}</p>
                    <p className={styles.eventMeta}>
                      {event.openAt.replace('T', ' ')} ~ {event.closeAt.replace('T', ' ')} ·{' '}
                      {event.status} · 쿠폰 {event.coupons.length}개
                    </p>
                  </div>
                  <button
                    className={styles.toggleButton}
                    type="button"
                    onClick={() =>
                      setOpenCouponFormFor((prev) =>
                        prev === event.eventId ? null : event.eventId,
                      )
                    }
                  >
                    <IconTicket size={14} stroke={1.75} />
                    쿠폰 추가
                    {openCouponFormFor === event.eventId ? (
                      <IconChevronUp size={14} stroke={1.75} />
                    ) : (
                      <IconChevronDown size={14} stroke={1.75} />
                    )}
                  </button>
                </div>

                {event.coupons.length > 0 && (
                  <div className={styles.couponTable}>
                    <div className={styles.couponTableHead}>
                      <span>쿠폰명</span>
                      <span>할인</span>
                      <span>최소주문</span>
                      <span>유효기간</span>
                      <span>수량</span>
                      <span>상태</span>
                    </div>
                    {event.coupons.map((c) => (
                      <div key={c.couponId} className={styles.couponRow}>
                        <span>{c.name}</span>
                        <span>
                          {c.discountType === 'FIXED_AMOUNT'
                            ? `${c.discountValue.toLocaleString()}원`
                            : `${c.discountValue}%`}
                        </span>
                        <span>{c.minOrderAmount.toLocaleString()}원</span>
                        <span>{c.validDays}일</span>
                        <span>{c.totalQuantity.toLocaleString()}개</span>
                        <span className={styles.couponStatus}>{c.status}</span>
                      </div>
                    ))}
                  </div>
                )}

                {openCouponFormFor === event.eventId && (
                  <form
                    className={styles.form}
                    onSubmit={(e) => handleCreateCoupon(e, event.eventId)}
                  >
                    <div className={styles.formRow}>
                      <label className={styles.field}>
                        <span>쿠폰명</span>
                        <input
                          type="text"
                          value={couponForm.name}
                          onChange={(e) =>
                            setCouponForm((f) => ({ ...f, name: e.target.value }))
                          }
                          placeholder="건강검진 20% 할인"
                        />
                      </label>
                      <label className={styles.field}>
                        <span>할인 방식</span>
                        <select
                          value={couponForm.discountType}
                          onChange={(e) =>
                            setCouponForm((f) => ({ ...f, discountType: e.target.value }))
                          }
                        >
                          <option value="FIXED_AMOUNT">정액 할인</option>
                          <option value="RATE">정률 할인</option>
                        </select>
                      </label>
                    </div>
                    <div className={styles.formRow}>
                      <label className={styles.field}>
                        <span>할인값 {couponForm.discountType === 'RATE' ? '(%)' : '(원)'}</span>
                        <input
                          type="number"
                          min="1"
                          value={couponForm.discountValue}
                          onChange={(e) =>
                            setCouponForm((f) => ({ ...f, discountValue: e.target.value }))
                          }
                        />
                      </label>
                      <label className={styles.field}>
                        <span>최소 주문 금액</span>
                        <input
                          type="number"
                          min="0"
                          value={couponForm.minOrderAmount}
                          onChange={(e) =>
                            setCouponForm((f) => ({ ...f, minOrderAmount: e.target.value }))
                          }
                        />
                      </label>
                      <label className={styles.field}>
                        <span>최대 할인 금액 (선택)</span>
                        <input
                          type="number"
                          min="1"
                          value={couponForm.maxDiscountAmount}
                          onChange={(e) =>
                            setCouponForm((f) => ({ ...f, maxDiscountAmount: e.target.value }))
                          }
                        />
                      </label>
                    </div>
                    <div className={styles.formRow}>
                      <label className={styles.field}>
                        <span>발급 시작</span>
                        <input
                          type="datetime-local"
                          value={couponForm.issueStartAt}
                          onChange={(e) =>
                            setCouponForm((f) => ({ ...f, issueStartAt: e.target.value }))
                          }
                        />
                      </label>
                      <label className={styles.field}>
                        <span>발급 종료</span>
                        <input
                          type="datetime-local"
                          value={couponForm.issueEndAt}
                          onChange={(e) =>
                            setCouponForm((f) => ({ ...f, issueEndAt: e.target.value }))
                          }
                        />
                      </label>
                    </div>
                    <div className={styles.formRow}>
                      <label className={styles.field}>
                        <span>사용 유효기간 (일)</span>
                        <input
                          type="number"
                          min="1"
                          value={couponForm.validDays}
                          onChange={(e) =>
                            setCouponForm((f) => ({ ...f, validDays: e.target.value }))
                          }
                        />
                      </label>
                      <label className={styles.field}>
                        <span>총 발급 수량</span>
                        <input
                          type="number"
                          min="1"
                          value={couponForm.totalQuantity}
                          onChange={(e) =>
                            setCouponForm((f) => ({ ...f, totalQuantity: e.target.value }))
                          }
                        />
                      </label>
                    </div>
                    {couponFormError && <p className={styles.formError}>{couponFormError}</p>}
                    <button className={styles.submitButton} type="submit">
                      <IconPlus size={14} stroke={1.75} />
                      쿠폰 추가
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCouponEventPage
