import { usePendingCount } from "../hooks/useData";
import { signOut } from "../sync/signOut";
import { useSyncState } from "../sync/syncEngine";

const clock = (iso: string) => new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

/** Chỉ hiện "Đã đồng bộ" khi máy chủ đã xác nhận và không còn thay đổi nào đang chờ. */
export function SyncBadge() {
  const pending = usePendingCount();
  const { phase, lastSyncedAt } = useSyncState();

  let dot = "bg-ok";
  let text: string;
  if (phase === "local") { dot = "bg-amber"; text = "Lưu trên máy này. Chưa bật lưu trên hệ thống."; }
  else if (phase === "offline") { dot = "bg-amber"; text = `Đang offline. Dữ liệu vẫn lưu trên máy này${pending > 0 ? `, ${pending} thay đổi chờ đồng bộ` : ""}.`; }
  else if (phase === "error") { dot = "bg-margin"; text = "Chưa đồng bộ được, sẽ tự thử lại. Dữ liệu vẫn an toàn trên máy này."; }
  else if (phase === "syncing" || !lastSyncedAt) { dot = "bg-pen"; text = "Đang đồng bộ..."; }
  else if (pending > 0) { dot = "bg-pen"; text = `${pending} thay đổi đang chờ đồng bộ.`; }
  else text = `Đã đồng bộ lúc ${clock(lastSyncedAt)}. Có trên mọi máy bạn đăng nhập.`;

  const cloud = phase !== "local";
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
      <p className="flex items-start gap-2" role="status">
        <span aria-hidden className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dot}`} />
        <span>{text}</span>
      </p>
      {cloud && (
        <button onClick={() => void signOut()} className="min-h-9 font-medium text-pen hover:underline">Đăng xuất</button>
      )}
    </div>
  );
}
