import { useState, useEffect, useCallback, useRef } from "react";
import { notesApi } from "../api/client.js";
import TokensModal from "../components/TokensModal.jsx";
import NoteCard from "../components/NoteCard.jsx";
import NoteEditor from "../components/NoteEditor.jsx";

export default function DashboardPage({ user, onLogout }) {
  const [notes,   setNotes]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [query,   setQuery]   = useState("");
  const [sort,    setSort]    = useState("updated"); // "updated" | "created"
  const [editor,     setEditor]     = useState(null);
  const [showTokens, setShowTokens] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  const fetchNotes = useCallback(async (q, s) => {
    setLoading(true);
    try {
      const res = await notesApi.list(q || undefined, s);
      setNotes(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotes(query, sort); }, [sort]);

  function handleSearch(value) {
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchNotes(value, sort), 300);
  }

  function handleSaved(saved) {
    setNotes(p => {
      const exists = p.find(n => n.id === saved.id);
      const updated = exists ? p.map(n => n.id === saved.id ? saved : n) : [saved, ...p];
      // Re-sort: pinned first, then by sort field
      return [...updated].sort((a, b) => {
        if (a.pinned !== b.pinned) return b.pinned - a.pinned;
        const field = sort === "created" ? "created_at" : "updated_at";
        return new Date(b[field]) - new Date(a[field]);
      });
    });
    setEditor(null);
  }

  function handleDeleted(id) {
    setNotes(p => p.filter(n => n.id !== id));
    setEditor(null);
  }

  const pinned   = notes.filter(n => n.pinned);
  const unpinned = notes.filter(n => !n.pinned);

  return (
    <div className="min-h-screen bg-[#F2EFE9]">
      {/* Navbar */}
      <header className="bg-white border-b-2 border-black px-6 py-3 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          {/* Logo */}
          <div className="border-2 border-black bg-yellow-200 px-3 py-1 shadow-[3px_3px_0px_#000] shrink-0">
            <span className="font-black text-lg tracking-tight">Notes</span>
          </div>

          {/* Search */}
          <div className="flex-1 relative max-w-xl">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 select-none">🔍</span>
            <input
              ref={searchRef}
              value={query}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search by title or content…"
              className="w-full border-2 border-black pl-9 pr-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-black text-sm"
            />
            {query && (
              <button onClick={() => handleSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black font-bold text-lg leading-none">
                ✕
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="border-2 border-black bg-white px-2 py-2 text-sm font-semibold focus:outline-none cursor-pointer hidden sm:block"
          >
            <option value="updated">Last modified</option>
            <option value="created">Date created</option>
          </select>

          {/* Add note */}
          <button onClick={() => setEditor("new")} className="btn-black text-sm py-2 px-4 shrink-0">
            + New note
          </button>

          {/* User */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm font-medium text-gray-600 hidden lg:block">{user.name}</span>
            <button onClick={() => setShowTokens(true)} title="API Tokens" className="btn-outline text-sm py-1.5 px-3">🔑</button>
            <button onClick={onLogout} className="btn-outline text-sm py-1.5 px-3">Out</button>
          </div>
        </div>
      </header>

      {/* Board */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading && (
          <p className="text-center text-sm text-gray-500 mb-4 animate-pulse">Loading…</p>
        )}

        {!loading && notes.length === 0 && (
          <div className="text-center mt-20">
            <div className="inline-block border-2 border-black bg-yellow-100 px-8 py-6 shadow-[4px_4px_0px_#000]">
              <p className="text-2xl font-black mb-2">No notes yet!</p>
              <p className="text-gray-600 text-sm mb-4">{query ? "No results for your search." : "Click «+ New note» to get started."}</p>
              {query && (
                <button onClick={() => handleSearch("")} className="btn-black text-sm py-1.5 px-4">Clear search</button>
              )}
            </div>
          </div>
        )}

        {/* Pinned section */}
        {pinned.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3 flex items-center gap-2">
              <span>📌</span> Pinned
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {pinned.map(n => (
                <NoteCard key={n.id} note={n} onClick={() => setEditor({ note: n })} />
              ))}
            </div>
          </section>
        )}

        {/* All / Other */}
        {unpinned.length > 0 && (
          <section>
            {pinned.length > 0 && (
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Other</h2>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {unpinned.map(n => (
                <NoteCard key={n.id} note={n} onClick={() => setEditor({ note: n })} />
              ))}
            </div>
          </section>
        )}
      </main>

      {showTokens && <TokensModal onClose={() => setShowTokens(false)} />}
      {/* Editor */}
      {editor === "new" && (
        <NoteEditor onClose={() => setEditor(null)} onSaved={handleSaved} onDeleted={handleDeleted} />
      )}
      {editor && editor !== "new" && (
        <NoteEditor note={editor.note} onClose={() => setEditor(null)} onSaved={handleSaved} onDeleted={handleDeleted} />
      )}
    </div>
  );
}
