import { Link } from 'react-router-dom'
import {
  IconBone,
  IconMapPinFilled,
  IconBowl,
  IconPaw,
  IconCut,
  IconVaccine,
  IconShoppingBag,
  IconTicket,
} from '@tabler/icons-react'
import styles from './LandingPage.module.css'

const NAV_LINKS = [
  { label: '서비스 소개', to: null },
  { label: '쿠폰', to: '/coupons' },
  { label: '이벤트', to: '/events' },
  { label: '고객센터', to: null },
  { label: 'FAQ', to: null },
]

// TODO: 목업 데이터. 실제 진행 중인 쿠폰 API 연동 시 교체.
const FEATURED_COUPONS = [
  {
    key: 'grooming',
    label: '미용 쿠폰',
    title: '5,000원 할인',
    detail: '8/31까지 · 선착순 200명',
    Icon: IconCut,
    tone: 'accent',
    rotate: -8,
    top: 150,
    left: 60,
  },
  {
    key: 'checkup',
    label: '건강검진 쿠폰',
    title: '20% 할인',
    detail: '9/10까지 · 선착순 100명',
    Icon: IconVaccine,
    tone: 'brand',
    rotate: 6,
    top: 80,
    left: 250,
  },
  {
    key: 'food',
    label: '사료 쿠폰',
    title: '3,000원 할인',
    detail: '상시 · 재고 84개',
    Icon: IconShoppingBag,
    tone: 'care',
    rotate: -3,
    top: 250,
    left: 210,
  },
]

function LandingPage() {
  return (
    <div className={styles.page}>
      <div className={styles.blobLayer} aria-hidden="true">
        <div className={`${styles.blob} ${styles.blobSub}`} />
        <div className={`${styles.blob} ${styles.blobAccent}`} />
        <div className={`${styles.blob} ${styles.blobCare}`} />
      </div>

      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.logo}>
            <span>PetCare</span>
            <span className={styles.logoPlus}>+</span>
          </div>
          <div className={styles.navLinks}>
            {NAV_LINKS.map(({ label, to }) =>
              to ? (
                <Link key={label} to={to} className={styles.navLink}>
                  {label}
                </Link>
              ) : (
                <span key={label}>{label}</span>
              ),
            )}
          </div>
        </div>
      </nav>

      <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.headline}>반려동물 라이프의 모든 것,</p>
          <p className={styles.brandName}>PetCare+</p>
          <p className={styles.subtext}>
            건강 관리, 병원 정보, 사료 추천부터 알뜰한 혜택까지
          </p>
          <div className={styles.ctaRow}>
            <Link to="/coupons" className={styles.primaryButton}>
              지금 쿠폰 받기
            </Link>
            <Link to="/events" className={styles.secondaryButton}>
              이벤트 둘러보기
            </Link>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <IconBone className={styles.floatIcon} style={{ top: 10, left: 120, color: '#D4B896' }} size={34} stroke={1.5} />
          <IconMapPinFilled className={styles.floatIcon} style={{ top: 70, left: 30, color: 'var(--pc-brand)' }} size={26} />
          <IconBowl className={styles.floatIcon} style={{ top: 20, right: 40, color: 'var(--pc-sub)' }} size={30} stroke={1.5} />
          <IconPaw className={styles.floatIcon} style={{ bottom: 40, left: 0, color: 'var(--pc-care)' }} size={28} stroke={1.5} />

          {FEATURED_COUPONS.map(({ key, label, title, detail, Icon, tone, rotate, top, left }) => (
            <div
              key={key}
              className={styles.couponCard}
              style={{ top, left, transform: `rotate(${rotate}deg)` }}
            >
              <div className={styles.couponHead}>
                <div className={`${styles.couponIcon} ${styles[`tone_${tone}`]}`}>
                  <Icon size={15} stroke={1.75} />
                </div>
                <span className={styles.couponLabel}>{label}</span>
              </div>
              <p className={styles.couponTitle}>{title}</p>
              <p className={styles.couponDetail}>{detail}</p>
            </div>
          ))}
        </div>
      </div>
      </div>

      <Link to="/my-coupons" className={styles.myCouponsButton}>
        <IconTicket size={16} stroke={1.75} />
        내 쿠폰함
      </Link>
    </div>
  )
}

export default LandingPage
