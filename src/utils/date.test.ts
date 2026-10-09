import { describe, expect, it } from "vitest";
import { addDays, isValidDateStr, todayStr } from "./date";

describe("date utils", () => {
  it("todayStr dùng múi giờ Việt Nam (UTC+7)", () => {
    expect(todayStr(new Date("2026-10-08T17:30:00Z"))).toBe("2026-10-09");
    expect(todayStr(new Date("2026-10-08T16:30:00Z"))).toBe("2026-10-08");
  });
  it("addDays qua tháng và năm", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-10-09", -9)).toBe("2026-09-30");
  });
  it("isValidDateStr từ chối ngày không tồn tại", () => {
    expect(isValidDateStr("2026-02-30")).toBe(false);
    expect(isValidDateStr("2026-2-3")).toBe(false);
    expect(isValidDateStr("2026-10-09")).toBe(true);
  });
});
