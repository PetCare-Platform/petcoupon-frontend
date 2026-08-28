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

http://localhost:5173 에서 열립니다.

백엔드 API 서버([petcoupon-backend](https://github.com/PetCare-Platform/petcoupon-backend))가 `http://localhost:8080`에서 떠 있어야 합니다. dev 서버는 `/api/*` 요청을 `vite.config.ts`의 프록시를 통해 백엔드로 그대로 넘겨줍니다(브라우저 입장에서는 같은 출처라 CORS 제약이 없습니다).

```bash
npm run build   # tsc -b && vite build
npm run lint
```

## 화면 구성

`src/routes.ts`의 `AREA_ROUTES` 하나가 전역 영역 전환 메뉴와 각 영역의 서브 내비게이션을 함께 생성합니다. 새 페이지를 추가하면 이 파일과 `src/App.tsx`의 라우트 둘 다 갱신해야 합니다.

| 영역 | 경로 | 대상 |
| --- | --- | --- |
| 서비스(공개) | `/`, `/event-detail/:id` | 이벤트를 둘러보고 쿠폰을 발급받는 방문자 |
| 사용자 | `/user`(사용자 ID 설정), `/user/my-coupons`, `/user/coupon-detail/:couponIssueId` | 발급받은 쿠폰의 상태를 확인·사용·취소하는 사용자 |
| 관리자 | `/admin`, `/admin/events`, `/admin/event-form(/:eventId)`, `/admin/coupons`, `/admin/coupon-form(/:eventId)` | 이벤트/쿠폰을 만들고 관리하는 스태프 |
| 내부 운영 | `/internal/dashboard`, `/monitoring`, `/issues`, `/failures`, `/verification`, `/repo-issues` | 발급 파이프라인 상태·실패·정합성을 들여다보는 운영팀 (다크 테마로 구분) |

인증 시스템은 아직 없습니다. `src/api/currentUser.ts`가 `localStorage`에 저장한 사용자 ID(`petcoupon.demoUserId`)를 식별값으로 씁니다. 저장된 값이 없으면 `getCurrentUserId()`는 `null`을 반환하고(예전의 "기본값 1 자동 저장" 동작은 제거됨), 각 화면이 미설정 상태를 직접 처리합니다. 사용자 ID는 `/user`(사용자 ID 설정) 화면에서 지정·해제합니다.

## 백엔드 연동 현황

`src/types/api.ts`가 팀 API 명세와 실제 `petcoupon-backend` 코드를 함께 확인해서 만든 타입 정의고, `src/api/*.ts`가 그걸 쓰는 얇은 클라이언트 레이어입니다(`http.ts`가 `CustomResponse` 봉투를 벗기고 `ApiError`/`NetworkError`로 구분해서 던집니다).

**실제 백엔드에 연동된 것:**
- 관리자 세션 발급·폐기와 `X-ADMIN-KEY` 자동 적용
- 공개 이벤트 목록(`GET /events`, OPEN만), 공개 이벤트 상세(`GET /events/{eventId}` — 연결 쿠폰 기본정보 포함)
- 관리자 이벤트 생성·상세·수정·상태 조회·상태 변경
- 쿠폰 생성·부분 수정·실시간 재고 조회
- 쿠폰 신청(`POST /coupons/{id}/issues`, Idempotency-Key 포함), 신청 결과 폴링, 보유 쿠폰 목록·상세·상태 조회, 사용·사용 취소
- DLQ 목록·재처리, 재고 정합성 검증, 부하 테스트용 재고 초기화

공개 사용자 흐름(홈 → 이벤트 목록 → 이벤트 상세 → 연결 쿠폰 + 실시간 재고 → 발급 → 발급 결과 → 내 쿠폰)은 위 실제 API로 연결돼 있습니다. 이벤트 상세는 각 쿠폰의 `GET /coupons/{couponId}/status`를 병렬 조회해 기본정보와 병합하며, 일부 재고 조회가 실패해도 상세 전체를 실패로 만들지 않습니다.

**아직 실제 API가 없어서 데모/샘플로 남아있는 것:**
- 이벤트별 쿠폰 목록(관리자), 쿠폰 단건 조회, 내부 운영 집계·모니터링 — 백엔드에 해당 API가 없어 데모/샘플 상태입니다.
- 관리자 홈·사용자 활동 요약 등 일부 대시보드 숫자.

## 프로젝트 구조

```
src/
  api/         API 클라이언트 (도메인별 파일 + http.ts 공통 래퍼)
  components/  공용 UI(Layout, Header, Footer, ui.tsx의 프리미티브)
  context/     ToastContext 등 전역 상태
  lib/         날짜 포맷 등 순수 유틸
  pages/       public/user/admin/internal 4개 영역별 페이지
  types/       백엔드 DTO에 대응하는 TypeScript 타입
  routes.ts    영역·내비게이션 단일 소스
```

## 알려진 로컬 개발 함정

이 저장소를 백엔드와 함께 로컬에서 띄울 때, macOS에 Homebrew로 설치된 `redis-server`가 `localhost:6379`를 먼저 점유하고 있으면 `docker-compose`의 Redis 컨테이너 대신 그 인스턴스로 연결됩니다. 선착순 신청이 계속 `STOCK_NOT_INITIALIZED`로 실패한다면 `redis-cli -h localhost -p 6379`로 직접 확인해보세요(`docker exec` 로 컨테이너 안에 들어가서 확인하면 다른 인스턴스를 보게 됩니다).

## 관련 저장소

- [petcoupon-backend](https://github.com/PetCare-Platform/petcoupon-backend)
