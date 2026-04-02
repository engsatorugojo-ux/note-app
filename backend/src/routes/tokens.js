import { Router } from "express";
import crypto from "crypto";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const PREFIX = "na"; // sprint-therapy

function generateToken() {
  return `${PREFIX}_${crypto.randomBytes(32).toString("hex")}`;
}
function hashToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

// GET /api/tokens — list (never expose raw value)
router.get("/", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, prefix, last_used_at, created_at FROM api_tokens WHERE user_id=$1 ORDER BY created_at DESC",
      [req.userId]
    );
    res.json(rows);
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

// POST /api/tokens — create, return raw value ONCE
router.post("/", requireAuth, async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "name is required" });
  try {
    const raw  = generateToken();
    const hash = hashToken(raw);
    const prefix = raw.slice(0, 10) + "…"; // display hint
    const { rows: [token] } = await pool.query(
      "INSERT INTO api_tokens (user_id, name, token_hash, prefix) VALUES ($1,$2,$3,$4) RETURNING id, name, prefix, created_at",
      [req.userId, name.trim(), hash, prefix]
    );
    // Return raw value only this once
    res.status(201).json({ ...token, raw });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

// DELETE /api/tokens/:id — revoke
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "DELETE FROM api_tokens WHERE id=$1 AND user_id=$2 RETURNING id",
      [req.params.id, req.userId]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json({ deleted: true });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

export default router;
