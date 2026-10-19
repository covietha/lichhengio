import { describe, expect, it } from "vitest";
import type { OutboxItem, Task } from "../types";
import { collapseOutbox, shouldApply } from "./syncCore";

const task = (id: string, updatedAt: string): Task => ({
  id, userId: "owner", title: id, status: "TODO", priority: "MEDIUM",
  createdAt: "", updatedAt, version: 0, deviceId: "d",
});
const item = (seq: number, t: Task): OutboxItem => ({
  seq, entity: "task", entityId: t.id, op: "update", baseVersion: 0, payload: t,
  attempts: 0, status: "pending", createdAt: t.updatedAt,
});

describe("collapseOutbox", () => {
  it("mỗi bản ghi chỉ gửi bản mới nhất, nhưng giữ mọi seq để xóa", () => {
    const { changes, seqs } = collapseOutbox([
      item(1, task("a", "2026-10-19T01:00:00.000Z")),
      item(2, task("b", "2026-10-19T01:00:00.000Z")),
      item(3, task("a", "2026-10-19T02:00:00.000Z")),
    ]);
    expect(seqs).toEqual([1, 2, 3]);
    expect(changes).toHaveLength(2);
    expect(changes.find((c) => c.data.id === "a")!.data.updatedAt).toBe("2026-10-19T02:00:00.000Z");
  });
  it("hàng đợi rỗng thì không có gì để gửi", () => {
    expect(collapseOutbox([])).toEqual({ changes: [], seqs: [] });
  });
});

describe("shouldApply", () => {
  it("chưa có trên máy thì nhận", () => expect(shouldApply(undefined, { updatedAt: "2026-10-19T01:00:00.000Z" })).toBe(true));
  it("bản hệ thống mới hơn thì ghi đè", () =>
    expect(shouldApply({ updatedAt: "2026-10-19T01:00:00.000Z" }, { updatedAt: "2026-10-19T02:00:00.000Z" })).toBe(true));
  it("bản trên máy mới hơn hoặc bằng thì giữ nguyên", () => {
    expect(shouldApply({ updatedAt: "2026-10-19T02:00:00.000Z" }, { updatedAt: "2026-10-19T01:00:00.000Z" })).toBe(false);
    expect(shouldApply({ updatedAt: "2026-10-19T02:00:00.000Z" }, { updatedAt: "2026-10-19T02:00:00.000Z" })).toBe(false);
  });
});
