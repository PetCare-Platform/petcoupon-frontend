import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout.jsx'
import PublicLayout from './layouts/PublicLayout.jsx'
import LandingPage from './pages/LandingPage.jsx'
import CouponsPage from './pages/CouponsPage.jsx'
import MyCouponsPage from './pages/MyCouponsPage.jsx'
import EventsPage from './pages/EventsPage.jsx'
import EventDetailPage from './pages/EventDetailPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import AdminCouponEventPage from './pages/AdminCouponEventPage.jsx'
import PlaceholderPage from './pages/PlaceholderPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route element={<PublicLayout />}>
          <Route path="/coupons" element={<CouponsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:eventId" element={<EventDetailPage />} />
        </Route>

        <Route element={<PublicLayout blobs={false} />}>
          <Route path="/my-coupons" element={<MyCouponsPage />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="coupons" element={<AdminCouponEventPage />} />
          <Route path="batch" element={<PlaceholderPage title="만료 배치" />} />
          <Route
            path="consistency"
            element={<PlaceholderPage title="정합성 로그" />}
          />
          <Route
            path="system"
            element={<PlaceholderPage title="시스템 상태" />}
          />
          <Route path="settings" element={<PlaceholderPage title="설정" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
