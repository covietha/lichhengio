/**
 * Một người dùng duy nhất. Mọi máy dùng cùng một mã chủ sở hữu để dữ liệu đồng bộ
 * khớp nhau; quyền truy cập được bảo vệ bằng đăng nhập (xem /api/login), không phải bằng mã này.
 */
export const OWNER_ID = "owner";
const OLD_USER_KEY = "dang360.localUserId";
const DEVICE_KEY = "dang360.deviceId";

export const getLocalUserId = () => OWNER_ID;

export function getDeviceId(): string {
  let v = localStorage.getItem(DEVICE_KEY);
  if (!v) { v = crypto.randomUUID(); localStorage.setItem(DEVICE_KEY, v); }
  return v;
}

/** Mã người dùng ngẫu nhiên cũ (trước khi có đồng bộ) nếu còn lưu trên máy này. */
export const getLegacyUserId = (): string | null => {
  const v = localStorage.getItem(OLD_USER_KEY);
  return v && v !== OWNER_ID ? v : null;
};
export const clearLegacyUserId = () => localStorage.removeItem(OLD_USER_KEY);
