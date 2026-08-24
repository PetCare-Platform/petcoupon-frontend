import { IconGift } from '@tabler/icons-react'
import styles from './EventBanner.module.css'

// tone: 'sub' | 'closed'
function EventBanner({ status, title, dateRange, tone, onClick }) {
  return (
    <button
      type="button"
      className={`${styles.banner} ${tone === 'closed' ? styles.bannerClosed : ''}`}
      onClick={onClick}
    >
      <IconGift className={styles.watermark} aria-hidden="true" />
      <div className={styles.content}>
        <span className={styles.status}>{status}</span>
        <p className={styles.title}>{title}</p>
        <p className={styles.dateRange}>{dateRange}</p>
      </div>
    </button>
  )
}

export default EventBanner
