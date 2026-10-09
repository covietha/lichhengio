import { z } from "zod";
import { isValidDateStr } from "../utils/date";

const dateStr = z.string().refine(isValidDateStr, "Ngày không hợp lệ (YYYY-MM-DD)");
const timeStr = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Giờ không hợp lệ (HH:mm)");
const statusEnum = z.enum(["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"]);
const priorityEnum = z.enum(["URGENT", "HIGH", "MEDIUM", "LOW"]);

// ---------- Task ----------
const taskBase = {
  title: z.string().trim().min(1, "Cần nhập tên việc").max(200, "Tên việc tối đa 200 ký tự"),
  description: z.string().max(5000).optional(),
  categoryId: z.string().optional(),
  projectId: z.string().optional(),
  goalId: z.string().optional(),
  dueDate: dateStr.optional(),
  dueTime: timeStr.optional(),
  estimatedMinutes: z.number().int().min(0).max(1440).optional(),
};
export const taskInputSchema = z.object({
  ...taskBase,
  status: statusEnum.default("TODO"),
  priority: priorityEnum.default("MEDIUM"),
});
export type TaskInput = z.input<typeof taskInputSchema>;
export const taskPatchSchema = z.object({ ...taskBase, status: statusEnum, priority: priorityEnum }).partial();
export type TaskPatch = z.input<typeof taskPatchSchema>;

// ---------- Project ----------
const projectStatus = z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "ARCHIVED"]);
const projectBase = {
  name: z.string().trim().min(1, "Cần nhập tên dự án").max(120, "Tên dự án tối đa 120 ký tự"),
  description: z.string().max(5000).optional(),
  categoryId: z.string().optional(),
  startDate: dateStr.optional(),
  targetDate: dateStr.optional(),
};
export const projectInputSchema = z.object({
  ...projectBase,
  status: projectStatus.default("ACTIVE"),
  priority: priorityEnum.default("MEDIUM"),
});
export type ProjectInput = z.input<typeof projectInputSchema>;
export const projectPatchSchema = z.object({ ...projectBase, status: projectStatus, priority: priorityEnum }).partial();
export type ProjectPatch = z.input<typeof projectPatchSchema>;

// ---------- Goal ----------
const goalBase = {
  title: z.string().trim().min(1, "Cần nhập tên mục tiêu").max(200, "Tên mục tiêu tối đa 200 ký tự"),
  description: z.string().max(5000).optional(),
  targetDate: dateStr.optional(),
  projectIds: z.array(z.string()),
};
export const goalInputSchema = z.object({
  ...goalBase,
  projectIds: goalBase.projectIds.default([]),
  period: z.enum(["TODAY", "WEEK", "MONTH", "LONG_TERM"]).default("WEEK"),
  status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]).default("ACTIVE"),
});
export type GoalInput = z.input<typeof goalInputSchema>;
export const goalPatchSchema = z.object({
  ...goalBase,
  period: z.enum(["TODAY", "WEEK", "MONTH", "LONG_TERM"]),
  status: z.enum(["ACTIVE", "COMPLETED", "ARCHIVED"]),
}).partial();
export type GoalPatch = z.input<typeof goalPatchSchema>;
