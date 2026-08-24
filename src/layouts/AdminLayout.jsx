import { NavLink, Outlet } from 'react-router-dom'
import {
  IconLayoutDashboard,
  IconTicket,
  IconClockHour4,
  IconListCheck,
  IconServer2,
  IconSettings,
} from '@tabler/icons-react'
import styles from './AdminLayout.module.css'

const NAV_ITEMS = [
  { to: '/admin', label: '대시보드', Icon: IconLayoutDashboard, end: true },
  { to: '/admin/coupons', label: '쿠폰 발급', Icon: IconTicket },
  { to: '/admin/batch', label: '만료 배치', Icon: IconClockHour4 },
  { to: '/admin/consistency', label: '정합성 로그', Icon: IconListCheck },
  { to: '/admin/system', label: '시스템 상태', Icon: IconServer2 },
  { to: '/admin/settings', label: '설정', Icon: IconSettings },
]

function AdminLayout() {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span>PetCare</span>
          <span className={styles.logoPlus}>+</span>
        </div>
        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                isActive ? `${styles.navItem} ${styles.navItemActive}` : styles.navItem
              }
            >
              <Icon size={16} stroke={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
