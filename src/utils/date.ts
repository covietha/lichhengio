export const TIMEZONE = "Asia/Ho_Chi_Minh";

/** Ngày hiện tại theo múi giờ Việt Nam, dạng YYYY-MM-DD. */
export function todayStr(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(now);
}

/** Cộng n ngày vào chuỗi YYYY-MM-DD (tính theo lịch, không phụ thuộc múi giờ máy). */
export function addDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

export function isValidDateStr(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function formatDateVi(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Intl.DateTimeFormat("vi-VN", { timeZone: "UTC", weekday: "long", day: "numeric", month: "numeric", year: "numeric" })
    .format(new Date(Date.UTC(y, m - 1, d)));
}
