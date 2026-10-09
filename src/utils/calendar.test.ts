import { describe, expect, it } from "vitest";
import type { Task } from "../types";
import { dayOfWeek, groupByDate, monthGrid, shiftMonth, startOfWeek, weekDays } from "./calendar";

const mk = (o: Partial<Task>): Task => ({
  id: crypto.randomUUID(), userId: "u", title: "t", status: "TODO", priority: "MEDIUM",
  createdAt: "", updatedAt: "", version: 0, deviceId: "d", ...o,
});

describe("calendar utils", () => {
  it("dayOfWeek: tuần bắt đầu từ thứ Hai", () => {
    expect(dayOfWeek("2026-10-05")).toBe(0); // thứ Hai
    expect(dayOfWeek("2026-10-09")).toBe(4); // thứ Sáu
    expect(dayOfWeek("2026-10-11")).toBe(6); // Chủ nhật
  });
  it("startOfWeek / weekDays", () => {
    expect(startOfWeek("2026-10-09")).toBe("2026-10-05");
    expect(weekDays("2026-10-11")).toEqual(["2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08", "2026-10-09", "2026-10-10", "2026-10-11"]);
  });
  it("monthGrid tháng 10/2026: bắt đầu T2 28/9, kết thúc CN 1/11, đủ 5 tuần", () => {
    const g = monthGrid(2026, 10);
    expect(g).toHaveLength(5);
    expect(g[0][0]).toBe("2026-09-28");
    expect(g[4][6]).toBe("2026-11-01");
    expect(g.every((w) => w.length === 7)).toBe(true);
  });
  it("monthGrid tháng 2/2026 (28 ngày, bắt đầu Chủ nhật 1/2) có 5 tuần", () => {
    const g = monthGrid(2026, 2);
    expect(g[0][6]).toBe("2026-02-01");
    expect(g[g.length - 1].includes("2026-02-28")).toBe(true);
  });
  it("shiftMonth qua năm", () => {
    expect(shiftMonth(2026, 12, 1)).toEqual({ year: 2027, month: 1 });
    expect(shiftMonth(2026, 1, -1)).toEqual({ year: 2025, month: 12 });
    expect(shiftMonth(2026, 10, 0)).toEqual({ year: 2026, month: 10 });
  });
  it("groupByDate bỏ việc đã xóa/hủy/không hạn và sắp theo giờ", () => {
    const g = groupByDate([
      mk({ title: "b", dueDate: "2026-10-09", dueTime: "15:00" }),
      mk({ title: "a", dueDate: "2026-10-09", dueTime: "08:00" }),
      mk({ title: "c", dueDate: "2026-10-09" }),
      mk({ title: "x", dueDate: "2026-10-09", status: "CANCELLED" }),
      mk({ title: "y", dueDate: "2026-10-09", deletedAt: "z" }),
      mk({ title: "z" }),
    ]);
    expect(Object.keys(g)).toEqual(["2026-10-09"]);
    expect(g["2026-10-09"].map((t) => t.title)).toEqual(["a", "b", "c"]);
  });
});
