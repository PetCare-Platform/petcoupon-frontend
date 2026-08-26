import { apiDelete, apiPost } from "./http";
import { clearAdminSessionToken, saveAdminSessionToken } from "./adminSession";
import type { AdminSessionCreateResponse } from "../types/api";

export async function createAdminSession(authCode: string): Promise<AdminSessionCreateResponse> {
  const response = await apiPost<AdminSessionCreateResponse>("/admin/auth/sessions", { authCode });
  saveAdminSessionToken(response.token);
  return response;
}

export async function deleteAdminSession(): Promise<void> {
  await apiDelete<null>("/admin/auth/sessions");
  clearAdminSessionToken();
}
