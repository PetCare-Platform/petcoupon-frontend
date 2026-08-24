import { Link, Outlet } from 'react-router-dom'
import { IconTicket } from '@tabler/icons-react'
import PublicNav from '../components/layout/PublicNav.jsx'
import styles from './PublicLayout.module.css'

// blobs: 배경에 랜딩 페이지와 같은 블롭을 깔지 여부. 내 쿠폰함처럼 목록 위주 화면은 끈다.
function PublicLayout({ blobs = true }) {
  return (
    <div className={`${styles.page} ${blobs ? styles.pageWithBlobs : ''}`}>
      {blobs && (
        <div className={styles.blobLayer} aria-hidden="true">
          <div className={`${styles.blob} ${styles.blobSub}`} />
          <div className={`${styles.blob} ${styles.blobAccent}`} />
          <div className={`${styles.blob} ${styles.blobCare}`} />
        </div>
      )}

      <PublicNav />

      <main className={styles.content}>
        <Outlet />
      </main>

      <Link to="/my-coupons" className={styles.myCouponsButton}>
        <IconTicket size={16} stroke={1.75} />
        내 쿠폰함
      </Link>
    </div>
  )
}

export default PublicLayout
