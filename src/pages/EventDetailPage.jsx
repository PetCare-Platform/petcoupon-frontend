import { useNavigate } from 'react-router-dom'
import { IconArrowLeft, IconGift, IconPaw, IconVaccine, IconStethoscope, IconHeartPlus } from '@tabler/icons-react'
import TicketRow from '../components/coupons/TicketRow.jsx'
import styles from './EventDetailPage.module.css'

// TODO: 목업 데이터. eventId로 GET /events/{id} 연동 시 교체.
const EVENT_COUPONS = [
  {
    key: 'checkup',
    Icon: IconVaccine,
    tone: 'brand',
    title: '건강검진 20% 할인',
    detail: '10:00 오픈 · 28명 남음 / 100명',
    action: { type: 'button', label: '다운로드' },
    muted: false,
  },
  {
    key: 'treatment',
    Icon: IconStethoscope,
    tone: 'closed',
    title: '진료비 10% 할인',
    detail: '14:00 오픈 예정 · 150명 한정',
    action: { type: 'text', label: '대기중' },
    muted: true,
  },
  {
    key: 'fullset',
    Icon: IconHeartPlus,
    tone: 'closed',
    title: '종합검진 세트 15% 할인',
    detail: '20:00 오픈 예정 · 80명 한정',
    action: { type: 'text', label: '대기중' },
    muted: true,
  },
]

function EventDetailPage() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <button className={styles.backLink} type="button" onClick={() => navigate('/events')}>
        <IconArrowLeft size={14} stroke={1.75} />
        이벤트 목록으로
      </button>

      <div className={styles.banner}>
        <IconGift className={styles.watermark} aria-hidden="true" />
        <IconPaw className={styles.pawDeco} aria-hidden="true" />
        <span className={styles.status}>진행중</span>
        <p className={styles.title}>가을맞이 건강검진 위크</p>
        <p className={styles.dateRange}>2026.09.01 - 2026.09.10</p>
        <p className={styles.description}>
          쌀쌀해지는 환절기, 우리 아이 건강검진 챙기셨나요?
          <br />
          기간 중 매일 오전 10시, 오후 2시, 오후 8시에 쿠폰이 순차로 열립니다.
        </p>
      </div>

      <div className={styles.listHeader}>
        <p className={styles.listTitle}>이 이벤트의 쿠폰</p>
        <span className={styles.countdown}>다음 오픈까지 00:42:17</span>
      </div>

      <div className={styles.list}>
        {EVENT_COUPONS.map(({ key, ...row }) => (
          <TicketRow key={key} {...row} />
        ))}
      </div>
    </div>
  )
}

export default EventDetailPage
