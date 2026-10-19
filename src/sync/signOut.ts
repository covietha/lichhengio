import { db } from "../db/db";
import { clearCloudFlag, logout } from "./cloud";
import { runSync, wipeLocal } from "./syncEngine";

/** Đăng xuất an toàn: chỉ xóa dữ liệu trên máy khi mọi thay đổi đã lên hệ thống. */
export async function signOut(): Promise<void> {
  if (!confirm("Đăng xuất khỏi máy này?\nDữ liệu sẽ được đồng bộ lên hệ thống, rồi xóa khỏi máy này. Đăng nhập lại là có đủ.")) return;
  const ok = await runSync();
  if (!ok || (await db.outbox.count()) > 0) {
    alert("Chưa đồng bộ xong nên chưa đăng xuất, để không mất dữ liệu. Kiểm tra mạng rồi thử lại.");
    return;
  }
  await logout();
  await wipeLocal();
  clearCloudFlag();
  window.location.assign("/");
}
