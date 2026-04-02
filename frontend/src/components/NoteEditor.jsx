import { useState, useEffect, useRef } from "react";
import { notesApi } from "../api/client.js";
import { COLORS } from "./NoteCard.jsx";

export default function NoteEditor({ note, onClose, onSaved, onDeleted }) {
  const isNew = !note?.id;
  const [title,   setTitle]   = useState(note?.title   ?? "");
  const [content, setContent] = useState(note?.content ?? "");
  const [color,   setColor]   = useState(note?.color   ?? "#FFFFFF");
  const [pinned,  setPinned]  = useState(note?.pinned  ?? false);
  const [saving,  setSaving]  = useState(false);
  const [deleting,setDeleting]= useState(false);
  const [error,   setError]   = useState("");
  const titleRef = useRef(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  async function handleSave() {
    setSaving(true); setError("");
    try {
      const payload = { title, content, color, pinned };
      const res = isNew
        ? await notesApi.create(payload)
        : await notesApi.update(note.id, payload);
      onSaved(res.data);
    } catch (e) { setError(e.response?.data?.error || "Could not save note"); }
    finally     { setSaving(false); }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this note?")) return;
    setDeleting(true);
    try { await notesApi.delete(note.id); onDeleted(note.id); }
    catch { setError("Could not delete note"); setDeleting(false); }
  }

  // Ctrl/Cmd+S to save
  function onKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); handleSave(); }
    if (e.key === "Escape") onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl flex flex-col border-2 border-black shadow-[8px_8px_0px_#000]"
        style={{ backgroundColor: color, maxHeight: "90vh" }}
        onKeyDown={onKeyDown}
      >
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b-2 border-black flex-wrap">
          {/* Color picker */}
          <div className="flex gap-1.5 items-center">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                title={c}
                className="w-5 h-5 border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: c,
                  borderColor: c === color ? "#000" : "#999",
                  transform: c === color ? "scale(1.2)" : undefined,
                  boxShadow: c === color ? "0 0 0 1px #000" : undefined,
                }}
              />
            ))}
          </div>

          <div className="w-px h-5 bg-black/30 mx-1" />

          {/* Pin */}
          <button
            onClick={() => setPinned(p => !p)}
            className={`text-sm px-2 py-0.5 border-2 border-black font-bold transition-all ${
              pinned ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
            }`}
            title={pinned ? "Unpin" : "Pin"}
          >
            📌 {pinned ? "Pinned" : "Pin"}
          </button>

          <div className="flex-1" />

          {/* Close */}
          <button onClick={onClose} className="text-lg font-black leading-none hover:opacity-60 transition-opacity px-1">✕</button>
        </div>

        {/* Title */}
        <input
          ref={titleRef}
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full px-4 pt-4 pb-2 text-xl font-black bg-transparent border-none focus:outline-none placeholder-black/30"
        />

        {/* Content */}
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Write your note… (markdown supported)"
          className="flex-1 w-full px-4 py-2 bg-transparent border-none focus:outline-none resize-none font-mono text-sm leading-relaxed placeholder-black/30 min-h-[300px]"
        />

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t-2 border-black">
          <div>
            {!isNew && (
              <button onClick={handleDelete} disabled={deleting}
                className="text-sm font-bold text-red-600 hover:underline disabled:opacity-50">
                {deleting ? "Deleting…" : "Delete"}
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {error && <span className="text-xs text-red-600 font-bold">{error}</span>}
            <span className="text-xs text-black/40 hidden sm:block">⌘S to save</span>
            <button onClick={onClose} className="btn-outline text-sm py-1.5 px-3">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-black text-sm py-1.5 px-4 disabled:opacity-50">
              {saving ? "Saving…" : isNew ? "Add Note" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
