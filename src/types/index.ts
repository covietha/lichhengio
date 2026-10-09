export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type TaskPriority = "URGENT" | "HIGH" | "MEDIUM" | "LOW";

export interface SubTask { id: string; title: string; done: boolean }

/** Trường chung của mọi bản ghi người dùng (mục 8 của prompt). */
export interface BaseEntity {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  version: number; // phiên bản server đã biết gần nhất (0 = chưa từng sync)
  deviceId: string;
  deletedAt?: string;
  lastSyncedAt?: string;
}

/** Phase 1-2: thời gian lưu dạng ISO. Phase 3: updatedAt/version do server xác nhận. */
export interface Task extends BaseEntity {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  categoryId?: string;
  projectId?: string;
  goalId?: string;
  dueDate?: string; // YYYY-MM-DD (Asia/Ho_Chi_Minh)
  dueTime?: string; // HH:mm
  startTime?: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
  tags?: string[];
  subtasks?: SubTask[];
  notes?: string;
  completedAt?: string;
}

export type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED";
export interface Project extends BaseEntity {
  name: string;
  description?: string;
  status: ProjectStatus;
  priority: TaskPriority;
  startDate?: string;
  targetDate?: string;
  categoryId?: string;
}

export type GoalPeriod = "TODAY" | "WEEK" | "MONTH" | "LONG_TERM";
export type GoalStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED";
export interface Goal extends BaseEntity {
  title: string;
  description?: string;
  period: GoalPeriod;
  targetDate?: string;
  status: GoalStatus;
  projectIds: string[];
}

export type SyncEntity = Task | Project | Goal;

export interface OutboxItem {
  seq?: number;
  entity: "task" | "project" | "goal";
  entityId: string;
  op: "create" | "update" | "delete";
  baseVersion: number;
  payload: SyncEntity;
  attempts: number;
  status: "pending" | "failed";
  createdAt: string;
}
