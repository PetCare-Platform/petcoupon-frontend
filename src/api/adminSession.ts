const ADMIN_SESSION_KEY = "petcoupon.adminSession";

export function getAdminSessionToken(): string | null {
  return window.sessionStorage.getItem(ADMIN_SESSION_KEY);
}

export function saveAdminSessionToken(token: string): void {
  window.sessionStorage.setItem(ADMIN_SESSION_KEY, token);
}

export function clearAdminSessionToken(): void {
  window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
}
