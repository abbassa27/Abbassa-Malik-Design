"use client";
// NEW FEATURE START (v6 — Subscription Manager Component)
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw, Plus, CheckCircle, PauseCircle, XCircle,
  Clock, DollarSign, Users, TrendingUp, X,
} from "lucide-react";

interface Subscription {
  id: string; paypalSubId: string | null; clientName: string; clientEmail: string;
  plan: string; amount: number; currency: string; billingCycle: string;
  status: string; startDate: string; nextBillingDate: string | null;
  cancelledAt: string | null; notes: string; createdAt: string;
}

interface SubStats {
  total: number; active: number; mrr: number;
  byPlan: { plan: string; count: number; mrr: number }[];
}

const STATUS_CFG: Record<string, {
  label: string; color: string; bg: string; icon: typeof CheckCircle;
}> = {
  active:    { label: "Active",    color: "text-emerald-300",  bg: "bg-emerald-500/15 border border-emerald-500/25",  icon: CheckCircle },
  paused:    { label: "Paused",    color: "text-amber-200", bg: "bg-amber-500/15 border border-amber-500/25", icon: PauseCircle },
  cancelled: { label: "Cancelled", color: "text-white/50",      bg: "bg-white/5 border border-white/10",     icon: XCircle },
  expired:   { label: "Expired",   color: "text-red-300",    bg: "bg-red-500/15 border border-red-500/25",    icon: Clock },
};

const PLANS = [
  { label: "Basic",        amount: 49,  description: "1 project/month" },
  { label: "Professional", amount: 99,  description: "3 projects/month" },
  { label: "Premium",      amount: 199, description: "Unlimited projects" },
];

export default function SubscriptionManager() {
  const [subs,       setSubs]       = useState<Subscription[]>([]);
  const [stats,      setStats]      = useState<SubStats | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [toast,      setToast]      = useState<{ msg: string; ok: boolean } | null>(null);

  const [form, setForm] = useState({
    clientName: "", clientEmail: "", plan: "Basic",
    amount: "49", currency: "USD", billingCycle: "monthly",
    paypalSubId: "", notes: "",
  });

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchSubs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions");
      if (res.ok) {
        const data = await res.json();
        setSubs(data.subscriptions || []);
        setStats(data.stats || null);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSubs(); }, [fetchSubs]);

  const handlePlanSelect = (plan: typeof PLANS[0]) => {
    setForm((f) => ({ ...f, plan: plan.label, amount: String(plan.amount) }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      });
      if (res.ok) {
        showToast("Subscription created! Confirmation email sent.");
        setShowCreate(false);
        setForm({
          clientName: "", clientEmail: "", plan: "Basic",
          amount: "49", currency: "USD", billingCycle: "monthly",
          paypalSubId: "", notes: "",
        });
        fetchSubs();
      } else {
        showToast("Failed to create subscription", false);
      }
    } catch { showToast("Network error", false); }
    finally { setSaving(false); }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this subscription?")) return;
    setCancelling(id);
    try {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      if (res.ok) { showToast("Subscription cancelled."); fetchSubs(); }
      else showToast("Failed to cancel", false);
    } catch { showToast("Network error", false); }
    finally { setCancelling(null); }
  };

  const filtered = filter === "all" ? subs : subs.filter((s) => s.status === filter);

  return (
    <div className="space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold
              ${toast.ok ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-bold text-white">Subscriptions</h2>
          <p className="text-white/50 text-sm mt-0.5">Manage recurring client subscriptions</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSubs}
            className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center hover:border-gold/40 transition-colors"
          >
            <RefreshCw size={14} className="text-white/45" />
          </button>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 bg-gold text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-gold/90 transition-all"
          >
            <Plus size={16} /> Add Subscription
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total",  value: stats.total,                    icon: Users,       color: "text-white" },
            { label: "Active", value: stats.active,                   icon: CheckCircle, color: "text-emerald-300" },
            { label: "MRR",    value: `$${stats.mrr.toFixed(0)}`,     icon: DollarSign,  color: "text-gold" },
            { label: "ARR",    value: `$${(stats.mrr*12).toFixed(0)}`,icon: TrendingUp,  color: "text-white/90" },
          ].map((k, i) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white/[0.04] rounded-2xl p-5 border border-white/10"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-white/45 text-xs font-medium uppercase tracking-wide">{k.label}</p>
                <k.icon size={15} className={k.color} />
              </div>
              <p className={`font-serif text-2xl font-bold ${k.color}`}>{k.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* MRR by Plan */}
      {stats && stats.byPlan.length > 0 && (
        <div className="bg-white/[0.04] rounded-2xl border border-white/10 p-5">
          <h3 className="font-semibold text-white text-sm mb-4">MRR by Plan</h3>
          <div className="space-y-3">
            {stats.byPlan.map((p) => (
              <div key={p.plan} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-sm text-white/90 font-medium w-28 flex-shrink-0">{p.plan}</span>
                  <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.mrr > 0 ? (p.mrr / stats.mrr) * 100 : 0}%` }}
                      transition={{ duration: 0.7 }}
                      className="h-full bg-gold rounded-full"
                    />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-gold font-bold text-sm">${p.mrr.toFixed(0)}/mo</span>
                  <span className="text-white/45 text-xs ml-2">{p.count} client{p.count !== 1 ? "s" : ""}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="bg-white/[0.04] rounded-2xl border border-white/10 p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white text-lg">Add New Subscription</h3>
              <button
                onClick={() => setShowCreate(false)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X size={14} className="text-white/45" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-5">
              {/* Plan Selector */}
              <div>
                <label className="block text-xs font-semibold text-white/45 uppercase tracking-wide mb-2">
                  Select Plan
                </label>
                <div className="grid sm:grid-cols-3 gap-3">
                  {PLANS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handlePlanSelect(p)}
                      className={`p-4 rounded-xl border-2 text-left transition-all
                        ${form.plan === p.label
                          ? "border-gold bg-gold/10"
                          : "border-white/15 hover:border-gold/40 bg-white/[0.02]"
                        }`}
                    >
                      <p className="font-semibold text-white">{p.label}</p>
                      <p className="text-gold font-bold text-lg">
                        ${p.amount}<span className="text-white/45 text-xs font-normal">/mo</span>
                      </p>
                      <p className="text-white/45 text-xs mt-0.5">{p.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/45 uppercase tracking-wide mb-1.5">
                    Client Name *
                  </label>
                  <input
                    required
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                    placeholder="John Smith"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-white/[0.05]
                               focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm text-white placeholder:text-white/35"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/45 uppercase tracking-wide mb-1.5">
                    Client Email *
                  </label>
                  <input
                    required
                    type="email"
                    value={form.clientEmail}
                    onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
                    placeholder="client@email.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-white/[0.05]
                               focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm text-white placeholder:text-white/35"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/45 uppercase tracking-wide mb-1.5">
                    Billing Cycle
                  </label>
                  <select
                    value={form.billingCycle}
                    onChange={(e) => setForm({ ...form, billingCycle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-white/[0.05]
                               focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm text-white"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/45 uppercase tracking-wide mb-1.5">
                    Amount ({form.currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-white/[0.05]
                               focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-white/45 uppercase tracking-wide mb-1.5">
                    PayPal Subscription ID <span className="text-white/40 font-normal">(optional)</span>
                  </label>
                  <input
                    value={form.paypalSubId}
                    onChange={(e) => setForm({ ...form, paypalSubId: e.target.value })}
                    placeholder="I-XXXXXXXXXX"
                    className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-white/[0.05]
                               focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm text-white font-mono placeholder:text-white/35"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/45 uppercase tracking-wide mb-1.5">
                  Notes <span className="text-white/40 font-normal">(optional)</span>
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  placeholder="Internal notes about this subscription..."
                  className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-white/[0.05]
                             focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm text-white resize-none placeholder:text-white/35"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="bg-gold text-white font-semibold px-8 py-3 rounded-full
                           hover:bg-gold/90 transition-all disabled:opacity-60 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Plus size={16} /> Create Subscription
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {["all", "active", "paused", "cancelled", "expired"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all border
              ${filter === s
                ? "bg-gold text-void border-gold"
                : "bg-white/[0.05] text-white/50 border-white/10 hover:border-gold/35 hover:text-gold"
              }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Subscriptions List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white/[0.04] rounded-2xl border border-white/10">
          <RefreshCw size={40} className="text-gold/30 mx-auto mb-3" />
          <p className="text-white/50 font-medium">No subscriptions yet.</p>
          <p className="text-white/35 text-sm mt-1">Add your first subscription above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((sub) => {
            const sc         = STATUS_CFG[sub.status] || STATUS_CFG.active;
            const StatusIcon = sc.icon;
            return (
              <motion.div
                key={sub.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/[0.04] rounded-2xl border border-white/10 p-5 hover:border-gold/20 transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-white text-base">{sub.clientName}</span>
                      <span
                        className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}
                      >
                        <StatusIcon size={11} /> {sc.label}
                      </span>
                    </div>
                    <p className="text-white/50 text-sm">{sub.clientEmail}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-white/45">
                      <span>Plan: <strong className="text-white">{sub.plan}</strong></span>
                      <span>Cycle: <strong className="text-white capitalize">{sub.billingCycle}</strong></span>
                      {sub.paypalSubId && (
                        <span>PayPal: <span className="font-mono text-white/90">{sub.paypalSubId}</span></span>
                      )}
                      {sub.nextBillingDate && (
                        <span>
                          Next billing: <strong className="text-white">
                            {new Date(sub.nextBillingDate).toLocaleDateString()}
                          </strong>
                        </span>
                      )}
                    </div>
                    {sub.notes && (
                      <p className="text-white/40 text-xs mt-1 italic">{sub.notes}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-gold font-serif">
                      ${sub.amount.toFixed(0)}
                    </p>
                    <p className="text-white/45 text-xs">/{sub.billingCycle}</p>
                    <p className="text-white/40 text-xs mt-1">
                      Since {new Date(sub.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {sub.status === "active" && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleCancel(sub.id)}
                      disabled={cancelling === sub.id}
                      className="flex items-center gap-1.5 text-xs font-semibold text-red-300
                                 border border-red-500/30 px-3 py-1.5 rounded-full hover:bg-red-500/10
                                 transition-colors disabled:opacity-60"
                    >
                      {cancelling === sub.id ? (
                        <span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <XCircle size={12} />
                      )}
                      Cancel Subscription
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
// NEW FEATURE END (v6)