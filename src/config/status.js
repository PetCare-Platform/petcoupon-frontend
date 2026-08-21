// 백엔드 상태 코드(open/scheduled/... 등)를 프론트 표현(뱃지 라벨 · CSS 클래스)으로 매핑하는 단일 기준.
// 동일 코드라도 영역별로 문구가 다른 경우(예: scheduled → 공개 "오픈 예정" / 관리자 "예정")는
// 원본 정적 화면의 문구를 그대로 유지하기 위해 라벨을 영역별로 나눠 둔다.

export const EVENT_STATUS = {
  open: { className: 'status--open', publicLabel: '진행 중', adminLabel: '진행 중' },
  scheduled: { className: 'status--scheduled', publicLabel: '오픈 예정', adminLabel: '예정' },
  closed: { className: 'status--closed', publicLabel: '종료', adminLabel: '종료' },
};

export const COUPON_WALLET_STATUS = {
  usable: { className: 'status--open', label: '사용 가능' },
  soon: { className: 'status--warning', label: '곧 만료' },
  used: { className: 'status--used', label: '사용 완료' },
  expired: { className: 'status--closed', label: '만료' },
};

export const ADMIN_COUPON_STATUS = {
  issuing: { className: 'status--open', label: '발급 중' },
  ready: { className: 'status--scheduled', label: '발급 예정' },
  ended: { className: 'status--closed', label: '종료' },
};

export const FAILURE_STATUS = {
  failed: { className: 'status--danger', label: 'FAILED' },
  retry: { className: 'status--warning', label: 'RETRY' },
  dlq: { className: 'status--closed', label: 'DLQ' },
};

export const VERIFICATION_STATUS = {
  matched: { className: 'status--open', label: '일치' },
  mismatch: { className: 'status--danger', label: '불일치' },
};

export const MONITORING_STATUS = {
  ok: { className: 'status--open', label: '정상' },
  warning: { className: 'status--warning', label: '관찰' },
};
