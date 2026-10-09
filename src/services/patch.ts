/**
 * Quy ước xóa giá trị: gửi "" (hoặc null) cho một trường nghĩa là XÓA trường đó
 * (ví dụ bỏ liên kết dự án, bỏ hạn). Trường trong `keep` (title, status...) không xóa được.
 */
export type WithClear<T> = { [K in keyof T]?: T[K] | "" | null };

export function splitClears<T extends object>(
  patch: WithClear<T>,
  keep: string[] = [],
): { rest: Partial<T>; clear: (keyof T)[] } {
  const rest: Record<string, unknown> = {};
  const clear: string[] = [];
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) continue;
    if ((v === "" || v === null) && !keep.includes(k)) clear.push(k);
    else rest[k] = v;
  }
  return { rest: rest as Partial<T>, clear: clear as (keyof T)[] };
}

/** Bỏ các khóa undefined rồi gán undefined cho các khóa cần xóa. */
export function applyClears<T extends object>(data: Partial<T>, clear: (keyof T)[]): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) if (v !== undefined) out[k] = v;
  for (const k of clear) out[k as string] = undefined;
  return out as Partial<T>;
}
