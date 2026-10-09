import type { Task } from "../types";
import type { Repository } from "../repositories/TaskRepository";
import { taskInputSchema, taskPatchSchema, type TaskInput, type TaskPatch } from "./validation";
import { applyClears, splitClears, type WithClear } from "./patch";

export interface ServiceCtx { userId: string; deviceId: string }

export function newBase(ctx: ServiceCtx) {
  const now = new Date().toISOString();
  return { id: crypto.randomUUID(), userId: ctx.userId, deviceId: ctx.deviceId, createdAt: now, updatedAt: now, version: 0 };
}

export class TaskService {
  constructor(private repo: Repository<Task>, private ctx: ServiceCtx) {}

  async create(input: TaskInput): Promise<Task> {
    const data = taskInputSchema.parse(input); // ném ZodError nếu không hợp lệ
    const base = newBase(this.ctx);
    return this.repo.create({
      ...data, ...base,
      completedAt: data.status === "COMPLETED" ? base.createdAt : undefined,
    });
  }

  /** "" hoặc null ở trường tùy chọn (dueDate, projectId, goalId...) = xóa trường đó. */
  async update(id: string, patch: WithClear<TaskPatch>): Promise<Task> {
    const { rest, clear } = splitClears<TaskPatch>(patch, ["title", "status", "priority"]);
    const data = taskPatchSchema.parse(rest);
    const clean = applyClears<Task>(data as Partial<Task>, clear as (keyof Task)[]);
    return this.repo.update(id, { ...clean, deviceId: this.ctx.deviceId });
  }

  complete(id: string) {
    return this.repo.update(id, { status: "COMPLETED", completedAt: new Date().toISOString(), deviceId: this.ctx.deviceId });
  }
  reopen(id: string) {
    return this.repo.update(id, { status: "TODO", completedAt: undefined, deviceId: this.ctx.deviceId });
  }
  cancel(id: string) {
    return this.repo.update(id, { status: "CANCELLED", deviceId: this.ctx.deviceId });
  }
  remove(id: string) { return this.repo.softDelete(id); }
}
