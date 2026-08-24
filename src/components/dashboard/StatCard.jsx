import styles from './StatCard.module.css'

// tone: 'brand' | 'sub' | 'accent' | 'care' | 'neutral' | 'surface'
function StatCard({ label, value, tone = 'surface' }) {
  return (
    <div className={`${styles.card} ${styles[tone]}`}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
    </div>
  )
}

export default StatCard
