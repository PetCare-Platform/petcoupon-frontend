export type EventStatus = "open" | "scheduled" | "closed";

export interface EventCoupon {
  id: string;
  name: string;
  detail: string;
  value: string;
}

export interface EventMetric {
  label: string;
  value: string;
  hint: string;
}

export interface EventRecord {
  id: number;
  status: EventStatus;
  label: string;
  title: string;
  desc: string;
  detailDesc: string;
  period: string;
  benefit: string;
  cta: string;
  metrics: EventMetric[];
  coupons: EventCoupon[];
  guide: string[];
}

export const EVENTS: EventRecord[] = [
  {
    id: 1,
    status: "open",
    label: "이벤트 01",
    title: "반려동물 여름 케어 위크",
    desc: "목욕과 미용을 함께 챙기는 계절 한정 혜택",
    detailDesc: "더운 계절에도 산뜻하게. 제휴 미용·목욕 서비스에 사용할 수 있는 두 가지 쿠폰을 준비했어요.",
    period: "8.20 - 8.30",
    benefit: "최대 20%",
    cta: "이벤트 보기",
    metrics: [
      { label: "최대 할인", value: "20%", hint: "최대 10,000원" },
      { label: "현재 잔여", value: "284", hint: "총 500장" },
      { label: "발급 종료", value: "D-10", hint: "8월 30일 23:59" },
      { label: "사용 기한", value: "7일", hint: "발급 후 7일" },
    ],
    coupons: [
      { id: "rate", name: "여름 정률 쿠폰", detail: "3만원 이상 구매 · 최대 1만원 할인", value: "20%" },
      { id: "amount", name: "첫 만남 정액 쿠폰", detail: "2만원 이상 구매 · 첫 구매 전용", value: "5,000원" },
    ],
    guide: [
      "다른 쿠폰과 중복 적용할 수 없습니다.",
      "결제 취소 시 매장의 환불 정책을 따릅니다.",
      "사용 기한이 지난 쿠폰은 다시 발급되지 않습니다.",
    ],
  },
  {
    id: 2,
    status: "scheduled",
    label: "이벤트 02",
    title: "건강검진 데이",
    desc: "기본 검진 패키지를 부담 없이 시작하는 주간",
    detailDesc: "1년에 한 번은 꼭 필요한 건강검진. 기본 검진 패키지를 합리적인 가격에 시작해 보세요.",
    period: "8.24 - 9.07",
    benefit: "15%",
    cta: "이벤트 보기",
    metrics: [
      { label: "최대 할인", value: "15%", hint: "최대 15,000원" },
      { label: "현재 잔여", value: "300", hint: "총 300장" },
      { label: "발급 시작", value: "D+3", hint: "8월 24일 00:00" },
      { label: "사용 기한", value: "14일", hint: "발급 후 14일" },
    ],
    coupons: [
      { id: "checkup", name: "기본 검진 정률 쿠폰", detail: "5만원 이상 구매 · 최대 1만 5천원 할인", value: "15%" },
    ],
    guide: [
      "제휴 동물병원에서만 사용할 수 있습니다.",
      "예약 없이 방문 시 대기 시간이 있을 수 있습니다.",
      "검진 결과에 따른 추가 진료비는 별도입니다.",
    ],
  },
  {
    id: 3,
    status: "open",
    label: "이벤트 03",
    title: "함께 걷는 계절",
    desc: "산책용품과 야외 활동을 위한 정액 할인",
    detailDesc: "선선해진 날씨에 산책을 더 즐겁게. 목줄과 하네스, 산책용품 구매에 쓸 수 있는 쿠폰이에요.",
    period: "8.15 - 8.25",
    benefit: "7,000원",
    cta: "이벤트 보기",
    metrics: [
      { label: "정액 할인", value: "7,000원", hint: "2만원 이상 구매 시" },
      { label: "현재 잔여", value: "128", hint: "총 1,000장" },
      { label: "발급 종료", value: "D-3", hint: "8월 25일 23:59" },
      { label: "사용 기한", value: "5일", hint: "발급 후 5일" },
    ],
    coupons: [{ id: "walk", name: "산책용품 할인 쿠폰", detail: "2만원 이상 산책용품 구매", value: "7,000원" }],
    guide: [
      "산책용품 카테고리에서만 사용할 수 있습니다.",
      "사료·간식 구매에는 적용되지 않습니다.",
      "재고 소진 시 조기 종료될 수 있습니다.",
    ],
  },
  {
    id: 5,
    status: "closed",
    label: "이벤트 05",
    title: "웰컴 펫데이",
    desc: "첫 구매 고객을 위한 반가운 시작 쿠폰",
    detailDesc: "PetCoupon이 처음이신가요? 첫 구매를 응원하는 정액 할인 쿠폰이었어요. 지금은 발급이 종료되었습니다.",
    period: "7.01 - 7.31",
    benefit: "5,000원",
    cta: "지난 이벤트 보기",
    metrics: [
      { label: "정액 할인", value: "5,000원", hint: "첫 구매 전용" },
      { label: "최종 발급", value: "0", hint: "총 200장 소진" },
      { label: "발급 종료", value: "종료", hint: "7월 31일 23:59" },
      { label: "사용 기한", value: "7일", hint: "발급 후 7일" },
    ],
    coupons: [{ id: "welcome", name: "웰컴 정액 쿠폰", detail: "첫 구매 전용 · 발급 종료", value: "5,000원" }],
    guide: ["이벤트가 종료되어 더 이상 발급되지 않습니다.", "이미 발급받은 쿠폰은 사용 기한까지 사용할 수 있습니다."],
  },
];

export function getEvent(id: number) {
  return EVENTS.find((event) => event.id === id);
}
