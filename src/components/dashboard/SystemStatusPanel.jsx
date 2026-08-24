import { IconPointFilled } from '@tabler/icons-react'
import styles from './SystemStatusPanel.module.css'

// items: [{ name, status: 'HEALTHY' | 'UP' | 'DOWN' }]
function SystemStatusPanel({ title, items }) {
  return (
    <div className={styles.wrap}>
      <p className={styles.title}>{title}</p>
      <div className={styles.list}>
        {items.map((item) => (
          <div key={item.name} className={styles.row}>
            <span className={styles.name}>{item.name}</span>
            <span
              className={item.status === 'DOWN' ? styles.statusDown : styles.statusUp}
            >
              <IconPointFilled size={12} />
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SystemStatusPanel
