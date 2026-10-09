import type { Goal, Task } from "../types";

export interface Progress { done: number; total: number; percent: number | null }

/** Tiến độ tự tính từ việc: hoàn thành / (tất cả trừ việc đã hủy và đã xóa). Không có việc → percent = null. */
export function progressOf(tasks: Task[]): Progress {
  const counted = tasks.filter((t) => !t.deletedAt && t.status !== "CANCELLED");
  const done = counted.filter((t) => t.status === "COMPLETED").length;
  return { done, total: counted.length, percent: counted.length ? Math.round((done / counted.length) * 100) : null };
}

export const tasksOfProject = (tasks: Task[], projectId: string) =>
  tasks.filter((t) => !t.deletedAt && t.projectId === projectId);

/** Việc thuộc mục tiêu: gắn trực tiếp (goalId) hoặc thuộc một dự án của mục tiêu. Không đếm trùng. */
export const tasksOfGoal = (tasks: Task[], goal: Pick<Goal, "id" | "projectIds">) =>
  tasks.filter((t) => !t.deletedAt && (t.goalId === goal.id || (!!t.projectId && goal.projectIds.includes(t.projectId))));
