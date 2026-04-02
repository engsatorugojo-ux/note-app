import jwt from "jsonwebtoken";
import crypto from "crypto";
import pool from "../db.js";

// JWT auth (web app)
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    req.userId = jwt.verify(header.slice(7), process.env.JWT_SECRET).userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// Accepts EITHER a JWT (web) OR an API token (external services)
export async function requireAnyAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  const raw = header.slice(7);

  // 1. Try JWT
  try {
    req.userId = jwt.verify(raw, process.env.JWT_SECRET).userId;
    return next();
  } catch {}

  // 2. Try API token
  try {
    const hash = crypto.createHash("sha256").update(raw).digest("hex");
    const { rows } = await pool.query(
      "SELECT user_id FROM api_tokens WHERE token_hash=$1", [hash]
    );
    if (!rows.length) return res.status(401).json({ error: "Invalid token" });
    await pool.query("UPDATE api_tokens SET last_used_at=NOW() WHERE token_hash=$1", [hash]);
    req.userId = rows[0].user_id;
    return next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Unauthorized" });
  }
}
