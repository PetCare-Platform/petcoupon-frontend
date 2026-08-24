import { useState } from 'react'
import { Link } from 'react-router-dom'
import { IconVaccine, IconCut, IconShoppingBag, IconGift } from '@tabler/icons-react'
import TicketCard from '../components/coupons/TicketCard.jsx'
import styles from './CouponsPage.module.css'

const CATEGORIES = ['전체', '병원', '미용', '사료']
const VISIBLE_COUNT = 3

// TODO: 목업 데이터. GET /coupons API 연동 시 교체.
const COUPONS = [
  {
    key: 'checkup',
    group: '병원',
    category: '건강검진 쿠폰',
    badge: '9/10까지 · 선착순 100명',
    discountLabel: '20% 할인',
    remainingText: '28명 남음',
    Icon: IconVaccine,
    barcodeNumber: '2471036598',
    ctaLabel: '다운로드',
    tone: 'brand',
  },
  {
    key: 'grooming',
    group: '미용',
    category: '미용 쿠폰',
    badge: '8/31까지 · 선착순 200명',
    discountLabel: '5,000원 할인',
    remainingText: '61명 남음',
    Icon: IconCut,
    barcodeNumber: '3358214709',
    ctaLabel: '다운로드',
    tone: 'accent',
  },
  {
    key: 'food',
    group: '사료',
    category: '사료 쿠폰',
    badge: '상시 발급 · 재고 84개',
    discountLabel: '3,000원 할인',
    remainingText: '재고 84개',
    Icon: IconShoppingBag,
    barcodeNumber: '9042761835',
    ctaLabel: '다운로드',
    tone: 'care',
  },
  {
    key: 'hotel',
    group: '병원',
    category: '호텔링 쿠폰',
    badge: '마감',
    discountLabel: '10% 할인',
    remainingText: '200명 전원 소진',
    Icon: IconVaccine,
    barcodeNumber: '1123045896',
    ctaLabel: '마감됨',
    tone: 'closed',
    disabled: true,
  },
]

function CouponsPage() {
  const [activeCategory, setActiveCategory] = useState('전체')
  const [showAll, setShowAll] = useState(false)

  const filteredCoupons =
    activeCategory === '전체' ? COUPONS : COUPONS.filter((c) => c.group === activeCategory)
  const visibleCoupons = showAll ? filteredCoupons : filteredCoupons.slice(0, VISIBLE_COUNT)

  return (
    <div className={styles.page}>
      <Link to="/events" className={styles.promoBanner}>
        <IconGift className={styles.promoWatermark} aria-hidden="true" />
        <p className={styles.promoTitle}>가을맞이 건강검진 위크 진행중</p>
        <p className={styles.promoSubtext}>순차 오픈되는 쿠폰 더 받으러 가기 →</p>
      </Link>

      <div className={styles.header}>
        <p className={styles.title}>지금 받을 수 있는 쿠폰</p>
        <div className={styles.tabs}>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              className={category === activeCategory ? styles.tabActive : styles.tab}
              onClick={() => {
                setActiveCategory(category)
                setShowAll(false)
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.list}>
        {visibleCoupons.map(({ key, ...coupon }) => (
          <TicketCard key={key} {...coupon} />
        ))}
      </div>

      {!showAll && filteredCoupons.length > VISIBLE_COUNT && (
        <button className={styles.moreButton} type="button" onClick={() => setShowAll(true)}>
          쿠폰 더 보기
        </button>
      )}
    </div>
  )
}

export default CouponsPage
