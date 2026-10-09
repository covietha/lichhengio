import Dexie, { type Table } from "dexie";
import type { Goal, OutboxItem, Project, Task } from "../types";

export class Dang360DB extends Dexie {
  tasks!: Table<Task, string>;
  projects!: Table<Project, string>;
  goals!: Table<Goal, string>;
  outbox!: Table<OutboxItem, number>;

  constructor(name = "dang360") {
    super(name);
    // v1: Phase 1 (dữ liệu cũ được giữ nguyên khi nâng cấp)
    this.version(1).stores({
      tasks: "id, userId, status, priority, dueDate, projectId, goalId, categoryId, deletedAt, [userId+dueDate], [userId+status]",
      outbox: "++seq, entityId, status",
    });
    // v2: thêm projects, goals. Không đổi bảng cũ, không xóa dữ liệu.
    this.version(2).stores({
      tasks: "id, userId, status, priority, dueDate, projectId, goalId, categoryId, deletedAt, [userId+dueDate], [userId+status]",
      projects: "id, userId, status, deletedAt",
      goals: "id, userId, status, period, deletedAt",
      outbox: "++seq, entityId, status",
    });
  }
}

export const db = new Dang360DB();
