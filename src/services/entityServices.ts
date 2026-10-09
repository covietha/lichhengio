import { ZodError } from "zod";
import type { Goal, Project } from "../types";
import type { Repository } from "../repositories/TaskRepository";
import {
  goalInputSchema, goalPatchSchema, projectInputSchema, projectPatchSchema,
  type GoalInput, type GoalPatch, type ProjectInput, type ProjectPatch,
} from "./validation";
import { applyClears, splitClears, type WithClear } from "./patch";
import { newBase, type ServiceCtx } from "./taskService";

function dateOrderError(path: string): ZodError {
  return new ZodError([{ code: "custom", path: [path], message: "Hạn phải sau hoặc bằng ngày bắt đầu" }]);
}

export class ProjectService {
  constructor(private repo: Repository<Project>, private ctx: ServiceCtx) {}

  async create(input: ProjectInput): Promise<Project> {
    const d = projectInputSchema.parse(input);
    if (d.startDate && d.targetDate && d.startDate > d.targetDate) throw dateOrderError("targetDate");
    return this.repo.create({ ...d, ...newBase(this.ctx) });
  }

  async update(id: string, patch: WithClear<ProjectPatch>): Promise<Project> {
    const { rest, clear } = splitClears<ProjectPatch>(patch, ["name", "status", "priority"]);
    const data = projectPatchSchema.parse(rest);
    const cur = await this.repo.get(id);
    if (!cur || cur.deletedAt) throw new Error("Không tìm thấy dự án");
    const clean = applyClears<Project>(data as Partial<Project>, clear as (keyof Project)[]);
    const start = "startDate" in clean ? clean.startDate : cur.startDate;
    const target = "targetDate" in clean ? clean.targetDate : cur.targetDate;
    if (start && target && start > target) throw dateOrderError("targetDate");
    return this.repo.update(id, { ...clean, deviceId: this.ctx.deviceId });
  }

  /** Xóa mềm dự án. Việc thuộc dự án được GIỮ NGUYÊN (không mất dữ liệu), chỉ hiển thị là không thuộc dự án nào. */
  remove(id: string) { return this.repo.softDelete(id); }
}

export class GoalService {
  constructor(private repo: Repository<Goal>, private ctx: ServiceCtx) {}

  async create(input: GoalInput): Promise<Goal> {
    const d = goalInputSchema.parse(input);
    return this.repo.create({ ...d, projectIds: [...new Set(d.projectIds)], ...newBase(this.ctx) });
  }

  async update(id: string, patch: WithClear<GoalPatch>): Promise<Goal> {
    const { rest, clear } = splitClears<GoalPatch>(patch, ["title", "status", "period", "projectIds"]);
    const data = goalPatchSchema.parse(rest);
    const clean = applyClears<Goal>(data as Partial<Goal>, clear as (keyof Goal)[]);
    if (clean.projectIds) clean.projectIds = [...new Set(clean.projectIds)];
    return this.repo.update(id, { ...clean, deviceId: this.ctx.deviceId });
  }

  remove(id: string) { return this.repo.softDelete(id); }
}
