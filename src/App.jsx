import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/layout/Layout';
import ScrollToTop from './components/layout/ScrollToTop';

import Home from './pages/public/Home';
import EventDetail from './pages/public/EventDetail';
import UserProfile from './pages/user/UserProfile';
import MyCoupons from './pages/user/MyCoupons';
import CouponDetail from './pages/user/CouponDetail';
import AdminHome from './pages/admin/AdminHome';
import AdminEvents from './pages/admin/AdminEvents';
import AdminEventForm from './pages/admin/AdminEventForm';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminCouponForm from './pages/admin/AdminCouponForm';
import Monitoring from './pages/internal/Monitoring';
import Issues from './pages/internal/Issues';
import Failures from './pages/internal/Failures';
import Verification from './pages/internal/Verification';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout area="public" />}>
            <Route path="/" element={<Home />} />
            <Route path="/event-detail" element={<EventDetail />} />
          </Route>
          <Route element={<Layout area="user" />}>
            <Route path="/user" element={<UserProfile />} />
            <Route path="/user/my-coupons" element={<MyCoupons />} />
            <Route path="/user/coupon-detail" element={<CouponDetail />} />
          </Route>
          <Route element={<Layout area="admin" />}>
            <Route path="/admin" element={<AdminHome />} />
            <Route path="/admin/events" element={<AdminEvents />} />
            <Route path="/admin/event-form" element={<AdminEventForm />} />
            <Route path="/admin/coupons" element={<AdminCoupons />} />
            <Route path="/admin/coupon-form" element={<AdminCouponForm />} />
          </Route>
          <Route element={<Layout area="internal" />}>
            <Route path="/internal/monitoring" element={<Monitoring />} />
            <Route path="/internal/issues" element={<Issues />} />
            <Route path="/internal/failures" element={<Failures />} />
            <Route path="/internal/verification" element={<Verification />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
