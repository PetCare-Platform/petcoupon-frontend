import { IconX, IconPaw } from '@tabler/icons-react'
import { BAR_WIDTHS } from './barcodePattern.js'
import styles from './CouponUseModal.module.css'

const TONE_CLASS = {
  brand: styles.toneBrand,
  accent: styles.toneAccent,
  care: styles.toneCare,
}

function CouponUseModal({ coupon, onClose, onMarkUsed }) {
  const { category, discountLabel, detail, Icon, tone, barcodeNumber } = coupon

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} type="button" onClick={onClose} aria-label="닫기">
          <IconX size={16} stroke={1.75} />
        </button>

        <div className={`${styles.panel} ${TONE_CLASS[tone]}`}>
          <IconPaw className={styles.pawWatermark} aria-hidden="true" />
          {Icon && <Icon className={styles.iconWatermark} aria-hidden="true" />}

          <p className={styles.brandName}>PetCare+</p>
          <p className={styles.category}>{category}</p>
          <p className={styles.discount}>{discountLabel}</p>
          <div className={styles.badge}>
            <span>{detail}</span>
          </div>
        </div>

        <div className={styles.perforation}>
          <span className={`${styles.notch} ${styles.notchLeft}`} />
          <span className={`${styles.notch} ${styles.notchRight}`} />
          <span className={styles.dashedLine} />
        </div>

        <div className={styles.stub}>
          <div className={styles.barcodeBars}>
            {BAR_WIDTHS.map((width, i) => (
              <div
                key={i}
                className={i % 2 === 0 ? styles.barBlack : styles.barWhite}
                style={{ flexGrow: width, flexBasis: 0 }}
              />
            ))}
          </div>
          <p className={styles.barcodeNumber}>{barcodeNumber}</p>
          <p className={styles.hint}>매장에서 이 화면을 보여주세요</p>
          <button className={styles.markUsedButton} type="button" onClick={onMarkUsed}>
            사용 완료로 표시
          </button>
        </div>
      </div>
    </div>
  )
}

export default CouponUseModal
