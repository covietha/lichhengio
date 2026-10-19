import { json, requireJsonPost, sessionCookie } from "./_lib.js";

// POST /api/logout -> xóa cookie đăng nhập
export default function handler(req, res) {
  if (!requireJsonPost(req, res)) return;
  res.setHeader("Set-Cookie", sessionCookie("", 0));
  json(res, 200, { ok: true });
}
