import { readFileSync } from "node:fs";

const checks = [
  ["src/api/adminAuth.ts", "/admin/auth/sessions"],
  ["src/api/events.ts", "/admin/events"],
  ["src/api/events.ts", "/status"],
  ["src/api/coupons.ts", "/coupons/${couponId}/status"],
  ["src/api/couponIssues.ts", "/coupons/${couponId}/issues"],
  ["src/api/couponIssues.ts", "/coupon-issue-requests/status"],
  ["src/api/couponIssues.ts", "/coupon-issue-requests"],
  ["src/api/couponIssues.ts", "/coupon-issues/${couponIssueId}"],
  ["src/api/couponIssues.ts", "/status"],
  ["src/api/couponIssues.ts", "/use"],
  ["src/api/couponIssues.ts", "/cancel"],
  ["src/api/adminOperations.ts", "/admin/coupon-issue/dlq"],
  ["src/api/adminOperations.ts", "/reprocess"],
  ["src/api/adminOperations.ts", "/reconcile"],
  ["src/api/internal.ts", "/reset"],
  ["src/pages/admin/EventForm.tsx", "getEventStatus"],
  ["src/pages/admin/EventForm.tsx", "updateEventStatus"],
  ["src/pages/admin/Coupons.tsx", "getCouponRealtimeStatus"],
  ["src/pages/admin/Coupons.tsx", "updateCoupon"],
  ["src/pages/admin/AdminAuth.tsx", "deleteAdminSession"],
  ["src/pages/internal/Failures.tsx", "reprocessDlqMessage"],
];

const missing = checks.filter(([file, snippet]) => !readFileSync(file, "utf8").includes(snippet));

const adminAuthApi = readFileSync("src/api/adminAuth.ts", "utf8");
const adminAuthPage = readFileSync("src/pages/admin/AdminAuth.tsx", "utf8");
if (!/try\s*\{[\s\S]*apiDelete[\s\S]*finally\s*\{[\s\S]*clearAdminSessionToken/.test(adminAuthApi)) {
  missing.push(["src/api/adminAuth.ts", "clear local token in finally"]);
}
if (!adminAuthPage.includes('finally { setActive(false); setExpiresAt(""); setSubmitting(false); }')) {
  missing.push(["src/pages/admin/AdminAuth.tsx", "clear active UI in finally"]);
}

if (missing.length > 0) {
  for (const [file, snippet] of missing) console.error(`MISSING ${file}: ${snippet}`);
  process.exit(1);
}

console.log(`API coverage checks passed: ${checks.length}`);
