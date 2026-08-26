import { apiDelete, apiPost } from "./http";
import { clearAdminSessionToken, saveAdminSessionToken } from "./adminSession";
import type { AdminSessionCreateResponse } from "../types/api";

export async function createAdminSession(authCode: string): Promise<AdminSessionCreateResponse> {
  const response = await apiPost<AdminSessionCreateResponse>("/admin/auth/sessions", { authCode });
  saveAdminSessionToken(response.token);
  return response;
}

export async function deleteAdminSession(): Promise<void> {
  try {
    await apiDelete<null>("/admin/auth/sessions");
  } finally {
    // 만료·폐기된 서버 토큰이 401을 반환해도 현재 브라우저의 세션은 반드시 끝낸다.
    clearAdminSessionToken();
  }
}
