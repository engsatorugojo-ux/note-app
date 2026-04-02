import { useState } from "react";
import { authApi } from "../api/client.js";

export default function AuthPage({ onLogin }) {
  const [mode, setMode]   = useState("login");
  const [form, setForm]   = useState({ email: "", password: "", name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handle(e) { setForm(f => ({ ...f, [e.target.name]: e.target.value })); setError(""); }

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = mode === "login"
        ? await authApi.login({ email: form.email, password: form.password })
        : await authApi.register(form);
      onLogin(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2EFE9] px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block border-4 border-black bg-yellow-200 px-6 py-3 mb-4 shadow-[4px_4px_0px_#000]">
            <h1 className="text-4xl font-black tracking-tight">Notes</h1>
          </div>
          <p className="text-gray-600 text-sm">Your personal note board</p>
        </div>

        {/* Card */}
        <div className="bg-white border-2 border-black shadow-[6px_6px_0px_#000] p-8">
          {/* Tabs */}
          <div className="flex border-2 border-black mb-6">
            {["login", "register"].map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2 text-sm font-bold transition-all ${
                  mode === m ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1">Name</label>
                <input name="name" type="text" value={form.name} onChange={handle}
                  placeholder="Your name" required className="input-field" />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={handle}
                placeholder="you@example.com" required className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">Password</label>
              <input name="password" type="password" value={form.password} onChange={handle}
                placeholder="••••••••" required minLength={6} className="input-field" />
            </div>

            {error && (
              <p className="text-red-600 text-sm border-2 border-red-600 bg-red-50 px-3 py-2 font-medium">{error}</p>
            )}

            <button type="submit" disabled={loading} className="btn-black w-full py-3 text-base disabled:opacity-50">
              {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
