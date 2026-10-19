import { isAuthed, isConfigured, json } from "./_lib.js";

// GET /api/session -> { configured, authed }
export default function handler(req, res) {
  if (req.method !== "GET") { res.setHeader("Allow", "GET"); return json(res, 405, { error: "method" }); }
  const configured = isConfigured();
  json(res, 200, { configured, authed: configured && isAuthed(req) });
}
