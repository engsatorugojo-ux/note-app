import { useState, useEffect } from "react";
import axios from "axios";

const api = axios.create();
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export default function TokensModal({ onClose }) {
  const [tokens,  setTokens]  = useState([]);
  const [name,    setName]    = useState("");
  const [newRaw,  setNewRaw]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => { fetchTokens(); }, []);

  async function fetchTokens() {
    try { setTokens((await api.get("/api/tokens")).data); }
    catch { setError("Could not load tokens"); }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await api.post("/api/tokens", { name });
      setNewRaw(res.data.raw);
      setName("");
      setTokens(p => [res.data, ...p]);
    } catch (e) { setError(e.response?.data?.error || "Could not create token"); }
    finally { setLoading(false); }
  }

  async function handleRevoke(id) {
    if (!window.confirm("Revoke this token? It will stop working immediately.")) return;
    try {
      await api.delete(`/api/tokens/${id}`);
      setTokens(p => p.filter(t => t.id !== id));
      if (newRaw) setNewRaw(null);
    } catch { setError("Could not revoke token"); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg bg-white border-2 border-black shadow-[8px_8px_0px_#000] flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black">
          <h2 className="text-lg font-black flex items-center gap-2">🔑 API Tokens</h2>
          <button onClick={onClose} className="font-black text-xl hover:opacity-60 transition leading-none">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* New token shown once */}
          {newRaw && (
            <div className="border-2 border-black bg-yellow-100 p-4">
              <p className="text-xs font-black uppercase tracking-wider mb-2">
                ✅ Copy it now — won't be shown again
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-white border border-black px-3 py-2 font-mono break-all">{newRaw}</code>
                <button onClick={() => navigator.clipboard.writeText(newRaw)}
                  className="btn-black text-xs py-2 px-3 shrink-0">Copy</button>
              </div>
              <button onClick={() => setNewRaw(null)} className="text-xs text-gray-500 hover:text-black mt-2 transition">Dismiss</button>
            </div>
          )}

          {/* Create form */}
          <form onSubmit={handleCreate} className="flex gap-2">
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="Token name (e.g. my-gpt)"
              className="input-field flex-1 text-sm" />
            <button type="submit" disabled={loading || !name.trim()}
              className="btn-black text-sm py-2 px-4 shrink-0 disabled:opacity-50">
              {loading ? "…" : "Generate"}
            </button>
          </form>

          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

          {/* List */}
          <div className="space-y-2">
            {tokens.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No tokens yet</p>
            )}
            {tokens.map(t => (
              <div key={t.id} className="flex items-center justify-between border-2 border-black px-4 py-3">
                <div>
                  <p className="text-sm font-bold">{t.name}</p>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{t.prefix}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Created {new Date(t.created_at).toLocaleDateString()}
                    {t.last_used_at && ` · Last used ${new Date(t.last_used_at).toLocaleDateString()}`}
                  </p>
                </div>
                <button onClick={() => handleRevoke(t.id)}
                  className="text-xs text-red-600 hover:underline font-bold shrink-0 ml-4">
                  Revoke
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-3 border-t-2 border-black bg-gray-50">
          <p className="text-xs text-gray-500">
            <code className="bg-white border border-gray-300 px-1.5 py-0.5">Authorization: Bearer &lt;token&gt;</code>
          </p>
        </div>
      </div>
    </div>
  );
}
