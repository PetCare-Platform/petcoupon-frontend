import { useState } from 'react'
import { IconBone, IconPaw, IconVaccine, IconCut, IconShoppingBag } from '@tabler/icons-react'
import CouponUseModal from '../components/coupons/CouponUseModal.jsx'
import styles from './MyCouponsPage.module.css'

const TONE_ICON_CLASS = {
  brand: styles.iconBoxBrand,
  accent: styles.iconBoxAccent,
  care: styles.iconBoxCare,
}

const TABS = [
  { key: 'all', label: '전체' },
  { key: 'available', label: '사용가능' },
  { key: 'used', label: '사용완료' },
  { key: 'expired', label: '만료' },
]

// TODO: 목업 데이터. GET /me/coupon-issues API 연동 시 교체.
const INITIAL_COUPONS = [
  {
    key: 'checkup',
    status: 'available',
    tone: 'brand',
    Icon: IconVaccine,
    category: '건강검진 쿠폰',
    discountLabel: '20% 할인',
    detail: '9/10까지 사용 가능',
    barcodeNumber: '2471 0365 9871 4569 8',
  },
  {
    key: 'grooming',
    status: 'used',
    tone: 'accent',
    Icon: IconCut,
    category: '미용 쿠폰',
    discountLabel: '5,000원 할인',
    detail: '7/30 사용 완료',
    barcodeNumber: '3358 2147 0912 3456 7',
  },
  {
    key: 'food',
    status: 'expired',
    tone: 'care',
    Icon: IconShoppingBag,
    category: '사료 쿠폰',
    discountLabel: '3,000원 할인',
    detail: '7/1 기한 만료',
    barcodeNumber: '9042 7618 3512 7890 4',
  },
]

const STATUS_LABEL = {
  used: '사용완료',
  expired: '만료',
}


function MyCouponsPage() {
  const [coupons, setCoupons] = useState(INITIAL_COUPONS)
  const [activeTab, setActiveTab] = useState('all')
  const [openCouponKey, setOpenCouponKey] = useState(null)

  const visibleCoupons =
    activeTab === 'all' ? coupons : coupons.filter((c) => c.status === activeTab)
  const availableCount = coupons.filter((c) => c.status === 'available').length
  const openCoupon = coupons.find((c) => c.key === openCouponKey) ?? null

  function markUsed() {
    setCoupons((prev) =>
      prev.map((c) =>
        c.key === openCouponKey ? { ...c, status: 'used', detail: '오늘 사용 완료' } : c,
      ),
    )
    setOpenCouponKey(null)
  }

  return (
    <div className={styles.page}>
      <IconBone className={styles.decoBone} aria-hidden="true" />
      <IconPaw className={styles.decoPaw} aria-hidden="true" />

      <div className={styles.panel}>
        <IconPaw className={styles.panelDeco} aria-hidden="true" />

        <p className={styles.title}>내 쿠폰함</p>
        <p className={styles.summary}>사용 가능한 쿠폰 {availableCount}장</p>

        <div className={styles.tabs}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={activeTab === tab.key ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.list}>
          {visibleCoupons.map(({ key, status, tone, Icon, category, discountLabel, detail }) => (
            <div
              key={key}
              className={`${styles.row} ${status !== 'available' ? styles.rowMuted : ''}`}
            >
              <div
                className={`${styles.iconBox} ${
                  status === 'available' ? TONE_ICON_CLASS[tone] : styles.iconBoxMuted
                }`}
              >
                <Icon size={18} stroke={1.75} />
              </div>
              <div className={styles.rowBody}>
                <p className={styles.rowTitle}>
                  {category} {discountLabel}
                </p>
                <p className={styles.rowDetail}>{detail}</p>
              </div>
              {status === 'available' ? (
                <button
                  className={styles.useButton}
                  type="button"
                  onClick={() => setOpenCouponKey(key)}
                >
                  사용하기
                </button>
              ) : (
                <span className={styles.rowStatus}>{STATUS_LABEL[status]}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {openCoupon && (
        <CouponUseModal
          coupon={openCoupon}
          onClose={() => setOpenCouponKey(null)}
          onMarkUsed={markUsed}
        />
      )}
    </div>
  )
}

export default MyCouponsPage
