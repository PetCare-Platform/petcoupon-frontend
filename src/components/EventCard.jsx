import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export default function EventCard({ statusLabel, statusClassName, label, title, description, period, benefit, href, cta }) {
  return (
    <article className="hairline-card event-card">
      <div className="card-topline">
        <StatusBadge className={statusClassName}>{statusLabel}</StatusBadge>
        <span className="caption">{label}</span>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <dl className="card-facts">
        <div>
          <dt>기간</dt>
          <dd>{period}</dd>
        </div>
        <div>
          <dt>대표 혜택</dt>
          <dd>{benefit}</dd>
        </div>
      </dl>
      <Link className="card-link" to={href}>
        {cta} <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
