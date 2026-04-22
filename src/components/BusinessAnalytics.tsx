"use client";
// NEW FEATURE START (v5 — Business Analytics Dashboard)
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  DollarSign, TrendingUp, TrendingDown, Package,
  BarChart2, RefreshCw, Award, Calendar, ArrowUpRight,
  ArrowDownRight, Minus,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface MonthlyRow  { month: number;   revenue: number; orders: number }
interface QuarterRow  { quarter: number; revenue: number; orders: number }
interface YearlyRow   { year: number;    revenue: number; orders: number }
interface ServiceRow  { plan: string;    count: number; revenue: number; avg: number }
interface Profitability {
  thisMonthRevenue: number; thisMonthOrders: number;
  lastMonthRevenue: number; lastMonthOrders: number;
  allTimeRevenue: number;   allTimeOrders: number;
  avgPerOrder: number;      momGrowth: number;
}
interface BusinessData {
  monthly: MonthlyRow[];
  quarterly: QuarterRow[];
  yearly: YearlyRow[];
  services: ServiceRow[];
  profitability: Profitability;
  year: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const QTR_LABELS = ["Q1 (Jan–Mar)","Q2 (Apr–Jun)","Q3 (Jul–Sep)","Q4 (Oct–Dec)"];
const fmt = (n: number) => n >= 1000 ? `$${(n/1000).toFixed(1)}k` : `$${n.toFixed(0)}`;

function GrowthBadge({ pct }: { pct: number }) {
  const up = pct > 0;
  const flat = pct === 0;
  const Icon = flat ? Minus : up ? ArrowUpRight : ArrowDownRight;
  const color = flat ? "text-white/50 bg-white/10 border border-white/10" : up ? "text-emerald-300 bg-emerald-500/15 border border-emerald-500/25" : "text-red-300 bg-red-500/15 border border-red-500/25";
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      <Icon size={11} /> {flat ? "—" : `${Math.abs(pct).toFixed(1)}%`}
    </span>
  );
}

// ── Bar chart (pure CSS) ──────────────────────────────────────────────────────
function BarRow({ label, value, maxVal, color, sub }: {
  label: string; value: number; maxVal: number; color: string; sub?: string;
}) {
  const pct = maxVal > 0 ? (value / maxVal) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-white/45 w-10 flex-shrink-0 text-right">{label}</span>
      <div className="flex-1 bg-white/10 rounded-full h-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <span className="text-xs font-bold text-white/90 w-14 flex-shrink-0">{fmt(value)}</span>
      {sub && <span className="text-xs text-white/45 w-8 flex-shrink-0">{sub}</span>}
    </div>
  );
}

// ── Column chart (CSS flex) ───────────────────────────────────────────────────
function ColumnChart({ data, getLabel, getValue, getOrders, color }: {
  data: { label: string; value: number; orders: number }[];
  getLabel: (d: { label: string }) => string;
  getValue: (d: { value: number }) => number;
  getOrders: (d: { orders: number }) => number;
  color: string;
}) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-28">
      {data.map((d, i) => {
        const h = Math.max((d.value / maxVal) * 96, 4);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group" title={`${getLabel(d)}: ${fmt(getValue(d))} · ${getOrders(d)} orders`}>
            <span className="text-xs text-gold font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {fmt(getValue(d))}
            </span>
            <motion.div
              initial={{ height: 0 }} animate={{ height: `${h}px` }}
              transition={{ duration: 0.6, delay: i * 0.04 }}
              className={`w-full rounded-t-md ${color} cursor-pointer`}
              style={{ height: `${h}px` }}
            />
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function BusinessAnalytics() {
  const [data, setData] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?mode=business&year=${year}`);
      if (res.ok) setData(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );
  if (!data) return <p className="text-white/50 text-center py-12">Failed to load business analytics.</p>;

  const { profitability: p, services, monthly, quarterly, yearly } = data;

  // Build chart data arrays
  const monthlyChartData = MONTHS.map((label, i) => {
    const row = monthly.find((r) => r.month === i + 1);
    return { label, value: row?.revenue || 0, orders: row?.orders || 0 };
  });

  const quarterlyChartData = QTR_LABELS.map((label, i) => {
    const row = quarterly.find((r) => r.quarter === i + 1);
    return { label, value: row?.revenue || 0, orders: row?.orders || 0 };
  });

  const yearlyChartData = yearly.map((r) => ({
    label: String(r.year), value: r.revenue, orders: r.orders,
  }));

  const activeChartData = view === "monthly" ? monthlyChartData
    : view === "quarterly" ? quarterlyChartData : yearlyChartData;

  const maxService = Math.max(...services.map((s) => s.revenue), 1);
  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-7">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-bold text-white">Business Analytics</h2>
          <p className="text-white/50 text-sm mt-0.5">Profitability, growth & service insights</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-3 py-2 rounded-full border border-white/15 text-sm text-white bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-gold/30"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-gold border border-white/15 px-3 py-2 rounded-full hover:border-gold/40 transition-colors"
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </div>

      {/* ── KPI Profitability Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "This Month",
            value: fmt(p.thisMonthRevenue),
            sub: `${p.thisMonthOrders} orders`,
            badge: <GrowthBadge pct={p.momGrowth} />,
            icon: DollarSign,
            color: "text-gold",
          },
          {
            label: "Last Month",
            value: fmt(p.lastMonthRevenue),
            sub: `${p.lastMonthOrders} orders`,
            badge: null,
            icon: Calendar,
            color: "text-white/45",
          },
          {
            label: "All-Time Revenue",
            value: fmt(p.allTimeRevenue),
            sub: `${p.allTimeOrders} total orders`,
            badge: null,
            icon: TrendingUp,
            color: "text-emerald-300",
          },
          {
            label: "Avg per Order",
            value: fmt(p.avgPerOrder),
            sub: "net average",
            badge: null,
            icon: Package,
            color: "text-white",
          },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="bg-white/[0.04] rounded-2xl p-5 border border-white/10"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/45 text-xs font-medium uppercase tracking-wide">{k.label}</p>
              <k.icon size={15} className={k.color} />
            </div>
            <div className="flex items-end gap-2">
              <p className={`font-serif text-2xl font-bold ${k.color}`}>{k.value}</p>
              {k.badge}
            </div>
            <p className="text-white/45 text-xs mt-1">{k.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Revenue Chart ─────────────────────────────────────────────── */}
      <div className="bg-white/[0.04] rounded-2xl border border-white/10 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <BarChart2 size={16} className="text-gold" />
            <h3 className="font-semibold text-white">Revenue Growth</h3>
          </div>
          <div className="flex bg-white/[0.06] rounded-full p-1 gap-1 border border-white/10">
            {(["monthly","quarterly","yearly"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
                  view === v ? "bg-gold text-void shadow-sm" : "text-white/50 hover:text-white/85"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Column chart */}
        <ColumnChart
          data={activeChartData}
          getLabel={(d) => d.label}
          getValue={(d) => d.value}
          getOrders={(d) => d.orders}
          color="bg-gold"
        />

        {/* X-axis labels */}
        <div className={`flex mt-2 ${view === "monthly" ? "gap-1.5" : view === "quarterly" ? "gap-1.5" : "gap-1.5"}`}>
          {activeChartData.map((d, i) => (
            <div key={i} className="flex-1 text-center">
              <span className="text-xs text-white/45 truncate block">
                {view === "quarterly" ? `Q${i + 1}` : d.label}
              </span>
            </div>
          ))}
        </div>

        {/* Summary row */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/10">
          <div>
            <p className="text-xs text-white/45">Total {view === "yearly" ? "All-Time" : year}</p>
            <p className="text-white font-bold text-sm">
              {fmt(activeChartData.reduce((s, d) => s + d.value, 0))}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/45">Total Orders</p>
            <p className="text-white font-bold text-sm">
              {activeChartData.reduce((s, d) => s + d.orders, 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-white/45">Peak {view === "monthly" ? "Month" : view === "quarterly" ? "Quarter" : "Year"}</p>
            <p className="text-white font-bold text-sm">
              {activeChartData.reduce((best, d) => d.value > best.value ? d : best, { label: "—", value: 0, orders: 0 }).label}
            </p>
          </div>
        </div>
      </div>

      {/* ── Service Breakdown Table ───────────────────────────────────── */}
      <div className="bg-white/[0.04] rounded-2xl border border-white/10 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Award size={16} className="text-gold" />
          <h3 className="font-semibold text-white">Top Services — Breakdown</h3>
        </div>

        {services.length === 0 ? (
          <p className="text-white/45 text-sm">No service data yet.</p>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-xs font-semibold text-white/45 uppercase tracking-wide py-2 pr-4">Service / Package</th>
                    <th className="text-right text-xs font-semibold text-white/45 uppercase tracking-wide py-2 px-4">Orders</th>
                    <th className="text-right text-xs font-semibold text-white/45 uppercase tracking-wide py-2 px-4">Total Revenue</th>
                    <th className="text-right text-xs font-semibold text-white/45 uppercase tracking-wide py-2 pl-4">Avg / Order</th>
                    <th className="text-left text-xs font-semibold text-white/45 uppercase tracking-wide py-2 pl-6 w-40">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s, i) => (
                    <tr key={s.plan} className="border-b border-white/[0.06] last:border-0 hover:bg-white/[0.04] transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            i === 0 ? "bg-gold" : i === 1 ? "bg-gold/60" : "bg-gold/30"
                          }`} />
                          <span className="font-semibold text-white/90">{s.plan}</span>
                          {i === 0 && (
                            <span className="text-xs bg-gold/10 text-gold font-semibold px-2 py-0.5 rounded-full">
                              Best Seller
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-white">{s.count}</td>
                      <td className="py-3 px-4 text-right font-bold text-gold">{fmt(s.revenue)}</td>
                      <td className="py-3 pl-4 text-right text-white/45">{fmt(s.avg)}</td>
                      <td className="py-3 pl-6">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(s.revenue / maxService) * 100}%` }}
                              transition={{ duration: 0.7, delay: i * 0.1 }}
                              className="h-full bg-gold rounded-full"
                            />
                          </div>
                          <span className="text-xs text-white/45 w-8 text-right flex-shrink-0">
                            {p.allTimeRevenue > 0 ? `${((s.revenue / p.allTimeRevenue) * 100).toFixed(0)}%` : "—"}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-white/[0.06]">
                    <td className="py-3 pr-4 font-bold text-white text-sm">Total</td>
                    <td className="py-3 px-4 text-right font-bold text-white">{services.reduce((s, r) => s + r.count, 0)}</td>
                    <td className="py-3 px-4 text-right font-bold text-gold">{fmt(services.reduce((s, r) => s + r.revenue, 0))}</td>
                    <td className="py-3 pl-4 text-right text-white/45">—</td>
                    <td className="py-3 pl-6" />
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="sm:hidden space-y-3">
              {services.map((s, i) => (
                <div key={s.plan} className="bg-white/[0.05] border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-white/90 text-sm">{s.plan}</span>
                    {i === 0 && <span className="text-xs bg-gold/10 text-gold font-semibold px-2 py-0.5 rounded-full">Best Seller</span>}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-white/45">Orders</p>
                      <p className="font-bold text-white">{s.count}</p>
                    </div>
                    <div>
                      <p className="text-white/45">Revenue</p>
                      <p className="font-bold text-gold">{fmt(s.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-white/45">Avg/Order</p>
                      <p className="font-bold text-white">{fmt(s.avg)}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(s.revenue / maxService) * 100}%` }}
                        transition={{ duration: 0.7, delay: i * 0.1 }}
                        className="h-full bg-gold rounded-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Quarterly Highlights ─────────────────────────────────────── */}
      <div className="bg-white/[0.04] rounded-2xl border border-white/10 p-6">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={16} className="text-gold" />
          <h3 className="font-semibold text-white">Quarterly Highlights — {year}</h3>
        </div>
        <div className="grid sm:grid-cols-4 gap-4">
          {["Q1","Q2","Q3","Q4"].map((q, i) => {
            const row = quarterly.find((r) => r.quarter === i + 1);
            const prev = quarterly.find((r) => r.quarter === i);
            const growth = prev && prev.revenue > 0
              ? ((row?.revenue || 0) - prev.revenue) / prev.revenue * 100
              : 0;
            return (
              <motion.div
                key={q}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-white/[0.05] border border-white/10 rounded-xl p-4 text-center"
              >
                <p className="text-xs text-white/45 font-medium uppercase tracking-wide mb-1">{q}</p>
                <p className="font-serif text-2xl font-bold text-gold">{fmt(row?.revenue || 0)}</p>
                <p className="text-white/45 text-xs mt-0.5">{row?.orders || 0} orders</p>
                {i > 0 && <div className="mt-1.5 flex justify-center"><GrowthBadge pct={growth} /></div>}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
// NEW FEATURE END (v5)
