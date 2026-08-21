export const GLOBAL_NAV = [
  { to: '/', label: '서비스' },
  { to: '/user', label: '사용자' },
  { to: '/admin', label: '관리자' },
  { to: '/internal/monitoring', label: '내부 운영' },
];

export const AREA_NAV = {
  public: {
    label: '서비스',
    homeHref: '/',
    homeLabel: '서비스 홈',
    links: [
      { to: '/', label: '이벤트' },
      { to: '/event-detail', label: '이벤트 상세' },
    ],
  },
  user: {
    label: '사용자',
    homeHref: '/user',
    homeLabel: '사용자 홈',
    links: [
      { to: '/user', label: '사용자 정보' },
      { to: '/user/my-coupons', label: '보유 쿠폰' },
      { to: '/user/coupon-detail', label: '쿠폰 상세' },
    ],
  },
  admin: {
    label: '관리자',
    homeHref: '/admin',
    homeLabel: '관리자 홈',
    links: [
      { to: '/admin', label: '관리자 홈' },
      { to: '/admin/events', label: '이벤트 목록' },
      { to: '/admin/event-form', label: '이벤트 편집' },
      { to: '/admin/coupons', label: '쿠폰 목록' },
      { to: '/admin/coupon-form', label: '쿠폰 편집' },
    ],
  },
  internal: {
    label: '내부 운영',
    homeHref: '/internal/monitoring',
    homeLabel: '내부 운영 홈',
    links: [
      { to: '/internal/monitoring', label: '시스템 현황' },
      { to: '/internal/issues', label: '발급 처리 흐름' },
      { to: '/internal/failures', label: '실패 처리' },
      { to: '/internal/verification', label: '정합성 검증' },
    ],
  },
};
