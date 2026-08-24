import styles from './TrendChart.module.css'

const GRID_LINES = [10, 35, 60, 85]

// series: [{ label, color, points: number[] }]  points are y-values 0~100 (100 = top)
function TrendChart({ title, series, xLabels }) {
  const toPolyline = (points) =>
    points
      .map((y, i) => {
        const x = (i / (points.length - 1)) * 300
        return `${x},${100 - y}`
      })
      .join(' ')

  return (
    <div className={styles.wrap}>
      <p className={styles.title}>{title}</p>
      <svg viewBox="0 0 300 100" className={styles.svg}>
        {GRID_LINES.map((y) => (
          <line key={y} x1="0" y1={y} x2="300" y2={y} className={styles.gridLine} />
        ))}
        {series.map((s) => (
          <polyline
            key={s.label}
            points={toPolyline(s.points)}
            fill="none"
            stroke={s.color}
            strokeWidth="2"
          />
        ))}
      </svg>
      {xLabels && (
        <div className={styles.xAxis}>
          {xLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      )}
      <div className={styles.legend}>
        {series.map((s) => (
          <span key={s.label} className={styles.legendItem}>
            <span
              className={styles.dot}
              style={{ background: s.color }}
              aria-hidden="true"
            />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default TrendChart
