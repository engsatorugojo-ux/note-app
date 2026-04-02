import { Router } from "express";
import pool from "../db.js";
import { requireAnyAuth } from "../middleware/auth.js";

const router = Router();

const CAPABILITIES = [
  {
    name: "create_note",
    description: "Create a new note",
    method: "POST",
    path: "/api/notes",
    parameters: {
      type: "object",
      properties: {
        title:   { type: "string",  description: "Note title" },
        content: { type: "string",  description: "Note body (markdown supported)" },
        color:   { type: "string",  description: "Background color hex e.g. #FFF9A3 (optional)" },
        pinned:  { type: "boolean", description: "Pin the note to the top (optional)" },
      },
      required: [],
    },
  },
  {
    name: "update_note",
    description: "Update an existing note. Use the id from context data.",
    method: "PUT",
    path: "/api/notes/{id}",
    parameters: {
      type: "object",
      properties: {
        id:      { type: "integer", description: "Note id (required, from context)" },
        title:   { type: "string",  description: "Note title" },
        content: { type: "string",  description: "Note body" },
        color:   { type: "string",  description: "Background color hex" },
        pinned:  { type: "boolean", description: "Pin the note" },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_note",
    description: "Delete a note permanently",
    method: "DELETE",
    path: "/api/notes/{id}",
    parameters: {
      type: "object",
      properties: {
        id: { type: "integer", description: "Note id to delete (required, from context)" },
      },
      required: ["id"],
    },
  },
];

router.get("/", requireAnyAuth, async (req, res) => {
  try {
    const { rows: notes } = await pool.query(
      "SELECT id,title,content,color,pinned,created_at,updated_at FROM notes WHERE user_id=$1 ORDER BY pinned DESC, updated_at DESC LIMIT 100",
      [req.userId]
    );
    res.json({
      app: "Note App",
      description: "Personal note-taking app with post-it style notes",
      total_notes:  notes.length,
      pinned_notes: notes.filter(n => n.pinned).length,
      notes,
      capabilities: CAPABILITIES,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
