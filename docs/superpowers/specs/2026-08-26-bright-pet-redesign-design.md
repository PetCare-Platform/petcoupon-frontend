# Bright Pet Redesign

## Goal

Redesign the complete PetCoupon frontend as a bright, friendly pet service without changing route behavior, API contracts, coupon issuance rules, or form semantics. The interface should feel authored and playful while remaining readable during a demo.

## Visual Direction

- Use cool white and pale gray as the main canvas. Avoid cream, yellow cast, muddy olive, and neon lime.
- Use restrained mint for primary actions and success, coral for urgency and secondary emphasis, and pale sky blue for supporting surfaces.
- Use Outfit for display typography with Pretendard as the Korean fallback. Keep body copy in Pretendard for readability.
- Prefer large editorial type, irregular but balanced image placement, and a small number of strongly composed surfaces over repeated generic cards.
- Use pet photography and simple paw or animal silhouettes only when they add context. Do not add decorative badges, fake testimonials, fake partners, or invented product metrics.
- Remove user-facing prototype labels and mechanical labels such as `EVENT 01` where they do not convey useful status.

## Information Architecture

Keep all existing routes and API adapters unchanged. Preserve the four existing areas:

- Public: bright pet-commerce discovery and coupon issuance.
- User: friendly coupon wallet with strong expiry and availability hierarchy.
- Admin: bright, structured content-management workspace.
- Internal: lighter operational console with high-contrast metrics; retain a distinct operational identity without switching the entire area to near-black.

The global header continues to derive navigation from `AREA_ROUTES`. Visual changes must not duplicate route configuration inside components.

## AIDA Page Structure

The public home follows this sequence:

1. Navigation: floating white navigation with clear area separation.
2. Attention: artistic asymmetric hero, two-line headline, pet visual, and exactly two actions.
3. Interest: dense event bento using the existing event dataset and status filters.
4. Desire: scroll-driven explanation of discovery, issuance, storage, and use.
5. Action: high-contrast link to the coupon wallet and a concise footer.

Other pages reuse the same tokens and primitives but do not force marketing-page spacing onto forms, tables, or operational views.

## Layout Mathematics

- Hero heading: `w-full max-w-6xl`, display size based on `clamp(3rem, 6vw, 6.5rem)`, maximum two lines on desktop and three on mobile.
- Event bento: 12 columns by 2 rows. Four items occupy `8 + 4 + 4 + 8 = 24` cells, exactly matching `12 x 2 = 24`. Apply `grid-flow-dense`.
- Avoid horizontal page scrolling at 375px. Layout-level animated elements remain inside an `overflow-x-hidden w-full max-w-full` boundary.
- Forms and tables use practical spacing rather than cinematic section spacing.

## Components

### Design tokens

Update `tailwind.config.js` and `src/index.css` with the cool-white, mint, coral, sky, ink, and border palette; Outfit display typography; focus treatments; reduced-motion overrides; and shared container behavior.

### Shared shell

Update `Header`, `Layout`, and `Footer` while preserving navigation derivation, skip-link behavior, page scroll restoration, and dark-area selection semantics where still referenced.

### Shared primitives

Update `src/components/ui.tsx` so buttons, links, status pills, cards, metric tiles, form groups, charts, and empty states share the new visual language. Existing public component APIs remain compatible unless a compile-time migration covers every caller.

### Home composition

Rebuild `src/pages/public/Index.tsx` with:

- Artistic asymmetric hero.
- Inline pet image inside editorial typography where it remains readable.
- Gapless event bento using existing `EVENTS` data.
- Horizontal accordion treatment for event categories or benefits.
- A restrained infinite marquee using existing pet icons and real service categories, not partner logos.
- Final coupon-wallet CTA.

### Supporting pages

Propagate the shared system to public detail, user wallet/detail, admin CRUD, and internal operational pages. Preserve all data loading, error messages, disabled states, and submission behavior.

## Motion

Add `gsap` and `@gsap/react` for the public home only.

- Image scale and fade: pet imagery enters from scale `0.8` to `1` and fades gently on exit.
- Card stacking: selected promotional event cards overlap during scroll without changing navigation or filter state.
- Hover reactions use transform and opacity only.
- Respect `prefers-reduced-motion`; all content remains visible and usable with motion disabled.
- Do not animate form validation, coupon use/cancel confirmation, tables, or critical status changes.

## Data and Error Handling

- Do not invent new APIs, fields, event records, user identities, testimonials, or metrics.
- Continue using existing mock data where the current page already uses it, but visually identify operational sample data instead of presenting it as live telemetry.
- Preserve `ApiError`, `NetworkError`, toast announcements, polling, idempotency handling, and abort behavior.
- The redesign must not change public pages to call additional admin endpoints.

## Accessibility

- Preserve the skip link and semantic elements.
- Every interactive element needs a visible `focus-visible` state.
- Mobile navigation must support Escape close, scroll lock, focus containment, and return focus to the trigger.
- Maintain 44px minimum interactive targets.
- Preserve inline form labels and errors.
- Avoid color-only status communication.

## Files in Scope

- `package.json`, `package-lock.json`
- `tailwind.config.js`
- `src/index.css`
- `src/components/Header.tsx`
- `src/components/Layout.tsx`
- `src/components/Footer.tsx`
- `src/components/ui.tsx`
- Existing files under `src/pages/public`, `src/pages/user`, `src/pages/admin`, and `src/pages/internal` as required for visual propagation
- New presentation-only components under `src/components`

## Explicitly Out of Scope

- Backend code or API contract changes
- Authentication implementation
- New event, coupon, user, or operational data
- Changes to coupon issuance, use, cancellation, retry, polling, or idempotency behavior
- Dependency vulnerability upgrades unrelated to GSAP installation
- The separate `petcoupon-frontend-pr7` worktree

## Verification

1. Run `npm run lint` and require zero errors.
2. Run `npm run build` and require a successful TypeScript and Vite build.
3. Start Vite and verify all routes render without console errors.
4. At 375 by 812, verify `document.documentElement.scrollWidth === document.documentElement.clientWidth` on public, user, admin, and internal representative routes.
5. Verify keyboard navigation, mobile-menu Escape behavior, focus containment, and focus return.
6. Verify reduced-motion mode leaves all content visible.
7. Recheck event and coupon form validation, coupon issuance, wallet detail, use, and cancellation flows without changing their current contracts.

## Completion Criteria

- The interface is consistently bright and pet-oriented across all four areas.
- The home has a two-line desktop hero and a mathematically complete event bento.
- Shared components no longer look like repeated generic pill-card templates.
- Operational metrics are presentation-ready and sample data is explicitly identified.
- Existing behavior passes lint, build, responsive, accessibility, and critical-flow verification.
