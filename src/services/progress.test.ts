import { describe, expect, it } from "vitest";
import type { Task } from "../types";
import { progressOf, tasksOfGoal, tasksOfProject } from "./progress";

const mk = (o: Partial<Task>): Task => ({
  id: crypto.randomUUID(), userId: "u", title: "t", status: "TODO", priority: "MEDIUM",
  createdAt: "", updatedAt: "", version: 0, deviceId: "d", ...o,
});

describe("progress", () => {
  it("không có việc → percent null (không bịa 0% hay 100%)", () => {
    expect(progressOf([])).toEqual({ done: 0, total: 0, percent: null });
  });
  it("tính từ việc, bỏ việc đã hủy và đã xóa", () => {
    const p = progressOf([
      mk({ status: "COMPLETED" }), mk({ status: "TODO" }), mk({ status: "IN_PROGRESS" }),
      mk({ status: "CANCELLED" }), mk({ status: "COMPLETED", deletedAt: "x" }),
    ]);
    expect(p).toEqual({ done: 1, total: 3, percent: 33 });
  });
  it("tasksOfProject chỉ lấy việc của dự án", () => {
    const ts = [mk({ projectId: "p1" }), mk({ projectId: "p2" }), mk({}), mk({ projectId: "p1", deletedAt: "x" })];
    expect(tasksOfProject(ts, "p1")).toHaveLength(1);
  });
  it("tasksOfGoal gồm việc gắn trực tiếp và việc thuộc dự án của mục tiêu, không đếm trùng", () => {
    const goal = { id: "g1", projectIds: ["p1"] };
    const ts = [
      mk({ goalId: "g1" }),                    // gắn trực tiếp
      mk({ projectId: "p1" }),                 // qua dự án
      mk({ goalId: "g1", projectId: "p1" }),   // cả hai → chỉ đếm 1 lần
      mk({ projectId: "p2" }),                 // không liên quan
      mk({ goalId: "g2" }),
    ];
    expect(tasksOfGoal(ts, goal)).toHaveLength(3);
  });
});
