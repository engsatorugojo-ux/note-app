import express from "express";
import cors from "cors";
import { waitForDb } from "./db.js";
import authRoutes from "./routes/auth.js";
import notesRoutes from "./routes/notes.js";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.get("/health", (_, res) => res.json({ ok: true }));
app.use("/api/auth",  authRoutes);
app.use("/api/notes", notesRoutes);

waitForDb()
  .then(() => app.listen(process.env.PORT || 4001, () =>
    console.log(`Backend on port ${process.env.PORT || 4001}`)))
  .catch(err => { console.error(err.message); process.exit(1); });
