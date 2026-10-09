import type { Task } from "../types";
import { addDays } from "./date";

const parts = (d: string) => d.split("-").map(Number) as [number, number, number];
const pad = (n: number) => String(n).padStart(2, "0");

/** Thứ trong tuần, tuần bắt đầu từ thứ Hai: 0 = T2 ... 6 = CN. */
export function dayOfWeek(d: string): number {
  const [y, m, day] = parts(d);
  return (new Date(Date.UTC(y, m - 1, day)).getUTCDay() + 6) % 7;
}
export const startOfWeek = (d: string) => addDays(d, -dayOfWeek(d));
export const weekDays = (d: string): string[] => Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(d), i));

export const daysInMonth = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate();

/** Lưới tháng theo tuần (T2 → CN), gồm cả ngày của tháng trước/sau để đủ tuần. */
export function monthGrid(year: number, month: number): string[][] {
  const first = `${year}-${pad(month)}-01`;
  const last = addDays(first, daysInMonth(year, month) - 1);
  const weeks: string[][] = [];
  for (let s = startOfWeek(first); s <= last; s = addDays(s, 7)) weeks.push(weekDays(s));
  return weeks;
}

export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const idx = year * 12 + (month - 1) + delta;
  return { year: Math.floor(idx / 12), month: (idx % 12) + 1 };
}

/** Gom việc theo ngày hạn; bỏ việc đã xóa, đã hủy hoặc không có hạn. */
export function groupByDate(tasks: Task[]): Record<string, Task[]> {
  const out: Record<string, Task[]> = {};
  for (const t of tasks) {
    if (t.deletedAt || t.status === "CANCELLED" || !t.dueDate) continue;
    (out[t.dueDate] ??= []).push(t);
  }
  for (const k of Object.keys(out)) out[k].sort((a, b) => (a.dueTime ?? "99:99").localeCompare(b.dueTime ?? "99:99"));
  return out;
}
