import type { GoalPeriod, GoalStatus, ProjectStatus, TaskPriority, TaskStatus } from "./types";

export const field = "rounded-md border border-ink/25 bg-white px-2 py-1.5 text-sm dark:border-ink-dark/25 dark:bg-black/30";
export const btnPrimary = "inline-flex items-center gap-1 rounded-md bg-brand px-3 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-brand-dark dark:text-black";
export const btnGhost = "rounded-md px-2 py-1 text-sm hover:bg-ink/5 dark:hover:bg-ink-dark/10";
export const muted = "text-ink/70 dark:text-ink-dark/70";
export const errText = "text-sm text-red-700 dark:text-red-400";

export const PRIORITY_VI: Record<TaskPriority, string> = { URGENT: "Khẩn cấp", HIGH: "Cao", MEDIUM: "Trung bình", LOW: "Thấp" };
export const TASK_STATUS_VI: Record<TaskStatus, string> = { TODO: "Chưa làm", IN_PROGRESS: "Đang làm", COMPLETED: "Đã xong", CANCELLED: "Đã hủy" };
export const PROJECT_STATUS_VI: Record<ProjectStatus, string> = { PLANNING: "Lên kế hoạch", ACTIVE: "Đang thực hiện", ON_HOLD: "Tạm dừng", COMPLETED: "Hoàn thành", ARCHIVED: "Lưu trữ" };
export const GOAL_PERIOD_VI: Record<GoalPeriod, string> = { TODAY: "Hôm nay", WEEK: "Tuần này", MONTH: "Tháng này", LONG_TERM: "Dài hạn" };
export const GOAL_STATUS_VI: Record<GoalStatus, string> = { ACTIVE: "Đang thực hiện", COMPLETED: "Hoàn thành", ARCHIVED: "Lưu trữ" };

export const fmtDate = (d: string) => d.split("-").reverse().join("/");
export function errMsg(e: unknown, fallback = "Không lưu được. Thử lại."): string {
  if (e && typeof e === "object" && "issues" in e) {
    const issues = (e as { issues: { message: string }[] }).issues;
    if (issues[0]) return issues[0].message;
  }
  return fallback;
}
