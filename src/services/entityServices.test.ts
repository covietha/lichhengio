import { beforeEach, describe, expect, it } from "vitest";
import { ZodError } from "zod";
import { Dang360DB } from "../db/db";
import { DexieGoalRepository, DexieProjectRepository, DexieTaskRepository } from "../repositories/TaskRepository";
import { TaskService } from "./taskService";
import { GoalService, ProjectService } from "./entityServices";

let db: Dang360DB;
let tasks: TaskService, projects: ProjectService, goals: GoalService;
const ctx = { userId: "u1", deviceId: "dev1" };

beforeEach(() => {
  db = new Dang360DB("test-" + crypto.randomUUID());
  tasks = new TaskService(new DexieTaskRepository(db), ctx);
  projects = new ProjectService(new DexieProjectRepository(db), ctx);
  goals = new GoalService(new DexieGoalRepository(db), ctx);
});

describe("Project", () => {
  it("tạo dự án: lưu local + outbox entity=project", async () => {
    const p = await projects.create({ name: "  Ôn thi TN THPT " });
    expect(p.name).toBe("Ôn thi TN THPT");
    expect(p.status).toBe("ACTIVE");
    expect(await db.projects.count()).toBe(1);
    expect((await db.outbox.toArray())[0]).toMatchObject({ entity: "project", op: "create", entityId: p.id });
  });
  it("từ chối tên rỗng và hạn trước ngày bắt đầu", async () => {
    await expect(projects.create({ name: " " })).rejects.toBeInstanceOf(ZodError);
    await expect(projects.create({ name: "x", startDate: "2026-10-10", targetDate: "2026-10-01" })).rejects.toBeInstanceOf(ZodError);
    expect(await db.projects.count()).toBe(0);
  });
  it("sửa: kiểm tra thứ tự ngày theo giá trị đã gộp, giữ id/userId/createdAt/version", async () => {
    const p = await projects.create({ name: "x", startDate: "2026-10-01", targetDate: "2026-10-30" });
    await expect(projects.update(p.id, { targetDate: "2026-09-01" })).rejects.toBeInstanceOf(ZodError);
    const u = await projects.update(p.id, { name: "y", targetDate: "" });
    expect(u).toMatchObject({ id: p.id, userId: "u1", createdAt: p.createdAt, version: 0, name: "y" });
    expect(u.targetDate).toBeUndefined();
  });
  it("xóa dự án không làm mất việc bên trong", async () => {
    const p = await projects.create({ name: "x" });
    const t = await tasks.create({ title: "việc", projectId: p.id });
    await projects.remove(p.id);
    expect((await db.projects.get(p.id))?.deletedAt).toBeTruthy();
    expect((await db.tasks.get(t.id))?.deletedAt).toBeUndefined();
    expect((await db.tasks.get(t.id))?.projectId).toBe(p.id);
  });
});

describe("Goal", () => {
  it("tạo mục tiêu, loại trùng projectIds", async () => {
    const g = await goals.create({ title: "Hoàn thành chương trình 12", projectIds: ["a", "a", "b"] });
    expect(g.projectIds).toEqual(["a", "b"]);
    expect(g.period).toBe("WEEK");
    expect((await db.outbox.toArray())[0]).toMatchObject({ entity: "goal", op: "create" });
  });
  it("từ chối tên rỗng", async () => {
    await expect(goals.create({ title: "" })).rejects.toBeInstanceOf(ZodError);
  });
  it("sửa khung thời gian và liên kết dự án", async () => {
    const g = await goals.create({ title: "x" });
    const u = await goals.update(g.id, { period: "MONTH", projectIds: ["p1"] });
    expect(u).toMatchObject({ id: g.id, period: "MONTH", projectIds: ["p1"], userId: "u1" });
  });
});

describe("Liên kết task ↔ project/goal", () => {
  it("gắn và bỏ gắn bằng chuỗi rỗng", async () => {
    const t = await tasks.create({ title: "x", projectId: "p1", goalId: "g1", dueDate: "2026-10-09" });
    expect(t).toMatchObject({ projectId: "p1", goalId: "g1" });
    const u = await tasks.update(t.id, { projectId: "", dueDate: "" });
    expect(u.projectId).toBeUndefined();
    expect(u.dueDate).toBeUndefined();
    expect(u.goalId).toBe("g1");
  });
  it("không cho xóa tên việc bằng chuỗi rỗng", async () => {
    const t = await tasks.create({ title: "x" });
    await expect(tasks.update(t.id, { title: "" })).rejects.toBeInstanceOf(ZodError);
    expect((await db.tasks.get(t.id))?.title).toBe("x");
  });
  it("update không thể ghi đè version/createdAt/deletedAt", async () => {
    const t = await tasks.create({ title: "x" });
    const repo = new DexieTaskRepository(db);
    const u = await repo.update(t.id, { version: 99, createdAt: "1999", deletedAt: "2000", title: "y" });
    expect(u).toMatchObject({ version: 0, createdAt: t.createdAt, title: "y" });
    expect(u.deletedAt).toBeUndefined();
  });
});

describe("Nâng cấp schema v1 → v2", () => {
  it("dữ liệu task cũ được giữ nguyên sau khi mở bằng schema mới", async () => {
    const name = "upgrade-" + crypto.randomUUID();
    const { default: Dexie } = await import("dexie");
    const old = new Dexie(name);
    old.version(1).stores({
      tasks: "id, userId, status, priority, dueDate, projectId, goalId, categoryId, deletedAt, [userId+dueDate], [userId+status]",
      outbox: "++seq, entityId, status",
    });
    await old.table("tasks").add({ id: "t1", userId: "u1", title: "cũ", status: "TODO", priority: "LOW", createdAt: "", updatedAt: "", version: 0, deviceId: "d" });
    old.close();
    const upgraded = new Dang360DB(name);
    expect((await upgraded.tasks.get("t1"))?.title).toBe("cũ");
    expect(await upgraded.projects.count()).toBe(0);
  });
});
