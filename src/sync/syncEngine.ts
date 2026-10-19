import { useSyncExternalStore } from "react";
import type { Table } from "dexie";
import { db } from "../db/db";
import type { SyncEntity } from "../types";
import { AuthError, markCloudUsed, syncRequest } from "./cloud";
import { collapseOutbox, shouldApply, type Kind } from "./syncCore";

export type Phase = "checking" | "local" | "login" | "idle" | "syncing" | "error" | "offline";
export interface SyncState { phase: Phase; lastSyncedAt?: string }

const CURSOR_KEY = "dang360.syncCursor";
let state: SyncState = { phase: "checking" };
const listeners = new Set<() => void>();

export function setSync(next: Partial<SyncState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}
export const getSyncState = () => state;
export const useSyncState = () =>
  useSyncExternalStore((cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; }, getSyncState);

const getCursor = () => Number(localStorage.getItem(CURSOR_KEY)) || 0;
const setCursor = (n: number) => localStorage.setItem(CURSOR_KEY, String(n));
export const resetCursor = () => localStorage.removeItem(CURSOR_KEY);

const tableOf = (k: Kind) =>
  (k === "task" ? db.tasks : k === "project" ? db.projects : db.goals) as unknown as Table<SyncEntity, string>;

let running = false;
let again = false;

/** Một vòng đồng bộ: gửi thay đổi trên máy, nhận thay đổi từ hệ thống. Trả về true nếu thành công. */
export async function runSync(): Promise<boolean> {
  if (running) { again = true; return false; }
  running = true;
  setSync({ phase: "syncing" });
  let ok = false;
  try {
    const pending = await db.outbox.toArray();
    const { changes, seqs } = collapseOutbox(pending);
    const res = await syncRequest(getCursor(), changes);

    await db.transaction("rw", db.tasks, db.projects, db.goals, async () => {
      const now = new Date().toISOString();
      for (const r of res.records) {
        const t = tableOf(r.kind);
        const local = await t.get(r.data.id);
        if (shouldApply(local, r.data)) await t.put({ ...r.data, version: r.seq, lastSyncedAt: now });
      }
    });
    if (seqs.length) await db.outbox.bulkDelete(seqs);
    setCursor(res.cursor);
    markCloudUsed();
    setSync({ phase: "idle", lastSyncedAt: new Date().toISOString() });
    ok = true;
  } catch (e) {
    if (e instanceof AuthError) setSync({ phase: "login" });
    else setSync({ phase: navigator.onLine ? "error" : "offline" });
  } finally {
    running = false;
    if (again) { again = false; void runSync(); }
  }
  return ok;
}

/** Xóa dữ liệu trên máy này (dùng khi đăng xuất sau khi đã đồng bộ xong). */
export async function wipeLocal() {
  await db.transaction("rw", db.tasks, db.projects, db.goals, db.outbox, async () => {
    await Promise.all([db.tasks.clear(), db.projects.clear(), db.goals.clear(), db.outbox.clear()]);
  });
  resetCursor();
}
