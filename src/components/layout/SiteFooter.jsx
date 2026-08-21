import { Link } from 'react-router-dom';

export default function SiteFooter() {
  return (
    <footer className="site-footer footer">
      <div className="footer-inner footer-grid">
        <Link className="footer-brand" to="/">
          PetCoupon
        </Link>
        <nav className="footer-nav" aria-label="푸터 영역">
          <Link className="footer-nav__link" to="/">
            서비스
          </Link>
          <Link className="footer-nav__link" to="/user">
            사용자
          </Link>
          <Link className="footer-nav__link" to="/admin">
            관리자
          </Link>
          <Link className="footer-nav__link" to="/internal/monitoring">
            내부 운영
          </Link>
        </nav>
        <p className="footer-meta">© {new Date().getFullYear()} PetCoupon</p>
      </div>
    </footer>
  );
}
