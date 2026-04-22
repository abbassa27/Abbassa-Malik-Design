"use client";
// NEW FEATURE START (v7 — Year-over-Year Analytics + CSV Export)
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Download, RefreshCw,
  BarChart2, Calendar,
} from "lucide-react";

interface MonthData {
  month:   number;
  revenue: number;
  orders:  number;
}

interface YearData {
  year:     number;
  monthly:  MonthData[];
  total:    number;
  orders:   number;
}

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

function exportYearCSV(years: YearData[]) {
  const headers = ["Month", ...years.map((y) => `Revenue ${y.year}`), ...years.map((y) => `Orders ${y.year}`)];
  const rows = MONTHS.map((mon, i) => [
    mon,
    ...years.map((y) => {
      const m = y.monthly.find((m) => m.month === i + 1);
      return m ? m.revenue.toFixed(2) : "0.00";
    }),
    ...years.map((y) => {
      const m = y.monthly.find((m) => m.month === i + 1);
      return m ? m.orders : 0;
    }),
  ]);

  const summary = [
    [],
    ["SUMMARY"],
    ["Year", ...years.map((y) => y.year)],
    ["Total Revenue", ...years.map((y) => y.total.toFixed(2))],
    ["Total Orders",  ...years.map((y) => y.orders)],
  ];

  const csv = [...[headers, ...rows, ...summary]]
    .map((r) => r.join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `year-comparison-${new Date().getFullYear()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function GrowthBadge({ current, previous, label }: {
  current: number; previous: number; label: string;
}) {
  if (previous === 0) return null;
  const pct = ((current - previous) / previous) * 100;
  const up  = pct >= 0;
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
      ${up ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25" : "bg-red-500/15 text-red-300 border border-red-500/25"}`}
    >
      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {up ? "+" : ""}{pct.toFixed(1)}% {label}
    </div>
  );
}

export default function YearComparisonReport() {
  const currentYear = new Date().getFullYear();
  const [yearA, setYearA] = useState(currentYear);
  const [yearB, setYearB] = useState(currentYear - 1);
  const [dataA, setDataA] = useState<YearData | null>(null);
  const [dataB, setDataB] = useState<YearData | null>(null);
  const [loading, setLoading] = useState(false);
  const [metric,  setMetric]  = useState<"revenue" | "orders">("revenue");

  const fetchYear = useCallback(async (year: number): Promise<YearData> => {
    const res  = await fetch(`/api/analytics/business?year=${year}`);
    const data = await res.json();
    const monthly: MonthData[] = data.monthly || [];
    const total  = monthly.reduce((s: number, m: MonthData) => s + m.revenue, 0);
    const orders = monthly.reduce((s: number, m: MonthData) => s + m.orders,  0);
    return { year, monthly, total, orders };
  }, []);

  const fetchBoth = useCallback(async () => {
    setLoading(true);
    try {
      const [a, b] = await Promise.all([fetchYear(yearA), fetchYear(yearB)]);
      setDataA(a);
      setDataB(b);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [yearA, yearB, fetchYear]);

  useEffect(() => { fetchBoth(); }, [fetchBoth]);

  const maxVal = Math.max(
    ...(dataA?.monthly.map((m) => metric === "revenue" ? m.revenue : m.orders) || [0]),
    ...(dataB?.monthly.map((m) => metric === "revenue" ? m.revenue : m.orders) || [0]),
    1,
  );

  const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-bold text-white">Year Comparison</h2>
          <p className="text-white/50 text-sm mt-0.5">Compare revenue & orders year-over-year</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchBoth}
            className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center hover:border-gold/40 transition-colors"
          >
            <RefreshCw size={14} className={`text-white/45 ${loading ? "animate-spin" : ""}`} />
          </button>
          {dataA && dataB && (
            <button
              onClick={() => exportYearCSV([dataA, dataB])}
              className="flex items-center gap-2 border border-white/15 text-white px-4 py-2 rounded-full
                         text-sm font-semibold hover:border-gold/40 hover:text-gold transition-colors"
            >
              <Download size={14} /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Year Selectors + Metric Toggle */}
      <div className="flex flex-wrap items-center gap-4 bg-white/[0.04] rounded-2xl border border-white/10 p-5">
        <div className="flex items-center gap-3">
          <Calendar size={16} className="text-gold" />
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-white/50">Year A:</label>
            <select
              value={yearA}
              onChange={(e) => setYearA(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl border border-white/15 bg-white/[0.06] text-sm text-white
                         focus:outline-none focus:ring-2 focus:ring-gold/30"
            >
              {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <span className="text-white/45 font-medium">vs</span>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-white/50">Year B:</label>
            <select
              value={yearB}
              onChange={(e) => setYearB(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl border border-white/15 bg-white/[0.06] text-sm text-white
                         focus:outline-none focus:ring-2 focus:ring-gold/30"
            >
              {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white/[0.06] rounded-full px-1.5 py-1 ml-auto border border-white/10">
          <button
            onClick={() => setMetric("revenue")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all
              ${metric === "revenue" ? "bg-gold text-void shadow-sm" : "text-white/50 hover:text-white/80"}`}
          >
            Revenue
          </button>
          <button
            onClick={() => setMetric("orders")}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all
              ${metric === "orders" ? "bg-gold text-void shadow-sm" : "text-white/50 hover:text-white/80"}`}
          >
            Orders
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {dataA && dataB && (
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { data: dataA, color: "text-gold",     bar: "bg-gold" },
            { data: dataB, color: "text-white/90", bar: "bg-white/30" },
          ].map(({ data, color, bar }) => (
            <motion.div
              key={data.year}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white/[0.04] rounded-2xl p-5 border border-white/10"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${bar}`} />
                  <p className="font-serif text-2xl font-bold text-white">{data.year}</p>
                </div>
                <BarChart2 size={16} className="text-white/40" />
              </div>
              <p className={`font-bold text-3xl ${color} mb-1`}>
                {metric === "revenue" ? `$${data.total.toFixed(0)}` : data.orders}
              </p>
              <p className="text-white/45 text-xs">
                {metric === "revenue" ? "Total Revenue" : "Total Orders"}
              </p>
              {data.year === yearA && dataB && (
                <div className="mt-2">
                  <GrowthBadge
                    current={metric === "revenue" ? dataA.total : dataA.orders}
                    previous={metric === "revenue" ? dataB.total : dataB.orders}
                    label="YoY"
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Monthly Bar Chart */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      ) : dataA && dataB ? (
        <div className="bg-white/[0.04] rounded-2xl border border-white/10 p-6">
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <h3 className="font-semibold text-white">Monthly Breakdown</h3>
            <div className="flex items-center gap-3 ml-auto flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-white/50">
                <div className="w-3 h-3 rounded-full bg-gold" />
                {yearA}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/50">
                <div className="w-3 h-3 rounded-full bg-white/30" />
                {yearB}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-1 items-end" style={{ height: "180px" }}>
            {MONTHS.map((mon, i) => {
              const mA = dataA.monthly.find((m) => m.month === i + 1);
              const mB = dataB.monthly.find((m) => m.month === i + 1);
              const vA = mA ? (metric === "revenue" ? mA.revenue : mA.orders) : 0;
              const vB = mB ? (metric === "revenue" ? mB.revenue : mB.orders) : 0;
              const hA = maxVal > 0 ? (vA / maxVal) * 140 : 0;
              const hB = maxVal > 0 ? (vB / maxVal) * 140 : 0;

              return (
                <div key={mon} className="col-span-1 flex flex-col items-center gap-0.5">
                  <div className="flex items-end gap-0.5 w-full justify-center" style={{ height: "148px" }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: hA }}
                      transition={{ duration: 0.6, delay: i * 0.04 }}
                      className="w-3 bg-gold rounded-t-sm flex-shrink-0"
                      title={`${yearA}: ${metric === "revenue" ? `$${vA.toFixed(0)}` : vA}`}
                    />
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: hB }}
                      transition={{ duration: 0.6, delay: i * 0.04 + 0.02 }}
                      className="w-3 bg-white/25 rounded-t-sm flex-shrink-0"
                      title={`${yearB}: ${metric === "revenue" ? `$${vB.toFixed(0)}` : vB}`}
                    />
                  </div>
                  <p className="text-white/40 text-[9px] font-medium">{mon}</p>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Detailed Monthly Table */}
      {dataA && dataB && (
        <div className="bg-white/[0.04] rounded-2xl border border-white/10 overflow-hidden">
          <div className="px-5 py-3 bg-white/[0.06] border-b border-white/10">
            <h3 className="font-semibold text-white text-sm">Monthly Detail</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-white/45 uppercase tracking-wide">Month</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-white/45 uppercase tracking-wide">
                    Revenue {yearA}
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-white/45 uppercase tracking-wide">
                    Revenue {yearB}
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-white/45 uppercase tracking-wide">
                    Δ Revenue
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-white/45 uppercase tracking-wide">
                    Orders {yearA}
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-white/45 uppercase tracking-wide">
                    Orders {yearB}
                  </th>
                </tr>
              </thead>
              <tbody>
                {MONTHS.map((mon, i) => {
                  const mA = dataA.monthly.find((m) => m.month === i + 1);
                  const mB = dataB.monthly.find((m) => m.month === i + 1);
                  const rA = mA?.revenue || 0;
                  const rB = mB?.revenue || 0;
                  const diff = rA - rB;
                  const diffPct = rB > 0 ? ((diff / rB) * 100).toFixed(1) : null;

                  return (
                    <tr
                      key={mon}
                      className="border-b border-white/[0.06] hover:bg-white/[0.04] transition-colors"
                    >
                      <td className="px-5 py-3 font-medium text-white/90">{mon}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gold">
                        {rA > 0 ? `$${rA.toFixed(0)}` : <span className="text-white/25">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right text-white/85">
                        {rB > 0 ? `$${rB.toFixed(0)}` : <span className="text-white/25">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {rA > 0 || rB > 0 ? (
                          <span className={`text-xs font-semibold ${diff >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {diff >= 0 ? "+" : ""}${diff.toFixed(0)}
                            {diffPct && ` (${diff >= 0 ? "+" : ""}${diffPct}%)`}
                          </span>
                        ) : (
                          <span className="text-white/25">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-white/85">{mA?.orders || <span className="text-white/25">0</span>}</td>
                      <td className="px-4 py-3 text-right text-white/85">{mB?.orders || <span className="text-white/25">0</span>}</td>
                    </tr>
                  );
                })}
                {/* Totals Row */}
                <tr className="bg-white/[0.06] border-t-2 border-gold/50 font-bold">
                  <td className="px-5 py-3 text-white">Total</td>
                  <td className="px-4 py-3 text-right text-gold">${dataA.total.toFixed(0)}</td>
                  <td className="px-4 py-3 text-right text-white/90">${dataB.total.toFixed(0)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-bold ${dataA.total >= dataB.total ? "text-emerald-400" : "text-red-400"}`}>
                      {dataA.total >= dataB.total ? "+" : ""}${(dataA.total - dataB.total).toFixed(0)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-white/90">{dataA.orders}</td>
                  <td className="px-4 py-3 text-right text-white/90">{dataB.orders}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
// NEW FEATURE END (v7)
