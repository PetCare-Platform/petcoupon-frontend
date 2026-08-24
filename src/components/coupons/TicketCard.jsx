import { IconPaw, IconTicket } from '@tabler/icons-react'
import { BAR_WIDTHS } from './barcodePattern.js'
import styles from './TicketCard.module.css'

const TONE_CLASS = {
  brand: styles.toneBrand,
  accent: styles.toneAccent,
  care: styles.toneCare,
  closed: styles.toneClosed,
}

// tone: 'brand' | 'accent' | 'care' | 'closed'
function TicketCard({ category, badge, discountLabel, remainingText, Icon, barcodeNumber, ctaLabel, tone, disabled }) {
  return (
    <div className={styles.card}>
      <div className={`${styles.panel} ${TONE_CLASS[tone]}`}>
        <IconPaw className={styles.pawWatermark} aria-hidden="true" />
        {Icon && <Icon className={styles.iconWatermark} aria-hidden="true" />}
        <IconPaw className={styles.pawSmallA} aria-hidden="true" />
        <IconPaw className={styles.pawSmallB} aria-hidden="true" />

        <p className={styles.brandName}>PetCare+</p>
        <p className={styles.category}>{category}</p>
        <p className={styles.discount}>{discountLabel}</p>
        <div className={styles.badge}>
          <span>{badge}</span>
        </div>
        <p className={styles.remaining}>{remainingText}</p>
      </div>

      <div className={styles.perforation}>
        <span className={`${styles.notch} ${styles.notchTop}`} />
        <span className={`${styles.notch} ${styles.notchBottom}`} />
        <span className={styles.dashedLine} />
      </div>

      <div className={styles.stub}>
        <button className={styles.ctaButton} type="button" disabled={disabled}>
          {ctaLabel}
        </button>
        <IconTicket className={styles.stubIcon} aria-hidden="true" />
        <div className={styles.barcode}>
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
        </div>
      </div>
    </div>
  )
}

export default TicketCard
