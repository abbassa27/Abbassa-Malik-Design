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
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <span className="font-serif text-3xl font-bold text-charcoal">
            Abbassa<span className="text-gold">.</span>
          </span>
          <p className="text-muted text-sm mt-2">Admin Dashboard</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gold-light/50 p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center">
              <Lock size={20} className="text-gold" />
            </div>
            <div>
              <h1 className="font-serif font-bold text-charcoal text-xl">Sign In</h1>
              <p className="text-muted text-xs">Access your orders dashboard</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  required
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                  placeholder="abbassamalik"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gold-light/60 bg-cream focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm text-charcoal"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  required
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gold-light/60 bg-cream focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm text-charcoal"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-charcoal"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3"
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

          <p className="text-center text-xs text-muted mt-6">
            Default dev password: <code className="bg-cream px-1.5 py-0.5 rounded text-charcoal">admin123</code>
            <br />
            <span className="text-red-500 font-medium">Change via ADMIN_PASSWORD_HASH in .env.local</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
// NEW FEATURE END (v3)
