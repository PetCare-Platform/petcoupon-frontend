/** 백엔드가 내려주는 LocalDateTime 문자열("yyyy-MM-ddTHH:mm:ss")을 화면 표기용으로 변환한다. */
export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${month}월 ${day}일 ${hh}:${mm}`;
}

export function isWithinHours(value: string, hours: number): boolean {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const diffMs = date.getTime() - Date.now();
  return diffMs > 0 && diffMs <= hours * 60 * 60 * 1000;
}
