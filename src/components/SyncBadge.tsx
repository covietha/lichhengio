import { useEffect, useState } from "react";
import { usePendingCount } from "../hooks/useData";

/**
 * Phase 1: chưa có kết nối đám mây, nên KHÔNG BAO GIỜ hiện "Đã đồng bộ".
 * Chỉ nói đúng điều đang xảy ra: dữ liệu nằm trên máy này.
 */
export function SyncBadge() {
  const pending = usePendingCount();
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  return (
    <p className="flex items-start gap-2 text-sm text-muted" role="status">
      <span aria-hidden className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${online ? "bg-ok" : "bg-amber"}`} />
      <span>
        {online ? "Đang online" : "Đang offline"}. Lưu trên máy này, chưa cấu hình đồng bộ đám mây
        {pending > 0 ? `. ${pending} thay đổi đang chờ` : ""}
      </span>
    </p>
  );
}
