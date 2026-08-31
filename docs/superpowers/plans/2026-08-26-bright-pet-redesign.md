# Bright Pet Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing generic prototype styling with a bright, API-aligned pet service across every current route, including all mandatory internal operations pages.

**Architecture:** Change shared tokens and primitives first so all routes inherit the new direction, then rebuild public, user, admin, and internal surfaces around confirmed backend contracts. Keep API modules, route contracts, form state, polling, idempotency, and coupon actions unchanged; distinguish live, sample, and unavailable operational data.

**Tech Stack:** React 19, TypeScript, Vite 8, Tailwind CSS 3, Phosphor Icons

**Spec:** `docs/superpowers/specs/2026-08-26-bright-pet-redesign-design.md`

## Global Constraints

- Use cool white, restrained mint, coral, and pale sky; no yellow cast or neon lime.
- Preserve existing routes, API adapters, coupon operations, and form semantics.
- Do not invent APIs, testimonials, partners, users, events, or operational metrics.
- Maintain 44px targets, visible focus, reduced-motion support, and 375px width safety.

---

### Task 1: Bright shared design system

**Files:**
- Modify: `tailwind.config.js`
- Modify: `src/index.css`
- Modify: `src/components/Layout.tsx`
- Modify: `src/components/ui.tsx`

**Interfaces:**
- Consumes: existing Tailwind class names and exported UI component signatures
- Produces: compatible bright tokens and primitives used by every existing page

- [ ] Replace canvas, surfaces, ink, accent, clay, and operational colors with cool white, mint, coral, sky, and dark navy values.
- [ ] Add display typography, global focus-visible treatment, reduced-motion overrides, text balancing, and horizontal overflow protection.
- [ ] Restyle buttons, cards, status pills, metrics, form controls, charts, and empty states without changing their props.
- [ ] Run `npm run lint` and expect exit code 0.
- [ ] Run `npm run build` and expect `✓ built`.
- [ ] Commit with `feat: establish bright pet design system`.

### Task 2: Pet-oriented shared shell

**Files:**
- Modify: `src/components/Header.tsx`
- Modify: `src/components/Footer.tsx`
- Modify: `src/components/Layout.tsx`

**Interfaces:**
- Consumes: `AREA_ROUTES`, `AreaKey`, React Router navigation
- Produces: same `Header({ area, page })` and `Layout({ area, page, children })` interfaces

- [ ] Replace the prototype badge and heavy two-row chrome with a bright floating header and clear area navigation.
- [ ] Preserve desktop dropdowns and mobile navigation while adding Escape close, body scroll lock, focus return, and a visible focus ring.
- [ ] Create a bright footer with useful area links and no invented claims.
- [ ] Run lint and build, both with exit code 0.
- [ ] Commit with `feat: redesign navigation and footer`.

### Task 3: Rebuild the public home

**Files:**
- Modify: `src/pages/public/Index.tsx`
- Create: `src/components/PetVisual.tsx`

**Interfaces:**
- Consumes: existing `EVENTS`, `EventStatus`, routing targets, and `FilterBar`
- Produces: the same default `Index` route component and presentation-only `PetVisual`

- [ ] Build an asymmetric two-line hero using existing pet imagery, exactly two actions, and no metrics or decorative badges.
- [ ] Build a 12-column dense event bento whose desktop spans total 24 cells and whose mobile layout becomes one column.
- [ ] Add a three-step coupon explanation using existing service copy without a decorative marquee.
- [ ] Keep filter state, event counts, route targets, and empty state behavior unchanged.
- [ ] Run lint and build, both with exit code 0.
- [ ] Commit with `feat: rebuild public home for pet discovery`.

### Task 4: API-aligned user and admin surfaces

**Files:**
- Modify: `src/pages/public/EventDetail.tsx`
- Modify: `src/pages/user/UserHome.tsx`
- Modify: `src/pages/user/MyCoupons.tsx`
- Modify: `src/pages/user/CouponDetail.tsx`
- Modify: `src/pages/admin/AdminHome.tsx`
- Modify: `src/pages/admin/EventForm.tsx`
- Modify: `src/pages/admin/CouponForm.tsx`
- Modify: `src/pages/admin/Events.tsx`
- Modify: `src/pages/admin/Coupons.tsx`

**Interfaces:**
- Consumes: existing API functions and response types in `src/api` and `src/types/api.ts`
- Produces: unchanged route components with clearer WAITING, ISSUED, USED, EXPIRED, SCHEDULED, OPEN, and CLOSED presentation

- [ ] Preserve every request body, endpoint, polling loop, idempotency key operation, form handler, and error branch.
- [ ] Restyle coupon application around the confirmed `WAITING` asynchronous state and provide a visible next step to the wallet.
- [ ] Make the wallet prioritize usable and expiring coupons while retaining the unfiltered backend list request.
- [ ] Organize admin event creation/update/status and coupon creation as one coherent workflow without inventing list or stock APIs.
- [ ] Label local event and coupon arrays as demo data where used.
- [ ] Run `npm run lint` and `npm run build`; both must exit 0.
- [ ] Commit with `feat: align user and admin screens to API flows`.

### Task 5: Mandatory internal operations workspace

**Files:**
- Modify: `src/pages/internal/Dashboard.tsx`
- Modify: `src/pages/internal/Monitoring.tsx`
- Modify: `src/pages/internal/Issues.tsx`
- Modify: `src/pages/internal/Failures.tsx`
- Modify: `src/pages/internal/Verification.tsx`
- Modify: `src/pages/internal/RepoIssues.tsx`
- Create: `src/pages/internal/LoadTestReset.tsx`
- Modify: `src/routes.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `resetLoadTestStock(couponId, body)` and the existing GitHub issues fetch
- Produces: all existing internal route components plus `/internal/load-test-reset`

- [ ] Retain dashboard, monitoring, issuance flow, failures, verification, and GitHub issues routes.
- [ ] Apply the bright operational theme with large tabular KPIs and no near-black page background.
- [ ] Add persistent `샘플 데이터` or `예시` labels to every static aggregate or record group.
- [ ] Disable or relabel controls that have no backend endpoint instead of showing false success.
- [ ] Add a load-test reset form that accepts a positive coupon ID and optional positive stock value, calls `resetLoadTestStock`, displays the returned result, and preserves API errors.
- [ ] Run `npm run lint` and `npm run build`; both must exit 0.
- [ ] Commit with `feat: build honest internal operations workspace`.

### Task 6: Propagate and verify

**Files:**
- Modify only presentation classes in existing files under `src/pages/public`, `src/pages/user`, `src/pages/admin`, and `src/pages/internal` where shared primitives do not provide enough coverage.

**Interfaces:**
- Consumes: existing page component exports and shared UI primitives
- Produces: unchanged route-level component contracts

- [ ] Confirm all existing internal routes and the new reset route remain navigable.
- [ ] Replace mechanical user-facing event labels where they add no status meaning.
- [ ] Confirm forms, tables, coupon state, disabled states, errors, and handlers remain unchanged.
- [ ] Run `npm run lint` and `npm run build`; both must exit 0.
- [ ] Start Vite on port 5174 and inspect representative public, user, admin, and internal routes.
- [ ] At 375x812, require `scrollWidth === clientWidth`; verify console errors are 0.
- [ ] Commit with `fix: polish responsive bright theme`.
