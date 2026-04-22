"use client";
// NEW FEATURE START (v3 — Admin Login)
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, User, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
      } else {
        router.push("/admin/dashboard");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <span className="font-serif text-3xl font-bold text-white">
            Abbassa<span className="text-gold">.</span>
          </span>
          <p className="text-white/50 text-sm mt-2">Admin Dashboard</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-10 shadow-[0_0_0_1px_rgba(212,175,55,0.08)]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gold/15 rounded-xl flex items-center justify-center border border-gold/25">
              <Lock size={20} className="text-gold" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-white text-xl">Sign In</h1>
              <p className="text-white/45 text-xs">Access your orders dashboard</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  required
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                  placeholder="abbassamalik"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/15 bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-gold/35 text-sm text-white placeholder:text-white/35"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  required
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-white/15 bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-gold/35 text-sm text-white placeholder:text-white/35"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/45 hover:text-gold transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-500/10 border border-red-500/30 text-red-200 text-sm rounded-xl px-4 py-3"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold text-white font-semibold py-3.5 rounded-full hover:bg-gold/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-center text-xs text-white/45 mt-6 leading-relaxed">
            Local dev (no <code className="text-gold/90">ADMIN_PASSWORD_HASH</code>): username{" "}
            <code className="bg-white/10 px-1 py-0.5 rounded text-gold">abbassamalik</code> or{" "}
            <code className="bg-white/10 px-1 py-0.5 rounded text-gold">abbassa</code>, password{" "}
            <code className="bg-white/10 px-1 py-0.5 rounded text-gold">admin123</code>
            <br />
            <span className="text-red-400 font-medium">Production: set ADMIN_PASSWORD_HASH and restart.</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
// NEW FEATURE END (v3)
