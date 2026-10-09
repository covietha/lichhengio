import { beforeEach, describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { Dang360DB } from "../db/db";
import { DexieTaskRepository } from "../repositories/TaskRepository";
import { TaskService } from "./taskService";

let db: Dang360DB;
let svc: TaskService;
let repo: DexieTaskRepository;

beforeEach(() => {
  db = new Dang360DB("test-" + crypto.randomUUID());
  repo = new DexieTaskRepository(db);
  svc = new TaskService(repo, { userId: "u1", deviceId: "dev1" });
});

describe("TaskService + Dexie (offline, không cần mạng)", () => {
  it("tạo việc: lưu local và xếp vào outbox", async () => {
    const t = await svc.create({ title: "  Chấm bài 12A3  ", dueDate: "2026-10-09", priority: "HIGH" });
    expect(t.title).toBe("Chấm bài 12A3");
    expect(t.version).toBe(0);
    expect((await repo.listActive("u1")).map((x) => x.id)).toEqual([t.id]);
    const box = await db.outbox.toArray();
    expect(box).toHaveLength(1);
    expect(box[0]).toMatchObject({ op: "create", entityId: t.id, status: "pending", baseVersion: 0 });
  });

  it("dữ liệu không hợp lệ bị từ chối và không ghi gì", async () => {
    await expect(svc.create({ title: "   " })).rejects.toBeInstanceOf(ZodError);
    await expect(svc.create({ title: "x", dueDate: "2026-02-30" })).rejects.toBeInstanceOf(ZodError);
    await expect(svc.create({ title: "x", dueTime: "25:00" })).rejects.toBeInstanceOf(ZodError);
    await expect(svc.create({ title: "x", estimatedMinutes: -5 })).rejects.toBeInstanceOf(ZodError);
    expect(await db.tasks.count()).toBe(0);
    expect(await db.outbox.count()).toBe(0);
  });

  it("hoàn thành và mở lại", async () => {
    const t = await svc.create({ title: "x" });
    const done = await svc.complete(t.id);
    expect(done.status).toBe("COMPLETED");
    expect(done.completedAt).toBeTruthy();
    const re = await svc.reopen(t.id);
    expect(re.status).toBe("TODO");
    expect(re.completedAt).toBeUndefined();
    expect(await db.outbox.count()).toBe(3);
  });

  it("sửa chỉ đổi trường được gửi, giữ nguyên các trường khác", async () => {
    const t = await svc.create({ title: "x", priority: "HIGH", dueDate: "2026-10-09" });
    const u = await svc.update(t.id, { dueDate: "2026-10-10" });
    expect(u.dueDate).toBe("2026-10-10");
    expect(u.priority).toBe("HIGH");
    expect(u.userId).toBe("u1");
  });

  it("xóa mềm: ẩn khỏi danh sách nhưng còn bản ghi để sync", async () => {
    const t = await svc.create({ title: "x" });
    await svc.remove(t.id);
    expect(await repo.listActive("u1")).toEqual([]);
    expect((await db.tasks.get(t.id))?.deletedAt).toBeTruthy();
    expect((await db.outbox.toArray()).map((o) => o.op)).toEqual(["create", "delete"]);
  });

  it("không đọc được việc của user khác", async () => {
    await svc.create({ title: "của u1" });
    expect(await repo.listActive("u2")).toEqual([]);
  });

  it("dữ liệu còn nguyên khi mở lại database (giả lập refresh)", async () => {
    const t = await svc.create({ title: "bền vững" });
    const name = db.name;
    db.close();
    const reopened = new Dang360DB(name);
    expect((await reopened.tasks.get(t.id))?.title).toBe("bền vững");
    expect(await reopened.outbox.count()).toBe(1);
  });
});
