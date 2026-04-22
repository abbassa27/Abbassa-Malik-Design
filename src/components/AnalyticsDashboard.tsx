"use client";
// NEW FEATURE START (v4 — Analytics Dashboard Component)
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, DollarSign, Package, MessageCircle,
  BarChart2, RefreshCw, Clock, Truck, CheckCircle,
} from "lucide-react";

interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  statusCounts: { status: string; count: number }[];
  recentLogs: { id: string; event: string; actor: string; createdAt: string; order: { bookTitle: string } }[];
  ordersByDay: { day: string; count: number }[];
  topPlans: { plan: string; count: number }[];
  messageCount: number;
}

const STATUS_ICONS: Record<string, typeof Clock> = {
  pending:     Clock,
  in_progress: RefreshCw,
  completed:   CheckCircle,
  delivered:   Truck,
};
const STATUS_COLORS: Record<string, string> = {
  pending:     "text-amber-200 bg-amber-500/15 border border-amber-500/25",
  in_progress: "text-sky-200 bg-sky-500/15 border border-sky-500/25",
  completed:   "text-violet-200 bg-violet-500/15 border border-violet-500/25",
  delivered:   "text-emerald-200 bg-emerald-500/15 border border-emerald-500/25",
};
const EVENT_LABELS: Record<string, string> = {
  order_created:   "📝 Order created",
  client_uploaded: "⬆️ Client uploaded",
  admin_uploaded:  "📦 Admin uploaded",
  status_changed:  "🔄 Status changed",
  message_sent:    "💬 Message sent",
};

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
      <motion.div
        initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics");
      if (res.ok) setData(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );
  if (!data) return <p className="text-white/50 text-sm text-center py-10">Failed to load analytics.</p>;

  const topStatus = data.statusCounts.reduce((a, b) => a.count > b.count ? a : b, { status: "", count: 0 });
  const maxDay = Math.max(...data.ordersByDay.map((d) => d.count), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold text-white">Analytics</h2>
        <button onClick={fetchAnalytics} className="flex items-center gap-2 text-sm text-white/50 hover:text-gold border border-white/15 px-3 py-1.5 rounded-full hover:border-gold/40 transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: data.totalOrders, icon: Package, color: "text-white" },
          { label: "Total Revenue", value: `$${data.totalRevenue.toFixed(2)}`, icon: DollarSign, color: "text-gold" },
          { label: "Messages", value: data.messageCount, icon: MessageCircle, color: "text-sky-300" },
          { label: "Avg per Order", value: data.totalOrders > 0 ? `$${(data.totalRevenue / data.totalOrders).toFixed(0)}` : "$0", icon: TrendingUp, color: "text-emerald-300" },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-white/[0.04] rounded-2xl p-5 border border-white/10"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/45 text-xs font-medium uppercase tracking-wide">{k.label}</p>
              <k.icon size={16} className={k.color} />
            </div>
            <p className={`font-serif text-3xl font-bold ${k.color}`}>{k.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white/[0.04] rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 size={16} className="text-gold" />
            <h3 className="font-semibold text-white text-sm">Orders by Status</h3>
          </div>
          <div className="space-y-3">
            {data.statusCounts.map((s) => {
              const Icon = STATUS_ICONS[s.status] || Package;
              const colorCls = STATUS_COLORS[s.status] || "text-white/60 bg-white/5 border border-white/10";
              return (
                <div key={s.status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${colorCls}`}>
                      <Icon size={11} /> {s.status.replace("_", " ")}
                    </span>
                    <span className="text-white font-bold text-sm">{s.count}</span>
                  </div>
                  <MiniBar value={s.count} max={data.totalOrders} color={
                    s.status === "delivered" ? "bg-green-400" :
                    s.status === "completed" ? "bg-purple-400" :
                    s.status === "in_progress" ? "bg-blue-400" : "bg-yellow-400"
                  } />
                </div>
              );
            })}
            {data.statusCounts.length === 0 && <p className="text-white/45 text-sm">No orders yet.</p>}
          </div>
        </div>

        {/* Top Plans */}
        <div className="bg-white/[0.04] rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={16} className="text-gold" />
            <h3 className="font-semibold text-white text-sm">Top Packages</h3>
          </div>
          <div className="space-y-3">
            {data.topPlans.map((p, i) => (
              <div key={p.plan}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white/85 text-sm font-medium">{p.plan}</span>
                  <span className="text-gold font-bold text-sm">{p.count}</span>
                </div>
                <MiniBar value={p.count} max={data.topPlans[0]?.count || 1}
                  color={["bg-gold", "bg-gold/70", "bg-gold/50", "bg-gold/30", "bg-gold/20"][i] || "bg-gold/20"}
                />
              </div>
            ))}
            {data.topPlans.length === 0 && <p className="text-white/45 text-sm">No data yet.</p>}
          </div>
        </div>
      </div>

      {/* Orders by Day (last 30 days) */}
      {data.ordersByDay.length > 0 && (
        <div className="bg-white/[0.04] rounded-2xl border border-white/10 p-6">
          <h3 className="font-semibold text-white text-sm mb-5">Orders — Last 30 Days</h3>
          <div className="flex items-end gap-1 h-20">
            {data.ordersByDay.map((d) => (
              <div key={String(d.day)} className="flex-1 flex flex-col items-center gap-1" title={`${d.day}: ${d.count}`}>
                <motion.div
                  initial={{ height: 0 }} animate={{ height: `${(d.count / maxDay) * 64}px` }}
                  transition={{ duration: 0.6 }}
                  className="w-full bg-gold rounded-t-sm min-h-[2px]"
                  style={{ height: `${(d.count / maxDay) * 64}px` }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-white/45 mt-2">
            <span>{data.ordersByDay[0] ? String(data.ordersByDay[0].day).slice(5) : ""}</span>
            <span>{data.ordersByDay.at(-1) ? String(data.ordersByDay.at(-1)!.day).slice(5) : ""}</span>
          </div>
        </div>
      )}

      {/* Recent Event Logs */}
      <div className="bg-white/[0.04] rounded-2xl border border-white/10 p-6">
        <h3 className="font-semibold text-white text-sm mb-4">Recent Activity</h3>
        {data.recentLogs.length === 0 ? (
          <p className="text-white/45 text-sm">No activity yet.</p>
        ) : (
          <div className="space-y-2">
            {data.recentLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 py-2 border-b border-white/10 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/90">
                    {EVENT_LABELS[log.event] || log.event}
                    <span className="text-white/45 ml-1">— {log.order?.bookTitle}</span>
                  </p>
                  <p className="text-xs text-white/45 mt-0.5">
                    by <span className={`font-medium ${log.actor === "admin" ? "text-gold" : "text-sky-300"}`}>{log.actor}</span>
                    {" · "}
                    {new Date(log.createdAt).toLocaleString([], { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
// NEW FEATURE END (v4)
