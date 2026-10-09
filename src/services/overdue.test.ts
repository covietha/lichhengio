import { describe, expect, it } from "vitest";
import type { Task } from "../types";
import { isOverdue, summarize } from "./overdue";

const mk = (o: Partial<Task>): Task => ({
  id: crypto.randomUUID(), userId: "u", title: "t", status: "TODO", priority: "MEDIUM",
  createdAt: "", updatedAt: "", version: 0, deviceId: "d", ...o,
});

describe("overdue engine", () => {
  const today = "2026-10-09";
  it("quá hạn khi hạn < hôm nay và chưa xong", () => {
    expect(isOverdue(mk({ dueDate: "2026-10-08" }), today)).toBe(true);
    expect(isOverdue(mk({ dueDate: "2026-10-08", status: "IN_PROGRESS" }), today)).toBe(true);
  });
  it("không quá hạn khi hạn là hôm nay, tương lai, không có hạn, đã xong, đã hủy, đã xóa", () => {
    expect(isOverdue(mk({ dueDate: today }), today)).toBe(false);
    expect(isOverdue(mk({ dueDate: "2026-10-10" }), today)).toBe(false);
    expect(isOverdue(mk({}), today)).toBe(false);
    expect(isOverdue(mk({ dueDate: "2026-10-01", status: "COMPLETED" }), today)).toBe(false);
    expect(isOverdue(mk({ dueDate: "2026-10-01", status: "CANCELLED" }), today)).toBe(false);
    expect(isOverdue(mk({ dueDate: "2026-10-01", deletedAt: "x" }), today)).toBe(false);
  });
  it("summarize chia đúng nhóm và sắp theo ưu tiên", () => {
    const s = summarize([
      mk({ title: "a", dueDate: today, priority: "LOW" }),
      mk({ title: "b", dueDate: today, priority: "URGENT" }),
      mk({ title: "c", dueDate: today, status: "COMPLETED" }),
      mk({ title: "d", dueDate: "2026-10-05" }),
      mk({ title: "e", dueDate: "2026-10-12" }),
      mk({ title: "f", dueDate: "2026-11-30" }),
    ], today, "2026-10-16");
    expect(s.dueToday.map((t) => t.title)).toEqual(["b", "a"]);
    expect(s.doneToday.map((t) => t.title)).toEqual(["c"]);
    expect(s.overdue.map((t) => t.title)).toEqual(["d"]);
    expect(s.upcoming.map((t) => t.title)).toEqual(["e"]);
  });
});
