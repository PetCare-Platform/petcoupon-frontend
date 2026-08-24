import styles from './FailureTable.module.css'

// rows: [{ couponId, type: 'FAILED' | 'RETRY', reason, time }]
function FailureTable({ title, rows }) {
  return (
    <div className={styles.wrap}>
      <p className={styles.title}>{title}</p>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>쿠폰ID</th>
            <th>유형</th>
            <th>사유</th>
            <th className={styles.right}>시각</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.couponId}>
              <td>#{row.couponId}</td>
              <td
                className={row.type === 'FAILED' ? styles.typeDanger : styles.typeWarning}
              >
                {row.type}
              </td>
              <td className={styles.reason}>{row.reason}</td>
              <td className={styles.right}>{row.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default FailureTable
