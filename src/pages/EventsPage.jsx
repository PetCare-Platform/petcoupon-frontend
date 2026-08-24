import { useNavigate } from 'react-router-dom'
import EventBanner from '../components/events/EventBanner.jsx'
import styles from './EventsPage.module.css'

// TODO: 목업 데이터. GET /events API 연동 시 교체.
const EVENTS = [
  {
    key: 'autumn-checkup',
    id: 'autumn-checkup',
    status: '진행중',
    title: '가을맞이 건강검진 위크',
    dateRange: '9/1 - 9/10 · 쿠폰 3종 순차 오픈',
    tone: 'sub',
  },
  {
    key: 'welcome-pack',
    id: 'welcome-pack',
    status: '진행중',
    title: '신규 가입 웰컴 쿠폰팩',
    dateRange: '상시 · 가입 즉시 3종 지급',
    tone: 'sub',
  },
  {
    key: 'summer-grooming',
    id: 'summer-grooming',
    status: '종료',
    title: '여름 미용 페스티벌',
    dateRange: '7/20 - 7/31',
    tone: 'closed',
  },
]

function EventsPage() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <p className={styles.title}>이벤트</p>
      <div className={styles.list}>
        {EVENTS.map(({ key, id, ...banner }) => (
          <EventBanner key={key} {...banner} onClick={() => navigate(`/events/${id}`)} />
        ))}
      </div>
    </div>
  )
}

export default EventsPage
