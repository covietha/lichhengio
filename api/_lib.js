// Hàm dùng chung cho các API trên Vercel. Tên file bắt đầu bằng "_" nên không thành một địa chỉ API.
import { createHmac, timingSafeEqual } from "node:crypto";

export const OWNER_ID = "owner";
export const COOKIE = "dang360_session";
const SESSION_MS = 30 * 24 * 60 * 60 * 1000;

const env = (...names) => names.map((n) => process.env[n]).find(Boolean);
export const config = () => ({
  password: process.env.APP_PASSWORD,
  secret: process.env.SESSION_SECRET,
  redisUrl: env("KV_REST_API_URL", "UPSTASH_REDIS_REST_URL"),
  redisToken: env("KV_REST_API_TOKEN", "UPSTASH_REDIS_REST_TOKEN"),
});
export const isConfigured = () => {
  const c = config();
  return Boolean(c.password && c.secret && c.secret.length >= 16 && c.redisUrl && c.redisToken);
};

/* ---------- Phiên đăng nhập: cookie "hạn.chữ-ký", ký HMAC bằng SESSION_SECRET ---------- */
const sign = (value, secret) => createHmac("sha256", secret).update(value).digest("base64url");

export function makeSession(secret, now = Date.now()) {
  const exp = String(now + SESSION_MS);
  return `${exp}.${sign(exp, secret)}`;
}
export function verifySession(token, secret, now = Date.now()) {
  if (!token || !secret) return false;
  const [exp, sig] = String(token).split(".");
  if (!exp || !sig || !/^\d+$/.test(exp) || Number(exp) < now) return false;
  const a = Buffer.from(sig), b = Buffer.from(sign(exp, secret));
  return a.length === b.length && timingSafeEqual(a, b);
}
export function readCookie(req, name) {
  const raw = req.headers?.cookie || "";
  for (const part of raw.split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return undefined;
}
export const sessionCookie = (token, maxAgeSec) =>
  `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSec}`;
export const SESSION_SECONDS = SESSION_MS / 1000;

export function isAuthed(req) {
  const c = config();
  return verifySession(readCookie(req, COOKIE), c.secret);
}

export function safeEqual(a, b) {
  const x = createHmac("sha256", "cmp").update(String(a)).digest();
  const y = createHmac("sha256", "cmp").update(String(b)).digest();
  return timingSafeEqual(x, y);
}

/* ---------- Redis (Upstash REST), không cần thư viện ---------- */
export async function redis(commands) {
  const { redisUrl, redisToken } = config();
  const res = await fetch(`${redisUrl.replace(/\/$/, "")}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${redisToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error(`Redis HTTP ${res.status}`);
  const out = await res.json();
  return out.map((o) => {
    if (o && o.error) throw new Error(`Redis: ${o.error}`);
    return o.result;
  });
}

/* ---------- Tiện ích trả lời ---------- */
export function json(res, status, body) {
  res.setHeader("Cache-Control", "no-store");
  res.status(status).json(body);
}
export function requireJsonPost(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); json(res, 405, { error: "method" }); return false; }
  // Chặn gửi chéo trang: trình duyệt không gửi được JSON sang miền khác nếu không có CORS.
  if (!String(req.headers["content-type"] || "").includes("application/json")) { json(res, 415, { error: "content-type" }); return false; }
  return true;
}
