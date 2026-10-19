import { isAuthed, isConfigured, json, OWNER_ID, redis, requireJsonPost } from "./_lib.js";
import { checkChange, parseHash, pickAccepted } from "./_merge.js";

const KEY_RECORDS = "dang360:records";
const KEY_SEQ = "dang360:seq";
const MAX_CHANGES = 500;

/**
 * POST /api/sync { since, changes: [{ kind, data }] }
 *  - nhận các thay đổi của máy khách (bản mới hơn thắng),
 *  - trả về mọi bản ghi có seq > since cùng con trỏ mới.
 */
export default async function handler(req, res) {
  if (!requireJsonPost(req, res)) return;
  if (!isConfigured()) return json(res, 503, { error: "not_configured" });
  if (!isAuthed(req)) return json(res, 401, { error: "unauthorized" });

  const since = Number.isFinite(req.body?.since) ? Math.max(0, req.body.since) : 0;
  const changes = Array.isArray(req.body?.changes) ? req.body.changes : [];
  if (changes.length > MAX_CHANGES) return json(res, 413, { error: "too_many_changes" });
  for (const ch of changes) {
    const bad = checkChange(ch);
    if (bad) return json(res, 400, { error: "invalid_change", field: bad });
  }

  try {
    const [flat, seqRaw] = await redis([["HGETALL", KEY_RECORDS], ["GET", KEY_SEQ]]);
    const existing = parseHash(flat);
    let seq = Number(seqRaw) || 0;

    const accepted = pickAccepted(existing, changes, OWNER_ID);
    if (accepted.length) {
      const [last] = await redis([["INCRBY", KEY_SEQ, accepted.length]]);
      seq = Number(last);
      const args = ["HSET", KEY_RECORDS];
      accepted.forEach((a, i) => {
        const rec = { seq: seq - accepted.length + 1 + i, kind: a.kind, data: a.data };
        existing.set(a.field, rec);
        args.push(a.field, JSON.stringify(rec));
      });
      await redis([args]);
    }

    const records = [...existing.values()].filter((r) => r.seq > since);
    json(res, 200, { cursor: seq, records });
  } catch (e) {
    json(res, 502, { error: "storage", message: String(e?.message || e) });
  }
}
