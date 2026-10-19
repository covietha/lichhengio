import type { Change, RemoteRecord } from "./syncCore";

export type SessionInfo =
  | { mode: "local" }                       // chưa cấu hình máy chủ (ví dụ chạy npm run dev)
  | { mode: "cloud"; authed: boolean }
  | { mode: "unreachable" };                // không gọi được máy chủ (offline)

const FLAG = "dang360.cloudUsed";
export const hasUsedCloud = () => localStorage.getItem(FLAG) === "1";
export const markCloudUsed = () => localStorage.setItem(FLAG, "1");
export const clearCloudFlag = () => localStorage.removeItem(FLAG);

export class AuthError extends Error {}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST", credentials: "same-origin",
    headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  if (res.status === 401) throw new AuthError("unauthorized");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export async function getSession(): Promise<SessionInfo> {
  try {
    const res = await fetch("/api/session", { credentials: "same-origin", cache: "no-store" });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.includes("application/json")) return { mode: "local" }; // không có API (chạy ở máy)
    const j = (await res.json()) as { configured: boolean; authed: boolean };
    return j.configured ? { mode: "cloud", authed: j.authed } : { mode: "local" };
  } catch {
    return { mode: "unreachable" };
  }
}

export type LoginResult = "ok" | "wrong" | "locked" | "error";
export async function login(password: string): Promise<LoginResult> {
  try {
    const res = await fetch("/api/login", {
      method: "POST", credentials: "same-origin",
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }),
    });
    if (res.ok) return "ok";
    if (res.status === 401) return "wrong";
    if (res.status === 429) return "locked";
    return "error";
  } catch {
    return "error";
  }
}

export const logout = () => post<{ ok: true }>("/api/logout", {}).catch(() => undefined);

export const syncRequest = (since: number, changes: Change[]) =>
  post<{ cursor: number; records: RemoteRecord[] }>("/api/sync", { since, changes });
