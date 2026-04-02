import { Router } from "express";
import pool from "../db.js";
import { requireAnyAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", requireAnyAuth, async (req, res) => {
  try {
    const { rows: notes } = await pool.query(
      "SELECT id,title,content,color,pinned,created_at,updated_at FROM notes WHERE user_id=$1 ORDER BY pinned DESC, updated_at DESC LIMIT 100",
      [req.userId]
    );
    res.json({
      app: "Note App",
      description: "Personal note-taking app with post-it style notes",
      total_notes: notes.length,
      pinned_notes: notes.filter(n => n.pinned).length,
      notes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
