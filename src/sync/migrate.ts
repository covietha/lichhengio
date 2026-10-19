import { db } from "../db/db";
import { clearLegacyUserId, getLegacyUserId, OWNER_ID } from "../services/identity";

/**
 * Trước khi có đồng bộ, mỗi máy dùng một mã người dùng ngẫu nhiên.
 * Chạy một lần lúc khởi động: gán dữ liệu cũ sang mã chủ chung để đồng bộ khớp giữa các máy.
 */
export async function migrateLegacyIdentity(): Promise<void> {
  const old = getLegacyUserId();
  if (!old) return;
  await db.transaction("rw", db.tasks, db.projects, db.goals, db.outbox, async () => {
    await db.tasks.where("userId").equals(old).modify({ userId: OWNER_ID });
    await db.projects.where("userId").equals(old).modify({ userId: OWNER_ID });
    await db.goals.where("userId").equals(old).modify({ userId: OWNER_ID });
    await db.outbox.toCollection().modify((o) => { o.payload.userId = OWNER_ID; });
  });
  clearLegacyUserId();
}
