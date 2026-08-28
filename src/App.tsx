import { Route, Routes } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";

import Index from "./pages/public/Index";
import EventDetail from "./pages/public/EventDetail";
import NotFound from "./pages/public/NotFound";

import UserHome from "./pages/user/UserHome";
import MyCoupons from "./pages/user/MyCoupons";
import CouponDetail from "./pages/user/CouponDetail";

import AdminHome from "./pages/admin/AdminHome";
import Events from "./pages/admin/Events";
import EventForm from "./pages/admin/EventForm";
import Coupons from "./pages/admin/Coupons";
import CouponForm from "./pages/admin/CouponForm";
import AdminAuth from "./pages/admin/AdminAuth";

import Dashboard from "./pages/internal/Dashboard";
import Health from "./pages/internal/Health";
import Monitoring from "./pages/internal/Monitoring";
import Failures from "./pages/internal/Failures";
import Verification from "./pages/internal/Verification";
import RepoIssues from "./pages/internal/RepoIssues";
import LoadTestReset from "./pages/internal/LoadTestReset";

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/event-detail/:id" element={<EventDetail />} />

        <Route path="/user" element={<UserHome />} />
        <Route path="/user/my-coupons" element={<MyCoupons />} />
        <Route path="/user/coupon-detail" element={<CouponDetail />} />
        <Route path="/user/coupon-detail/:couponIssueId" element={<CouponDetail />} />

        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/auth" element={<AdminAuth />} />
        <Route path="/admin/events" element={<Events />} />
        <Route path="/admin/event-form" element={<EventForm />} />
        <Route path="/admin/event-form/:eventId" element={<EventForm />} />
        <Route path="/admin/coupons" element={<Coupons />} />
        <Route path="/admin/coupon-form" element={<CouponForm />} />
        <Route path="/admin/coupon-form/:eventId" element={<CouponForm />} />

        <Route path="/internal/dashboard" element={<Dashboard />} />
        <Route path="/internal/health" element={<Health />} />
        <Route path="/internal/monitoring" element={<Monitoring />} />
        <Route path="/internal/failures" element={<Failures />} />
        <Route path="/internal/verification" element={<Verification />} />
        <Route path="/internal/repo-issues" element={<RepoIssues />} />
        <Route path="/internal/load-test-reset" element={<LoadTestReset />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ToastProvider>
  );
}
