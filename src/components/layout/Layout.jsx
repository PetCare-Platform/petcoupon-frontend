import { Outlet } from 'react-router-dom';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';
import Marquee from './Marquee';

export default function Layout({ area }) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        본문으로 건너뛰기
      </a>
      <SiteHeader area={area} />
      <Marquee />
      <main id="main-content" className="page-shell" tabIndex={-1}>
        <Outlet />
      </main>
      <SiteFooter />
    </>
  );
}
