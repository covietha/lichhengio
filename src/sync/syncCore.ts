import type { OutboxItem, SyncEntity } from "../types";

export type Kind = OutboxItem["entity"];
export interface Change { kind: Kind; data: SyncEntity }
export interface RemoteRecord { kind: Kind; seq: number; data: SyncEntity }

/**
 * Gom các dòng outbox: mỗi bản ghi chỉ gửi phiên bản mới nhất.
 * `seqs` là mọi dòng đã gom, để xóa sau khi gửi thành công.
 */
export function collapseOutbox(items: OutboxItem[]): { changes: Change[]; seqs: number[] } {
  const byKey = new Map<string, OutboxItem>();
  const seqs: number[] = [];
  for (const it of items) {
    if (it.seq !== undefined) seqs.push(it.seq);
    const key = `${it.entity}:${it.entityId}`;
    const prev = byKey.get(key);
    if (!prev || it.payload.updatedAt >= prev.payload.updatedAt) byKey.set(key, it);
  }
  return { changes: [...byKey.values()].map((it) => ({ kind: it.entity, data: it.payload })), seqs };
}

/** Bản trên hệ thống chỉ ghi đè bản trên máy khi nó mới hơn (last-write-wins theo updatedAt). */
export function shouldApply(local: { updatedAt: string } | undefined, remote: { updatedAt: string }): boolean {
  return !local || remote.updatedAt > local.updatedAt;
}
