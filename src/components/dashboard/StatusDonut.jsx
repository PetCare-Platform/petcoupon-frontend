import styles from './StatusDonut.module.css'

// segments: [{ label, color, value }]  values are percentages (should sum to ~100)
function StatusDonut({ title, segments, totalValue, totalLabel }) {
  const offsets = segments.reduce((acc) => {
    const previous = acc.length === 0 ? 0 : acc[acc.length - 1] + segments[acc.length - 1].value
    acc.push(previous)
    return acc
  }, [])

  return (
    <div className={styles.wrap}>
      <p className={styles.title}>{title}</p>
      <div className={styles.body}>
        <svg viewBox="0 0 42 42" className={styles.svg}>
          <g transform="rotate(-90 21 21)">
            {segments.map((seg, i) => {
              const dashoffset = -offsets[i]
              return (
                <circle
                  key={seg.label}
                  cx="21"
                  cy="21"
                  r="15.5"
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth="6"
                  pathLength="100"
                  strokeDasharray={`${seg.value} ${100 - seg.value}`}
                  strokeDashoffset={dashoffset}
                />
              )
            })}
          </g>
        </svg>
        <div className={styles.legend}>
          {segments.map((seg) => (
            <span key={seg.label} className={styles.legendItem}>
              <span className={styles.dot} style={{ background: seg.color }} aria-hidden="true" />
              {seg.label} {seg.value}%
            </span>
          ))}
        </div>
      </div>
      <p className={styles.total}>
        {totalValue} <span className={styles.totalLabel}>{totalLabel}</span>
      </p>
    </div>
  )
}

export default StatusDonut
