import type { GoalPeriod, GoalStatus, ProjectStatus, TaskPriority, TaskStatus } from "./types";

export const field =
  "min-h-11 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted/80 hover:border-muted/50 focus:border-pen focus:outline-none focus:ring-2 focus:ring-pen/30";
export const btnPrimary =
  "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-pen px-4 py-2 text-sm font-semibold text-on-pen transition-colors hover:bg-pen/90 disabled:opacity-60";
export const btnGhost =
  "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink transition-colors hover:bg-pen-soft";
export const btnOutline =
  "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-pen hover:text-pen";
export const btnDanger =
  "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-margin transition-colors hover:bg-margin-soft";
export const iconBtn =
  "inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted transition-colors hover:bg-pen-soft hover:text-ink";
export const muted = "text-muted";
export const errText = "text-sm font-medium text-margin";
export const lbl = "flex flex-col gap-1 text-sm font-medium";
export const pageTitle = "text-3xl font-bold tracking-tight";
export const segActive = "bg-pen text-on-pen";

/** Màu thẻ ưu tiên: luôn kèm chữ, không chỉ dựa vào màu. */
export const PRIORITY_TAG: Record<TaskPriority, string> = {
  URGENT: "bg-margin-soft text-margin",
  HIGH: "bg-amber-soft text-amber",
  MEDIUM: "bg-pen-soft text-pen",
  LOW: "bg-line/60 text-muted",
};
export const PRIORITY_RING: Record<TaskPriority, string> = {
  URGENT: "text-margin",
  HIGH: "text-amber",
  MEDIUM: "text-pen",
  LOW: "text-muted",
};
export const PROJECT_BAND: Record<ProjectStatus, string> = {
  PLANNING: "bg-muted/50",
  ACTIVE: "bg-pen",
  ON_HOLD: "bg-amber",
  COMPLETED: "bg-ok",
  ARCHIVED: "bg-line",
};
export const GOAL_BAND: Record<GoalStatus, string> = { ACTIVE: "bg-pen", COMPLETED: "bg-ok", ARCHIVED: "bg-line" };

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
