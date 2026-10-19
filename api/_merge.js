// Gộp thay đổi từ máy khách vào kho: bản có updatedAt mới hơn thắng (last-write-wins).
export const KINDS = ["task", "project", "goal"];
const ISO = /^\d{4}-\d{2}-\d{2}T/;

/** Trả về lỗi (chuỗi) nếu một thay đổi không hợp lệ, ngược lại null. */
export function checkChange(ch) {
  if (!ch || !KINDS.includes(ch.kind)) return "kind";
  const d = ch.data;
  if (!d || typeof d !== "object" || typeof d.id !== "string" || d.id.length < 1 || d.id.length > 64) return "id";
  if (typeof d.updatedAt !== "string" || !ISO.test(d.updatedAt)) return "updatedAt";
  if (JSON.stringify(d).length > 50_000) return "size";
  return null;
}

/**
 * existing: Map "kind:id" -> { seq, kind, data }
 * Trả về các thay đổi được nhận (chưa gán seq) theo đúng thứ tự.
 */
export function pickAccepted(existing, changes, ownerId) {
  const latest = new Map();
  for (const ch of changes) {
    const f = `${ch.kind}:${ch.data.id}`;
    const prev = latest.get(f);
    if (!prev || ch.data.updatedAt >= prev.data.updatedAt) latest.set(f, ch);
  }
  const accepted = [];
  for (const [field, ch] of latest) {
    const ex = existing.get(field);
    if (!ex || ch.data.updatedAt > ex.data.updatedAt) {
      accepted.push({ field, kind: ch.kind, data: { ...ch.data, userId: ownerId } });
    }
  }
  return accepted;
}

export function parseHash(flat) {
  const map = new Map();
  if (Array.isArray(flat)) {
    for (let i = 0; i + 1 < flat.length; i += 2) {
      try { map.set(flat[i], JSON.parse(flat[i + 1])); } catch { /* bỏ qua bản ghi hỏng */ }
    }
  } else if (flat && typeof flat === "object") {
    for (const [k, v] of Object.entries(flat)) { try { map.set(k, JSON.parse(v)); } catch { /* bỏ qua */ } }
  }
  return map;
}
