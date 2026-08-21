import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { GLOBAL_NAV, AREA_NAV } from '../../config/nav';

export default function SiteHeader({ area }) {
  const [isOpen, setIsOpen] = useState(false);
  const areaConfig = AREA_NAV[area];

  function closeOnLinkClick(event) {
    if (event.target.closest('a[href]')) setIsOpen(false);
  }

  useEffect(() => {
    document.body.classList.toggle('nav-open', isOpen);
    return () => document.body.classList.remove('nav-open');
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    function onKeyDown(event) {
      if (event.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  return (
    <header className={`site-header top-nav is-enhanced${isOpen ? ' is-open' : ''}`}>
      <div className="nav-inner">
        <NavLink className="brand" to="/" aria-label="PetCoupon 홈">
          PetCoupon
        </NavLink>
        <span className="prototype-badge" aria-label="프로토타입 화면">
          PROTOTYPE
        </span>
        <div className={`nav-panel${isOpen ? ' is-open' : ''}`} id="site-navigation" onClick={closeOnLinkClick}>
          <div className="nav-links">
            <nav className="global-nav" aria-label="전체 영역">
              {GLOBAL_NAV.map((item) => (
                <NavLink key={item.to} className="global-nav__link" to={item.to} end>
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <nav className="area-nav section-nav" aria-label={`${areaConfig.label} 메뉴`}>
              <span className="area-nav__label">{areaConfig.label}</span>
              {areaConfig.links.map((item) => (
                <NavLink key={item.to} className="area-nav__link" to={item.to} end>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="nav-actions">
            <NavLink className="nav-action" to={areaConfig.homeHref}>
              {areaConfig.homeLabel}
            </NavLink>
          </div>
        </div>
        <button
          className="nav-toggle"
          type="button"
          aria-controls="site-navigation"
          aria-expanded={isOpen}
          aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
          onClick={() => setIsOpen((open) => !open)}
        >
          메뉴
        </button>
      </div>
    </header>
  );
}
