import { describe, expect, it } from "vitest";
import { applyClears, splitClears } from "./patch";

describe("patch clear convention", () => {
  it('"" và null nghĩa là xóa trường tùy chọn; trường trong keep không xóa được', () => {
    const { rest, clear } = splitClears<{ title: string; dueDate: string; projectId: string }>(
      { title: "", dueDate: "", projectId: null }, ["title"]);
    expect(rest).toEqual({ title: "" }); // title rỗng vẫn đi tiếp để validator từ chối
    expect(clear.sort()).toEqual(["dueDate", "projectId"]);
  });
  it("undefined bị bỏ qua (không xóa gì)", () => {
    const { rest, clear } = splitClears<{ a: string }>({ a: undefined });
    expect(rest).toEqual({});
    expect(clear).toEqual([]);
  });
  it("applyClears đặt undefined cho trường cần xóa", () => {
    const out = applyClears<{ a: string; b: string }>({ a: "x" }, ["b"]);
    expect(out).toEqual({ a: "x", b: undefined });
    expect("b" in out).toBe(true);
  });
});
