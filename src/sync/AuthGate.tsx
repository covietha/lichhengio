import { useEffect, type ReactNode } from "react";
import { usePendingCount } from "../hooks/useData";
import { getSession } from "./cloud";
import { LoginScreen } from "./LoginScreen";
import { runSync, setSync, useSyncState } from "./syncEngine";

const POLL_MS = 30_000;
const DEBOUNCE_MS = 1_500;

/** Tự đồng bộ: lúc mở, khi có thay đổi, khi có mạng lại, khi quay lại tab và mỗi 30 giây. */
function SyncRunner() {
  const pending = usePendingCount();
  useEffect(() => {
    const go = () => void runSync();
    go();
    const id = setInterval(go, POLL_MS);
    window.addEventListener("online", go);
    window.addEventListener("focus", go);
    return () => { clearInterval(id); window.removeEventListener("online", go); window.removeEventListener("focus", go); };
  }, []);
  useEffect(() => {
    if (pending === 0) return;
    const id = setTimeout(() => void runSync(), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [pending]);
  return null;
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { phase } = useSyncState();

  useEffect(() => {
    let alive = true;
    void getSession().then((s) => {
      if (!alive) return;
      if (s.mode === "local") setSync({ phase: "local" });
      else if (s.mode === "cloud") setSync({ phase: s.authed ? "idle" : "login" });
      // Không gọi được máy chủ (offline): vẫn mở dữ liệu trên máy, sẽ đồng bộ khi có mạng.
      else setSync({ phase: "offline" });
    });
    return () => { alive = false; };
  }, []);

  if (phase === "checking") return <p className="p-6 text-sm text-muted">Đang mở...</p>;
  if (phase === "login") return <LoginScreen onSuccess={() => setSync({ phase: "idle" })} />;
  return (
    <>
      {children}
      {phase !== "local" && <SyncRunner />}
    </>
  );
}
