import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export default function CouponCard({
  statusLabel,
  statusClassName,
  label,
  event,
  title,
  benefit,
  condition,
  date,
  dateLabel,
  href,
  cta,
}) {
  return (
    <article className="hairline-card coupon-card">
      <div className="card-topline">
        <StatusBadge className={statusClassName}>{statusLabel}</StatusBadge>
        <span className="caption">{label}</span>
      </div>
      <p className="event-label">{event}</p>
      <h3>{title}</h3>
      <strong className="benefit">{benefit}</strong>
      <p>{condition}</p>
      <div className="card-bottom">
        <time dateTime={date}>{dateLabel}</time>
        <Link className="card-link" to={href}>
          {cta} →
        </Link>
      </div>
    </article>
  );
}
