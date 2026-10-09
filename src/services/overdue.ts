import type { Task, TaskPriority } from "../types";

export const PRIORITY_RANK: Record<TaskPriority, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

export function isOpen(t: Task): boolean {
  return !t.deletedAt && t.status !== "COMPLETED" && t.status !== "CANCELLED";
}

/** Quá hạn: dueDate < hôm nay VÀ chưa hoàn thành/hủy (đúng mục 26). */
export function isOverdue(t: Task, today: string): boolean {
  return isOpen(t) && !!t.dueDate && t.dueDate < today;
}

export function sortByUrgency(a: Task, b: Task): number {
  const p = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
  if (p !== 0) return p;
  return (a.dueTime ?? "99:99").localeCompare(b.dueTime ?? "99:99");
}

export interface TodaySummary {
  dueToday: Task[];
  doneToday: Task[];
  overdue: Task[];
  upcoming: Task[];
}

export function summarize(tasks: Task[], today: string, upcomingUntil: string): TodaySummary {
  const live = tasks.filter((t) => !t.deletedAt);
  return {
    dueToday: live.filter((t) => t.dueDate === today && isOpen(t)).sort(sortByUrgency),
    doneToday: live.filter((t) => t.dueDate === today && t.status === "COMPLETED"),
    overdue: live.filter((t) => isOverdue(t, today)).sort((a, b) => a.dueDate!.localeCompare(b.dueDate!)),
    upcoming: live
      .filter((t) => isOpen(t) && !!t.dueDate && t.dueDate > today && t.dueDate <= upcomingUntil)
      .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!) || sortByUrgency(a, b)),
  };
}
