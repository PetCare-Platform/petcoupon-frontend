import { Link, NavLink } from 'react-router-dom'
import styles from './PublicNav.module.css'

const NAV_LINKS = [
  { label: '서비스 소개', to: null },
  { label: '쿠폰', to: '/coupons' },
  { label: '이벤트', to: '/events' },
  { label: '고객센터', to: null },
  { label: 'FAQ', to: null },
]

function PublicNav() {
  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>
        <span>PetCare</span>
        <span className={styles.logoPlus}>+</span>
      </Link>
      <div className={styles.navLinks}>
        {NAV_LINKS.map(({ label, to }) =>
          to ? (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
              }
            >
              {label}
            </NavLink>
          ) : (
            <span key={label}>{label}</span>
          ),
        )}
      </div>
    </nav>
  )
}

export default PublicNav
