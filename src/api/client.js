/**
 * 백엔드 API 호출 공통 함수.
 *
 * 모든 응답은 CustomResponse 로 감싸여 온다.
 *   { isSuccess, code, message, result }
 * 매번 result 를 꺼내고 isSuccess 를 확인하는 코드를 반복하지 않도록 여기서 처리한다.
 *
 * 요청 경로는 /api 로 시작한다. vite.config.js 의 프록시가 백엔드로 넘겨준다.
 */

export class ApiError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const body = await response.json();

  if (!body.isSuccess) {
    // code 예: COUPON409-0(재고 소진), EVENT404-0(이벤트 없음)
    throw new ApiError(body.code, body.message);
  }

  return body.result;
}

export function get(path) {
  return request(path);
}

export function post(path, data, headers = {}) {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
}

export function patch(path, data) {
  return request(path, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function del(path) {
  return request(path, { method: 'DELETE' });
}
