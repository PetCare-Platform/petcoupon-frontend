# petcoupon-frontend

> **1차본 (WIP)** — 아직 다듬는 중인 초안입니다. 백엔드 API 명세가 계속 바뀌고 있어서 실제 연동 범위와 여기 적힌 내용이 어긋날 수 있습니다. 오래된 내용을 발견하면 바로 고쳐주세요.

선착순 쿠폰 발급 시스템 프론트엔드입니다. 반려동물 관련 이벤트에 딸린 한정 수량 쿠폰을 사용자가 선착순으로 신청하고, 관리자가 이벤트/쿠폰을 만들고, 내부 운영팀이 발급 파이프라인의 상태와 실패를 들여다볼 수 있게 하는 4개 영역(공개/사용자/관리자/내부 운영)으로 구성되어 있습니다.

## 기술 스택

React 19 · TypeScript · Vite · Tailwind CSS · react-router-dom v6

## 실행

```bash
npm install
npm run dev
```

http://localhost:5174 에서 열립니다.

백엔드 API 서버([petcoupon-backend](https://github.com/PetCare-Platform/petcoupon-backend))가 `http://localhost:8080`에서 떠 있어야 합니다. dev 서버는 `/api/*` 요청을 `vite.config.ts`의 프록시를 통해 백엔드로 그대로 넘겨줍니다(브라우저 입장에서는 같은 출처라 CORS 제약이 없습니다).

```bash
npm run build   # tsc -b && vite build
npm run lint
```

## 화면 구성

`src/routes.ts`의 `AREA_ROUTES` 하나가 전역 영역 전환 메뉴와 각 영역의 서브 내비게이션을 함께 생성합니다. 새 페이지를 추가하면 이 파일과 `src/App.tsx`의 라우트 둘 다 갱신해야 합니다.

| 영역 | 경로 | 대상 |
| --- | --- | --- |
| 서비스(공개) | `/`, `/event-detail/:id` | 이벤트를 둘러보고 쿠폰을 신청하는 방문자 |
| 사용자 | `/user`, `/user/my-coupons`, `/user/coupon-detail/:couponIssueId` | 발급받은 쿠폰의 상태를 확인·사용·취소하는 사용자 |
| 관리자 | `/admin`, `/admin/events`, `/admin/event-form(/:eventId)`, `/admin/coupons`, `/admin/coupon-form(/:eventId)` | 이벤트/쿠폰을 만들고 관리하는 스태프 |
| 내부 운영 | `/internal/dashboard`, `/monitoring`, `/issues`, `/failures`, `/verification`, `/repo-issues` | 발급 파이프라인 상태·실패·정합성을 들여다보는 운영팀 (다크 테마로 구분) |

인증 시스템은 아직 없습니다. `src/api/currentUser.ts`가 `localStorage`에 저장한 데모 사용자 ID(`petcoupon.demoUserId`, 기본값 1)를 대신 사용합니다.

## 백엔드 연동 현황

`src/types/api.ts`가 팀 API 명세와 실제 `petcoupon-backend` 코드를 함께 확인해서 만든 타입 정의고, `src/api/*.ts`가 그걸 쓰는 얇은 클라이언트 레이어입니다(`http.ts`가 `CustomResponse` 봉투를 벗기고 `ApiError`/`NetworkError`로 구분해서 던집니다).

**실제 백엔드에 연동된 것:**
- 이벤트 생성/조회/수정(이름·기간·설명·상태), 쿠폰 생성 — 관리자 폼
- 쿠폰 신청(`POST /coupons/{id}/issues`, Idempotency-Key 포함), 보유 쿠폰 목록/상세 조회, 사용/사용취소 — 사용자 흐름
- 부하 테스트용 재고 초기화(`POST /internal/coupons/{id}/reset`)

**아직 실제 API가 없어서 목데이터로 남아있는 것:**
- 공개 이벤트 목록/상세(`/`, `/event-detail/:id`)의 기본 화면 — `src/data/events.ts`의 목데이터를 그대로 씀. 관리자가 쿠폰을 만들면 나오는 신청 링크(`?couponId=...`)로 들어왔을 때만 그 쿠폰 한 장에 한해 실제 API로 신청을 태웁니다.
- 이벤트별 쿠폰 목록 조회, 쿠폰 재고/실시간 신청 현황 조회, 내부 운영 대시보드 전반 — 백엔드에 해당 API가 없어서 데모/시뮬레이션 상태입니다.

이런 이유로 실제 연동 코드에는 "왜 이 화면이 아직 목데이터인지"를 설명하는 주석이 붙어 있습니다. 백엔드에 새 API가 생기면 그 주석을 따라가면 됩니다.

## 프로젝트 구조

```
src/
  api/         API 클라이언트 (도메인별 파일 + http.ts 공통 래퍼)
  components/  공용 UI(Layout, Header, Footer, ui.tsx의 프리미티브)
  context/     ToastContext 등 전역 상태
  data/        아직 API가 없는 화면을 위한 목데이터
  lib/         날짜 포맷 등 순수 유틸
  pages/       public/user/admin/internal 4개 영역별 페이지
  types/       백엔드 DTO에 대응하는 TypeScript 타입
  routes.ts    영역·내비게이션 단일 소스
```

## 알려진 로컬 개발 함정

이 저장소를 백엔드와 함께 로컬에서 띄울 때, macOS에 Homebrew로 설치된 `redis-server`가 `localhost:6379`를 먼저 점유하고 있으면 `docker-compose`의 Redis 컨테이너 대신 그 인스턴스로 연결됩니다. 선착순 신청이 계속 `STOCK_NOT_INITIALIZED`로 실패한다면 `redis-cli -h localhost -p 6379`로 직접 확인해보세요(`docker exec` 로 컨테이너 안에 들어가서 확인하면 다른 인스턴스를 보게 됩니다).

## 관련 저장소

- [petcoupon-backend](https://github.com/PetCare-Platform/petcoupon-backend)
