import styles from './TicketRow.module.css'

const TONE_CLASS = {
  brand: styles.toneBrand,
  accent: styles.toneAccent,
  care: styles.toneCare,
  closed: styles.toneClosed,
}

// tone: 'brand' | 'accent' | 'care' | 'closed'
// action: { type: 'button', label, onClick } | { type: 'text', label }
function TicketRow({ Icon, tone, title, detail, action, muted }) {
  return (
    <div className={`${styles.row} ${muted ? styles.rowMuted : ''}`}>
      <div className={`${styles.cap} ${TONE_CLASS[tone]}`}>
        {Icon && <Icon size={20} stroke={1.75} className={styles.capIcon} />}
      </div>
      <div className={styles.body}>
        <div>
          <p className={styles.title}>{title}</p>
          <p className={styles.detail}>{detail}</p>
        </div>
        {action.type === 'button' ? (
          <button
            className={`${styles.actionButton} ${TONE_CLASS[tone]}`}
            type="button"
            onClick={action.onClick}
          >
            {action.label}
          </button>
        ) : (
          <span className={styles.actionText}>{action.label}</span>
        )}
      </div>
    </div>
  )
}

export default TicketRow
