import { Router } from "express";
import pool from "../db.js";
import { requireAnyAuth as requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/notes?q=search&sort=updated|created
router.get("/", requireAuth, async (req, res) => {
  const { q, sort } = req.query;
  const orderCol = sort === "created" ? "created_at" : "updated_at";
  try {
    let query, params;
    if (q && q.trim()) {
      const term = `%${q.trim()}%`;
      query = `SELECT * FROM notes WHERE user_id=$1 AND (title ILIKE $2 OR content ILIKE $2)
               ORDER BY pinned DESC, ${orderCol} DESC`;
      params = [req.userId, term];
    } else {
      query = `SELECT * FROM notes WHERE user_id=$1 ORDER BY pinned DESC, ${orderCol} DESC`;
      params = [req.userId];
    }
    res.json((await pool.query(query, params)).rows);
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

// POST /api/notes
router.post("/", requireAuth, async (req, res) => {
  const { title = "", content = "", color = "#FFFFFF", pinned = false } = req.body;
  try {
    const { rows: [note] } = await pool.query(
      "INSERT INTO notes (user_id,title,content,color,pinned) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [req.userId, title, content, color, pinned]
    );
    res.status(201).json(note);
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

// PUT /api/notes/:id
router.put("/:id", requireAuth, async (req, res) => {
  const { title, content, color, pinned } = req.body;
  try {
    const { rows } = await pool.query(
      "UPDATE notes SET title=$1,content=$2,color=$3,pinned=$4 WHERE id=$5 AND user_id=$6 RETURNING *",
      [title, content, color, pinned, req.params.id, req.userId]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

// DELETE /api/notes/:id
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "DELETE FROM notes WHERE id=$1 AND user_id=$2 RETURNING id",
      [req.params.id, req.userId]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json({ deleted: true });
  } catch (err) { console.error(err); res.status(500).json({ error: "Server error" }); }
});

export default router;
