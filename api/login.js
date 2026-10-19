import { config, isConfigured, json, makeSession, redis, requireJsonPost, safeEqual, sessionCookie, SESSION_SECONDS } from "./_lib.js";

const MAX_FAILS = 10;
const WINDOW_SEC = 15 * 60;

// POST /api/login { password } -> đặt cookie đăng nhập
export default async function handler(req, res) {
  if (!requireJsonPost(req, res)) return;
  if (!isConfigured()) return json(res, 503, { error: "not_configured" });

  const ip = String(req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
  const failKey = `dang360:fail:${ip}`;
  try {
    const [count] = await redis([["GET", failKey]]);
    if (Number(count) >= MAX_FAILS) return json(res, 429, { error: "too_many" });
  } catch { /* nếu Redis lỗi thì vẫn cho thử, vì cần Redis để đồng bộ dữ liệu nên lỗi sẽ hiện ở bước sau */ }

  const password = typeof req.body?.password === "string" ? req.body.password : "";
  if (!password || !safeEqual(password, config().password)) {
    try { await redis([["INCR", failKey], ["EXPIRE", failKey, WINDOW_SEC]]); } catch { /* bỏ qua */ }
    await new Promise((r) => setTimeout(r, 600));
    return json(res, 401, { error: "wrong_password" });
  }
  try { await redis([["DEL", failKey]]); } catch { /* bỏ qua */ }
  res.setHeader("Set-Cookie", sessionCookie(makeSession(config().secret), SESSION_SECONDS));
  json(res, 200, { ok: true });
}
