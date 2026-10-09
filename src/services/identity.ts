/**
 * Phase 1: CHƯA có đăng nhập đám mây. Đây là hồ sơ cục bộ trên máy này,
 * không phải tài khoản. Khi nối Firebase Auth (Phase 3), dữ liệu cục bộ
 * sẽ được gán lại sang uid thật lần đầu đăng nhập.
 */
const USER_KEY = "dang360.localUserId";
const DEVICE_KEY = "dang360.deviceId";

function getOrCreate(key: string): string {
  let v = localStorage.getItem(key);
  if (!v) { v = crypto.randomUUID(); localStorage.setItem(key, v); }
  return v;
}

export const getLocalUserId = () => getOrCreate(USER_KEY);
export const getDeviceId = () => getOrCreate(DEVICE_KEY);
