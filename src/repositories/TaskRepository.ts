import type { Table } from "dexie";
import type { Dang360DB } from "../db/db";
import type { BaseEntity, Goal, OutboxItem, Project, SyncEntity, Task } from "../types";

export interface Repository<T extends BaseEntity> {
  create(entity: T): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T>;
  softDelete(id: string): Promise<void>;
  get(id: string): Promise<T | undefined>;
  listActive(userId: string): Promise<T[]>;
}
export type TaskRepository = Repository<Task>;

/**
 * Ghi bản ghi và outbox trong CÙNG MỘT transaction IndexedDB:
 * tắt tab giữa chừng thì hoặc có cả hai, hoặc không có gì.
 */
export class DexieRepository<T extends BaseEntity & SyncEntity> implements Repository<T> {
  constructor(
    protected db: Dang360DB,
    protected table: Table<T, string>,
    protected entity: OutboxItem["entity"],
  ) {}

  private enqueue(op: OutboxItem["op"], e: T): Promise<number> {
    return this.db.outbox.add({
      entity: this.entity, entityId: e.id, op, baseVersion: e.version,
      payload: e, attempts: 0, status: "pending", createdAt: new Date().toISOString(),
    });
  }

  async create(e: T): Promise<T> {
    await this.db.transaction("rw", this.table, this.db.outbox, async () => {
      await this.table.add(e);
      await this.enqueue("create", e);
    });
    return e;
  }

  async update(id: string, patch: Partial<T>): Promise<T> {
    return this.db.transaction("rw", this.table, this.db.outbox, async () => {
      const cur = await this.table.get(id);
      if (!cur || cur.deletedAt) throw new Error("Không tìm thấy bản ghi cần sửa");
      // Các trường định danh/đồng bộ KHÔNG bao giờ bị patch ghi đè.
      const next = {
        ...cur, ...patch,
        id: cur.id, userId: cur.userId, createdAt: cur.createdAt,
        version: cur.version, deletedAt: cur.deletedAt, lastSyncedAt: cur.lastSyncedAt,
        updatedAt: new Date().toISOString(),
      } as T;
      await this.table.put(next);
      await this.enqueue("update", next);
      return next;
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.db.transaction("rw", this.table, this.db.outbox, async () => {
      const cur = await this.table.get(id);
      if (!cur || cur.deletedAt) return;
      const now = new Date().toISOString();
      const next = { ...cur, deletedAt: now, updatedAt: now } as T;
      await this.table.put(next);
      await this.enqueue("delete", next);
    });
  }

  get(id: string) { return this.table.get(id); }

  async listActive(userId: string): Promise<T[]> {
    const all = await this.table.where("userId").equals(userId).toArray();
    return all.filter((e) => !e.deletedAt);
  }
}

export class DexieTaskRepository extends DexieRepository<Task> {
  constructor(db: Dang360DB) { super(db, db.tasks, "task"); }
}
export class DexieProjectRepository extends DexieRepository<Project> {
  constructor(db: Dang360DB) { super(db, db.projects, "project"); }
}
export class DexieGoalRepository extends DexieRepository<Goal> {
  constructor(db: Dang360DB) { super(db, db.goals, "goal"); }
}
