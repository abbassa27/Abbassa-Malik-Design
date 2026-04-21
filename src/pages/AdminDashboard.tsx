// # NEW FEATURE START - Admin Dashboard
import { useState, useRef, useEffect, useCallback } from "react";
import {
  BookOpen,
  Upload,
  FileText,
  Download,
  CheckCircle,
  Clock,
  RefreshCw,
  AlertCircle,
  LogOut,
  Package,
  Users,
  BarChart2,
  ChevronDown,
  X,
  Eye,
  ArrowLeft,
  Lock,
  Loader2,
  Send,
  Inbox,
  Image,
  Trash2,
  Shield,
  MessageCircle,
  TrendingUp,
  DollarSign,
  Activity,
} from "lucide-react";
// # NEW FEATURE START - DB + messaging imports
import { adminApi, type Stats, type LogEntry, type Message as ApiMessage } from "../lib/api";
// # NEW FEATURE END

// ─── Types (shared with ClientDashboard) ─────────────────────────────────────
interface UploadedFile {
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

interface Deliverable {
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
}

interface Order {
  id: string;
  plan: string;
  bookTitle: string;
  status: "pending" | "in_progress" | "completed" | "revision";
  createdAt: string;
  files: UploadedFile[];
  deliverables: Deliverable[];
  instructions: string;
}

interface AdminOrder extends Order {
  client: { id: string; email: string; name: string };
}

interface ClientRecord {
  email: string;
  name: string;
  orders: Order[];
}

// ─── Storage Helpers ──────────────────────────────────────────────────────────
const CLIENT_KEY = "abbassa_client_orders";
const ADMIN_SESSION_KEY = "abbassa_admin_session";

// Collect all client orders from localStorage
function loadAllClients(): ClientRecord[] {
  const clients: ClientRecord[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CLIENT_KEY + "_")) {
      const email = key.replace(CLIENT_KEY + "_", "");
      try {
        const orders: Order[] = JSON.parse(localStorage.getItem(key) || "[]");
        if (orders.length > 0) {
          const name = orders[0]?.bookTitle ? email.split("@")[0] : email.split("@")[0];
          clients.push({ email, name, orders });
        }
      } catch {
        // skip corrupt entries
      }
    }
  }
  return clients;
}

function saveClientOrders(email: string, orders: Order[]) {
  localStorage.setItem(`${CLIENT_KEY}_${email}`, JSON.stringify(orders));
}

// ─── Admin password (in production: use server-side auth) ─────────────────────
const ADMIN_PASSWORD = "abbassa2024admin"; // Change this!

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Order["status"] }) {
  const map = {
    pending: { label: "Pending", color: "text-amber-400 bg-amber-400/10 border-amber-400/20", icon: Clock },
    in_progress: { label: "In Progress", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: RefreshCw },
    completed: { label: "Completed", color: "text-green-400 bg-green-400/10 border-green-400/20", icon: CheckCircle },
    revision: { label: "Revision", color: "text-orange-400 bg-orange-400/10 border-orange-400/20", icon: AlertCircle },
  };
  const { label, color, icon: Icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}


// # NEW FEATURE START - Analytics Dashboard (Business Intelligence)
// ─── Mock data generator (used when DB unavailable) ──────────────────────────
function generateMockStats(): Stats {
  const months = ["2024-10","2024-11","2024-12","2025-01","2025-02","2025-03","2025-04","2025-05","2025-06","2025-07","2025-08","2025-09"];
  const revenues = [145,210,290,180,320,395,430,370,510,480,560,620];
  const orders =   [5,  7,  10,  6,  11, 14, 15, 13, 18, 16, 19, 21];
  return {
    totalClients: 47,
    totalOrders: 135,
    totalRevenue: revenues.reduce((a,b)=>a+b,0),
    messagesUnread: 3,
    ordersByStatus: [
      {status:"PENDING",count:8},{status:"IN_PROGRESS",count:12},
      {status:"REVISION",count:5},{status:"COMPLETED",count:110},
    ],
    ordersByPlan: [
      {plan:"Starter — $29",count:48},
      {plan:"Professional — $79",count:62},
      {plan:"Publisher — $149",count:25},
    ],
    monthlyData: months.map((m,i)=>({month:m,orders:orders[i],revenue:revenues[i]})),
    recentLogs: [],
  };
}

// ─── Analytics Dashboard ──────────────────────────────────────────────────────
function AnalyticsDashboard({ secret }: { secret: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"monthly" | "quarterly" | "yearly">("monthly");
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, l] = await Promise.all([
          adminApi.getStats(secret),
          adminApi.getLogs(secret, 30),
        ]);
        setStats(s);
        setLogs(l);
      } catch {
        setStats(generateMockStats());
        setUsingMock(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [secret]);

  // Re-render charts when stats or view changes
  useEffect(() => {
    if (!stats) return;
    const timer = setTimeout(() => renderCharts(stats, view), 100);
    return () => clearTimeout(timer);
  }, [stats, view]);

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
      <span className="text-slate-400 text-sm ml-3">Loading analytics…</span>
    </div>
  );

  if (!stats) return null;

  // ── Derived metrics ────────────────────────────────────────────────────────
  const avgOrderValue = stats.totalOrders > 0
    ? Math.round(stats.totalRevenue / stats.totalOrders)
    : 0;

  const completedOrders = stats.ordersByStatus.find(s => s.status === "COMPLETED")?.count ?? 0;
  const completionRate = stats.totalOrders > 0
    ? Math.round((completedOrders / stats.totalOrders) * 100)
    : 0;

  // Net profit estimate (assume 85% margin for digital services)
  const netProfit = Math.round(stats.totalRevenue * 0.85);

  // Current month revenue
  const currentMonthData = stats.monthlyData[stats.monthlyData.length - 1];
  const prevMonthData = stats.monthlyData[stats.monthlyData.length - 2];
  const momGrowth = prevMonthData && prevMonthData.revenue > 0
    ? Math.round(((currentMonthData?.revenue ?? 0) - prevMonthData.revenue) / prevMonthData.revenue * 100)
    : 0;

  // Top service
  const topService = [...stats.ordersByPlan].sort((a,b) => b.count - a.count)[0];

  // ── Services table data ────────────────────────────────────────────────────
  const servicePrices: Record<string, number> = {
    "Starter": 29, "Professional": 79, "Publisher": 149
  };

  const serviceRows = stats.ordersByPlan.map(p => {
    const name = p.plan.split("—")[0].trim();
    const price = servicePrices[name] ?? 0;
    const revenue = price * p.count;
    const pct = stats.totalOrders > 0 ? Math.round((p.count / stats.totalOrders) * 100) : 0;
    return { name, price, count: p.count, revenue, pct };
  }).sort((a,b) => b.count - a.count);

  const eventColors: Record<string, string> = {
    ORDER_CREATED: "text-amber-400",
    CLIENT_UPLOADED: "text-blue-400",
    ADMIN_UPLOADED: "text-violet-400",
    STATUS_CHANGED: "text-orange-400",
    MESSAGE_SENT: "text-green-400",
    CLIENT_REGISTERED: "text-cyan-400",
    CLIENT_DOWNLOADED: "text-emerald-400",
  };

  return (
    <div className="space-y-6">
      {usingMock && (
        <div className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl px-5 py-3">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-amber-300 text-sm">Showing demo data — connect Neon PostgreSQL to see live analytics</p>
        </div>
      )}

      {/* ── Section 1: KPI Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Revenue",
            value: `$${stats.totalRevenue.toLocaleString()}`,
            sub: momGrowth >= 0 ? `+${momGrowth}% vs last month` : `${momGrowth}% vs last month`,
            subColor: momGrowth >= 0 ? "text-green-400" : "text-red-400",
            color: "text-green-400", bg: "bg-green-500/5", border: "border-green-500/20", icon: DollarSign,
          },
          {
            label: "Net Profit (est.)",
            value: `$${netProfit.toLocaleString()}`,
            sub: "~85% margin",
            subColor: "text-slate-500",
            color: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/20", icon: TrendingUp,
          },
          {
            label: "Avg. Order Value",
            value: `$${avgOrderValue}`,
            sub: `${stats.totalOrders} total orders`,
            subColor: "text-slate-500",
            color: "text-violet-400", bg: "bg-violet-500/5", border: "border-violet-500/20", icon: BarChart2,
          },
          {
            label: "Completion Rate",
            value: `${completionRate}%`,
            sub: `${completedOrders} completed`,
            subColor: "text-slate-500",
            color: "text-cyan-400", bg: "bg-cyan-500/5", border: "border-cyan-500/20", icon: CheckCircle,
          },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl px-5 py-4 flex items-start justify-between`}>
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className={`text-xs mt-1 ${s.subColor}`}>{s.sub}</p>
            </div>
            <s.icon className={`w-5 h-5 ${s.color} opacity-40 mt-1 shrink-0`} />
          </div>
        ))}
      </div>

      {/* ── Section 2: Revenue Chart with time toggle ──────────────────────── */}
      <div className="bg-white/[0.02] border border-white/[0.07] rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <h3 className="text-white font-bold text-sm">Revenue & Orders Growth</h3>
          </div>
          <div className="flex gap-2">
            {(["monthly","quarterly","yearly"] as const).map(v => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === v ? "bg-amber-500/20 border border-amber-500/40 text-amber-300" : "bg-white/5 border border-white/10 text-slate-400 hover:text-white"}`}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Revenue bar chart */}
        <div className="mb-4">
          <div className="flex gap-4 text-xs text-slate-400 mb-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block"></span>Revenue ($)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-violet-500 inline-block"></span>Orders
            </span>
          </div>
          <div id="revenue-chart-wrapper" style={{position:"relative",width:"100%",height:"220px"}}>
            <canvas id="revenueChart" role="img" aria-label="Revenue and orders over time"></canvas>
          </div>
        </div>
      </div>

      {/* ── Section 3: Services Table ──────────────────────────────────────── */}
      <div className="bg-white/[0.02] border border-white/[0.07] rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.07] flex items-center gap-2">
          <Package className="w-4 h-4 text-violet-400" />
          <h3 className="text-white font-bold text-sm">Top Services — Performance Table</h3>
          {topService && (
            <span className="ml-auto text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2.5 py-1 rounded-full font-bold">
              🏆 {topService.plan.split("—")[0].trim()} leads
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {["Service","Price","Orders","Revenue","Share","Demand"].map(h => (
                  <th key={h} className="text-left text-xs text-slate-500 font-semibold uppercase tracking-widest px-5 py-3 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {serviceRows.map((row, i) => (
                <tr key={row.name} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${i===0?"bg-amber-500/20 text-amber-300":i===1?"bg-violet-500/20 text-violet-300":"bg-white/5 text-slate-400"}`}>{i+1}</span>
                      <span className="text-white font-semibold">{row.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-300">${row.price}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-white font-bold">{row.count}</span>
                    <span className="text-slate-600 text-xs ml-1">orders</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-green-400 font-bold">${row.revenue.toLocaleString()}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden w-16">
                        <div className={`h-full rounded-full ${i===0?"bg-amber-500":i===1?"bg-violet-500":"bg-slate-500"}`} style={{width:`${row.pct}%`}} />
                      </div>
                      <span className="text-slate-400 text-xs w-8">{row.pct}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div id={`sparkline-${i}`} style={{width:"80px",height:"28px",position:"relative"}}>
                      <canvas id={`spark-${i}`} role="img" aria-label={`${row.name} trend`}></canvas>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-white/[0.08]">
              <tr>
                <td className="px-5 py-3 text-slate-400 text-xs font-bold uppercase tracking-widest" colSpan={2}>Totals</td>
                <td className="px-5 py-3 text-white font-extrabold">{stats.totalOrders}</td>
                <td className="px-5 py-3 text-green-400 font-extrabold">${stats.totalRevenue.toLocaleString()}</td>
                <td className="px-5 py-3 text-slate-400 text-xs">100%</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Section 4: Status + Plan Donut side-by-side ──────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5">
          <p className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" /> Orders by Status
          </p>
          <div style={{position:"relative",width:"100%",height:"180px"}}>
            <canvas id="statusChart" role="img" aria-label="Orders by status donut chart"></canvas>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
            {stats.ordersByStatus.map((s,i) => {
              const statusColors = ["#F59E0B","#3B82F6","#F97316","#10B981"];
              return (
                <span key={s.status} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-sm inline-block" style={{background:statusColors[i%4]}}></span>
                  {s.status.replace("_"," ")} ({s.count})
                </span>
              );
            })}
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5">
          <p className="text-white font-bold text-sm mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-400" /> Revenue Share by Plan
          </p>
          <div style={{position:"relative",width:"100%",height:"180px"}}>
            <canvas id="revenueShareChart" role="img" aria-label="Revenue share by plan donut chart"></canvas>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
            {serviceRows.map((s,i) => {
              const planColors = ["#F59E0B","#8B5CF6","#64748B"];
              return (
                <span key={s.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span className="w-2 h-2 rounded-sm inline-block" style={{background:planColors[i%3]}}></span>
                  {s.name} (${s.revenue.toLocaleString()})
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Section 5: Event Log ──────────────────────────────────────────── */}
      <div className="bg-white/[0.02] border border-white/[0.07] rounded-3xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.07] flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <p className="text-white font-bold text-sm">Activity Log</p>
          <span className="ml-auto text-xs text-slate-600">Last 30 events</span>
        </div>
        {logs.length === 0 ? (
          <div className="py-10 text-center">
            <Inbox className="w-8 h-8 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No events logged yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04] max-h-72 overflow-y-auto">
            {logs.map(l => (
              <div key={l.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                <span className={`text-xs font-bold shrink-0 ${eventColors[l.event] || "text-slate-400"}`}>
                  {l.event.replace(/_/g," ")}
                </span>
                <div className="flex-1 min-w-0">
                  {l.clientEmail && <span className="text-slate-400 text-xs">{l.clientEmail}</span>}
                  {l.orderTitle && <span className="text-slate-600 text-xs ml-2">· {l.orderTitle}</span>}
                </div>
                <span className="text-slate-700 text-xs shrink-0">
                  {new Date(l.createdAt).toLocaleDateString("en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Chart rendering (runs after component mounts) ────────────────────────────
function renderCharts(stats: Stats, view: "monthly" | "quarterly" | "yearly") {
  if (typeof window === "undefined") return;

  // Destroy existing Chart instances
  ["revenueChart","statusChart","revenueShareChart","spark-0","spark-1","spark-2"].forEach(id => {
    const el = document.getElementById(id) as HTMLCanvasElement | null;
    if (el) {
      const existing = (window as unknown as Record<string, { destroy?: () => void }>)[`_chart_${id}`];
      if (existing?.destroy) existing.destroy();
    }
  });

  // Aggregate data based on view
  let labels: string[] = [];
  let revenueData: number[] = [];
  let ordersData: number[] = [];

  if (view === "monthly") {
    const last12 = stats.monthlyData.slice(-12);
    labels = last12.map(m => m.month.slice(5));
    revenueData = last12.map(m => m.revenue);
    ordersData = last12.map(m => m.orders);
  } else if (view === "quarterly") {
    const quarters: Record<string, {revenue:number,orders:number}> = {};
    stats.monthlyData.forEach(m => {
      const [y, mo] = m.month.split("-").map(Number);
      const q = `Q${Math.ceil(mo/3)} ${y}`;
      if (!quarters[q]) quarters[q] = {revenue:0,orders:0};
      quarters[q].revenue += m.revenue;
      quarters[q].orders += m.orders;
    });
    Object.entries(quarters).slice(-8).forEach(([k,v]) => {
      labels.push(k); revenueData.push(v.revenue); ordersData.push(v.orders);
    });
  } else {
    const years: Record<string, {revenue:number,orders:number}> = {};
    stats.monthlyData.forEach(m => {
      const y = m.month.slice(0,4);
      if (!years[y]) years[y] = {revenue:0,orders:0};
      years[y].revenue += m.revenue;
      years[y].orders += m.orders;
    });
    Object.entries(years).forEach(([k,v]) => {
      labels.push(k); revenueData.push(v.revenue); ordersData.push(v.orders);
    });
  }

  const ChartLib = (window as unknown as {Chart?: new (el: HTMLCanvasElement, cfg: unknown) => {destroy:()=>void}}).Chart;
  if (!ChartLib) {
    // Load Chart.js dynamically
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    s.onload = () => renderCharts(stats, view);
    document.head.appendChild(s);
    return;
  }

  const isDark = true; // always dark theme
  const gridColor = "rgba(255,255,255,0.05)";
  const tickColor = "rgba(255,255,255,0.35)";

  // ── Revenue + Orders combo chart ──────────────────────────────────────────
  const revEl = document.getElementById("revenueChart") as HTMLCanvasElement | null;
  if (revEl) {
    const c = new ChartLib(revEl, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Revenue ($)",
            data: revenueData,
            backgroundColor: "rgba(245,158,11,0.7)",
            borderColor: "#F59E0B",
            borderWidth: 1,
            borderRadius: 4,
            yAxisID: "yRev",
          },
          {
            label: "Orders",
            data: ordersData,
            type: "line" as const,
            borderColor: "#8B5CF6",
            backgroundColor: "rgba(139,92,246,0.15)",
            borderWidth: 2,
            pointBackgroundColor: "#8B5CF6",
            pointRadius: 3,
            tension: 0.4,
            fill: true,
            yAxisID: "yOrd",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: tickColor, maxRotation: 45, autoSkip: false } },
          yRev: {
            position: "left" as const,
            grid: { color: gridColor },
            ticks: { color: "#F59E0B", callback: (v: unknown) => `$${Number(v).toLocaleString()}` },
          },
          yOrd: {
            position: "right" as const,
            grid: { display: false },
            ticks: { color: "#8B5CF6" },
          },
        },
      },
    });
    (window as unknown as Record<string, unknown>)["_chart_revenueChart"] = c;
  }

  // ── Status donut ──────────────────────────────────────────────────────────
  const statusEl = document.getElementById("statusChart") as HTMLCanvasElement | null;
  if (statusEl && stats.ordersByStatus.length > 0) {
    const c = new ChartLib(statusEl, {
      type: "doughnut",
      data: {
        labels: stats.ordersByStatus.map(s => s.status.replace("_"," ")),
        datasets: [{
          data: stats.ordersByStatus.map(s => s.count),
          backgroundColor: ["#F59E0B","#3B82F6","#F97316","#10B981"],
          borderColor: "#0a0f1e",
          borderWidth: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: { legend: { display: false } },
      },
    });
    (window as unknown as Record<string, unknown>)["_chart_statusChart"] = c;
  }

  // ── Revenue share donut ───────────────────────────────────────────────────
  const revShareEl = document.getElementById("revenueShareChart") as HTMLCanvasElement | null;
  const servicePricesLocal: Record<string, number> = { "Starter": 29, "Professional": 79, "Publisher": 149 };
  const planRevenues = stats.ordersByPlan.map(p => {
    const name = p.plan.split("—")[0].trim();
    return { name, revenue: (servicePricesLocal[name] ?? 0) * p.count };
  });
  if (revShareEl && planRevenues.length > 0) {
    const c = new ChartLib(revShareEl, {
      type: "doughnut",
      data: {
        labels: planRevenues.map(p => p.name),
        datasets: [{
          data: planRevenues.map(p => p.revenue),
          backgroundColor: ["#F59E0B","#8B5CF6","#64748B"],
          borderColor: "#0a0f1e",
          borderWidth: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: { legend: { display: false } },
      },
    });
    (window as unknown as Record<string, unknown>)["_chart_revenueShareChart"] = c;
  }

  // ── Sparklines for each service ───────────────────────────────────────────
  stats.ordersByPlan.forEach((_p, i) => {
    const el = document.getElementById(`spark-${i}`) as HTMLCanvasElement | null;
    if (!el) return;
    const sparkData = stats.monthlyData.slice(-6).map(m => m.revenue * (0.2 + i * 0.15 + Math.random() * 0.1));
    const sparkColors = ["#F59E0B","#8B5CF6","#64748B"];
    const c = new ChartLib(el, {
      type: "line",
      data: {
        labels: stats.monthlyData.slice(-6).map(m => m.month.slice(5)),
        datasets: [{
          data: sparkData.map(v => Math.round(v)),
          borderColor: sparkColors[i % 3],
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.4,
          fill: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        scales: { x: { display: false }, y: { display: false } },
        animation: { duration: 300 },
      },
    });
    (window as unknown as Record<string, unknown>)[`_chart_spark-${i}`] = c;
  });
}
// # NEW FEATURE END - Analytics Dashboard (Business Intelligence)


// # NEW FEATURE START - Admin Chat Panel
function AdminChatPanel({ order, secret, onClose }: { order: AdminOrder; secret: string; onClose: () => void }) {
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    try { setMessages(await adminApi.getMessages(secret, order.id)); } catch { setMessages((order.messages ?? []) as unknown as ApiMessage[]); }
  }, [secret, order.id, order.messages]);

  useEffect(() => { loadMessages(); const iv = setInterval(loadMessages, 6000); return () => clearInterval(iv); }, [loadMessages]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    const content = input.trim();
    setInput("");
    try {
      const msg = await adminApi.sendMessage(secret, order.id, order.client.email, content);
      setMessages(prev => [...prev, msg]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now().toString(), orderId: order.id, clientId: "", sender: "ADMIN", content, read: false, createdAt: new Date().toISOString() }]);
    } finally { setSending(false); }
  };

  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative bg-[#0d1225] border border-white/10 rounded-3xl w-full max-w-lg flex flex-col h-[80vh] max-h-[600px] shadow-2xl">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.07] shrink-0">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-violet-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate">{order.bookTitle}</p>
            <p className="text-slate-500 text-xs">{order.client.email}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {messages.length === 0 && <div className="text-center py-8"><MessageCircle className="w-10 h-10 text-slate-700 mx-auto mb-3" /><p className="text-slate-500 text-sm">No messages yet</p></div>}
          {messages.map(msg => (
            <div key={msg.id} className={"flex " + (msg.sender === "ADMIN" ? "justify-end" : "justify-start")}>
              <div className={"max-w-[80%] rounded-2xl px-4 py-2.5 " + (msg.sender === "ADMIN" ? "bg-violet-500/20 border border-violet-500/20" : "bg-white/[0.06] border border-white/10")}>
                <p className={"text-xs font-bold mb-1 " + (msg.sender === "ADMIN" ? "text-violet-400" : "text-amber-400")}>{msg.sender === "ADMIN" ? "You (Admin)" : "Client"}</p>
                <p className="text-white text-sm leading-relaxed">{msg.content}</p>
                <p className="text-slate-600 text-xs mt-1">{fmtTime(msg.createdAt)}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={handleSend} className="px-6 py-4 border-t border-white/[0.07] shrink-0 flex gap-3">
          <input value={input} onChange={e => setInput(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-violet-500/40 transition-colors"
            placeholder="Reply to client…" />
          <button type="submit" disabled={sending || !input.trim()} className="bg-violet-500 hover:bg-violet-400 text-white p-3 rounded-xl transition-all disabled:opacity-50 shrink-0">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
// # NEW FEATURE END - Admin Chat Panel

// ─── Admin Login ──────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 600));
    if (password !== ADMIN_PASSWORD) {
      setLoading(false);
      setError("Incorrect password. Access denied.");
      return;
    }
    sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    sessionStorage.setItem("abbassa_admin_secret", password);
    setLoading(false);
    onLogin();
  };

  return (
    <div className="min-h-screen bg-[#060b18] flex items-center justify-center px-4">
      <div className="fixed top-1/4 -left-32 w-96 h-96 bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 justify-center mb-10">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-xl shadow-violet-500/30">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className="leading-none">
            <p className="font-bold text-white text-lg tracking-tight">Abbassa Malik</p>
            <p className="text-violet-400 text-[10px] font-semibold tracking-widest uppercase">Admin Panel</p>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-violet-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-2">Admin Access</h1>
            <p className="text-slate-400 text-sm">Restricted — authorized personnel only</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-slate-400 text-xs font-semibold block mb-2 uppercase tracking-widest">Admin Password</label>
              <input required type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-violet-500/40 transition-colors"
                placeholder="Enter admin password" />
            </div>
            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/30 disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
              {loading ? "Verifying…" : "Access Admin Panel →"}
            </button>
          </form>
          <p className="text-center text-slate-600 text-xs mt-4">Demo password: <code className="text-violet-400">abbassa2024admin</code></p>
        </div>
        <a href="/" className="flex items-center justify-center gap-2 text-slate-500 hover:text-slate-300 text-sm mt-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to main site
        </a>
      </div>
    </div>
  );
}

// ─── Order Manager Modal ──────────────────────────────────────────────────────
function OrderManager({
  client,
  order,
  onClose,
  onUpdate,
}: {
  client: ClientRecord;
  order: Order;
  onClose: () => void;
  onUpdate: (updated: Order) => void;
}) {
  const [status, setStatus] = useState<Order["status"]>(order.status);
  const [deliverFiles, setDeliverFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fmt = (b: number) => b < 1048576 ? (b / 1024).toFixed(1) + " KB" : (b / 1048576).toFixed(1) + " MB";
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));

    // Convert deliverable files (in production: upload to secure CDN)
    const newDeliverables: Deliverable[] = deliverFiles.map(f => ({
      name: f.name,
      size: f.size,
      url: URL.createObjectURL(f), // In production: secure download URL
      uploadedAt: new Date().toISOString(),
    }));

    const updatedOrder: Order = {
      ...order,
      status: deliverFiles.length > 0 ? "completed" : status,
      deliverables: [...order.deliverables, ...newDeliverables],
    };

    onUpdate(updatedOrder);
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-[#0d1225] border border-white/10 rounded-3xl p-8 w-full max-w-2xl my-4 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">{order.bookTitle}</h2>
            <p className="text-slate-400 text-sm">{client.email} · {order.plan}</p>
          </div>
          <div className="ml-auto"><StatusBadge status={order.status} /></div>
        </div>

        {/* Instructions */}
        {order.instructions && (
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-4 mb-5">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">Client Instructions</p>
            <p className="text-slate-300 text-sm leading-relaxed">{order.instructions}</p>
          </div>
        )}

        {/* Client's uploaded files */}
        {order.files.length > 0 && (
          <div className="mb-5">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">Client Files ({order.files.length})</p>
            <div className="space-y-2">
              {order.files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5">
                  {f.type?.startsWith("image/") ? <Image className="w-4 h-4 text-amber-400 shrink-0" /> : <FileText className="w-4 h-4 text-violet-400 shrink-0" />}
                  <span className="text-white text-sm flex-1 truncate">{f.name}</span>
                  <span className="text-slate-500 text-xs shrink-0">{fmt(f.size)}</span>
                  <a href={f.url} download={f.name} target="_blank" rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white transition-colors shrink-0">
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status update */}
        <div className="mb-5">
          <label className="text-slate-400 text-xs font-semibold block mb-2 uppercase tracking-widest">Update Status</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(["pending", "in_progress", "revision", "completed"] as Order["status"][]).map(s => (
              <button key={s} type="button" onClick={() => setStatus(s)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${status === s ? "bg-amber-500/20 border-amber-500/50 text-amber-300" : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"}`}>
                {s.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Upload deliverables */}
        <div className="mb-6">
          <label className="text-slate-400 text-xs font-semibold block mb-2 uppercase tracking-widest">Upload Completed Files for Client</label>
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); setDeliverFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]); }}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${dragOver ? "border-violet-500/60 bg-violet-500/5" : "border-white/10 hover:border-violet-500/30 hover:bg-white/[0.02]"}`}
          >
            <Send className={`w-7 h-7 mx-auto mb-2 transition-colors ${dragOver ? "text-violet-400" : "text-slate-600"}`} />
            <p className="text-white font-semibold text-sm mb-1">Drop completed eBook files here</p>
            <p className="text-slate-500 text-xs">EPUB, MOBI, PDF, JPG, PNG — client will be able to download</p>
            <input ref={fileRef} type="file" multiple className="hidden"
              onChange={e => e.target.files && setDeliverFiles(prev => [...prev, ...Array.from(e.target.files!)])}
              accept=".pdf,.epub,.mobi,.azw3,.jpg,.jpeg,.png,.zip" />
          </div>
          {deliverFiles.length > 0 && (
            <ul className="mt-3 space-y-2">
              {deliverFiles.map((f, i) => (
                <li key={i} className="flex items-center gap-3 bg-violet-500/5 border border-violet-500/20 rounded-xl px-4 py-2.5">
                  <FileText className="w-4 h-4 text-violet-400 shrink-0" />
                  <span className="text-white text-sm flex-1 truncate">{f.name}</span>
                  <span className="text-slate-500 text-xs shrink-0">{fmt(f.size)}</span>
                  <button onClick={() => setDeliverFiles(prev => prev.filter((_, j) => j !== i))} className="text-slate-600 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Existing deliverables */}
          {order.deliverables.length > 0 && (
            <div className="mt-3">
              <p className="text-slate-500 text-xs mb-2">Already delivered:</p>
              {order.deliverables.map((d, i) => (
                <div key={i} className="flex items-center gap-3 bg-green-500/5 border border-green-500/20 rounded-xl px-4 py-2.5 mb-2">
                  <Download className="w-4 h-4 text-green-400 shrink-0" />
                  <span className="text-white text-sm flex-1 truncate">{d.name}</span>
                  <span className="text-slate-500 text-xs">{fmtDate(d.uploadedAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={handleSave} disabled={saving || saved}
          className={`w-full font-bold py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 flex items-center justify-center gap-2 ${saved ? "bg-green-500/20 border border-green-500/40 text-green-400" : "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white hover:shadow-lg hover:shadow-violet-500/30"} disabled:opacity-60`}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          {saving ? "Saving…" : saved ? "Saved & Delivered!" : "Save Changes & Deliver Files"}
        </button>

        <p className="text-slate-600 text-xs mt-4 text-center">Order {order.id} · Created {fmtDate(order.createdAt)}</p>
      </div>
    </div>
  );
}

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [adminSecret, setAdminSecret] = useState<string>("");
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<{ client: ClientRecord; order: Order } | null>(null);
  const [filterStatus, setFilterStatus] = useState<Order["status"] | "all">("all");
  // # NEW FEATURE START - tabs + chat
  const [activeTab, setActiveTab] = useState<"orders" | "stats">("orders");
  const [chatOrder, setChatOrder] = useState<AdminOrder | null>(null);
  // # NEW FEATURE END

  useEffect(() => {
    if (sessionStorage.getItem(ADMIN_SESSION_KEY) === "true") {
      setAuthenticated(true);
      setAdminSecret(sessionStorage.getItem("abbassa_admin_secret") || "");
      setClients(loadAllClients());
    }
  }, []);

  const handleLogin = () => {
    setAuthenticated(true);
    setAdminSecret(sessionStorage.getItem("abbassa_admin_secret") || "");
    setClients(loadAllClients());
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setAuthenticated(false);
  };

  const handleOrderUpdate = (updatedOrder: Order) => {
    if (!selectedOrder) return;
    const { client } = selectedOrder;

    const updatedOrders = client.orders.map(o => o.id === updatedOrder.id ? updatedOrder : o);
    saveClientOrders(client.email, updatedOrders);

    setClients(prev => prev.map(c => c.email === client.email ? { ...c, orders: updatedOrders } : c));
    if (selectedClient?.email === client.email) {
      setSelectedClient(prev => prev ? { ...prev, orders: updatedOrders } : null);
    }
    setSelectedOrder(null);
  };

  if (!authenticated) return <AdminLogin onLogin={handleLogin} />;

  // Flatten all orders
  const allOrders = clients.flatMap(c => c.orders.map(o => ({ client: c, order: o })));
  const filtered = filterStatus === "all" ? allOrders : allOrders.filter(({ order }) => order.status === filterStatus);

  const stats = {
    clients: clients.length,
    total: allOrders.length,
    pending: allOrders.filter(({ order }) => order.status === "pending").length,
    completed: allOrders.filter(({ order }) => order.status === "completed").length,
  };

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="min-h-screen bg-[#060b18] text-white">
      <div className="fixed top-0 -left-32 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 -right-32 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="border-b border-white/[0.06] bg-[#07091a]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-md shadow-violet-500/30 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="leading-none">
                <p className="font-bold text-white text-sm tracking-tight">Abbassa Malik</p>
                <p className="text-violet-400 text-[10px] font-semibold tracking-widest uppercase">Admin Panel</p>
              </div>
            </a>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setClients(loadAllClients())}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm font-medium">
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm font-medium">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-white mb-1">Orders Overview</h1>
          <p className="text-slate-400 text-sm">Manage client orders, update statuses, and deliver completed files</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Clients", value: stats.clients, color: "text-white", bg: "bg-white/[0.03]", border: "border-white/[0.07]", icon: Users },
            { label: "Total Orders", value: stats.total, color: "text-violet-400", bg: "bg-violet-500/5", border: "border-violet-500/20", icon: Package },
            { label: "Pending", value: stats.pending, color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/20", icon: Clock },
            { label: "Completed", value: stats.completed, color: "text-green-400", bg: "bg-green-500/5", border: "border-green-500/20", icon: CheckCircle },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl px-5 py-4 flex items-start justify-between`}>
              <div>
                <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-slate-500 text-xs mt-1 font-semibold uppercase tracking-widest">{s.label}</p>
              </div>
              <s.icon className={`w-5 h-5 ${s.color} opacity-40`} />
            </div>
          ))}
        </div>

        {/* # NEW FEATURE START - Tab switcher */}
        <div className="flex gap-2 mb-6">
          {(["orders", "stats"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={"px-5 py-2.5 rounded-xl text-sm font-bold transition-all " + (activeTab === tab ? "bg-amber-500/20 border border-amber-500/40 text-amber-300" : "bg-white/5 border border-white/10 text-slate-400 hover:text-white")}>
              {tab === "orders" ? "📦 Orders" : "📈 Analytics"}
            </button>
          ))}
        </div>
        {/* # NEW FEATURE END */}

        {activeTab === "stats" && adminSecret && <AnalyticsDashboard secret={adminSecret} />}
        {activeTab === "orders" && (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Clients sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/[0.02] border border-white/[0.07] rounded-3xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.07] flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <h2 className="text-white font-bold text-sm">Clients ({clients.length})</h2>
              </div>
              {clients.length === 0 ? (
                <div className="py-10 text-center">
                  <Inbox className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No clients yet</p>
                  <p className="text-slate-600 text-xs mt-1">Orders will appear here once clients submit</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.05]">
                  {clients.map(client => (
                    <button key={client.email}
                      onClick={() => setSelectedClient(selectedClient?.email === client.email ? null : client)}
                      className={`w-full flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.03] transition-colors text-left ${selectedClient?.email === client.email ? "bg-white/[0.05]" : ""}`}>
                      <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-xs font-bold text-amber-400">
                        {client.email[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{client.email}</p>
                        <p className="text-slate-500 text-xs">{client.orders.length} order{client.orders.length !== 1 ? "s" : ""}</p>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0 items-end">
                        {client.orders.filter(o => o.status === "pending").length > 0 && (
                          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Orders panel */}
          <div className="lg:col-span-2">
            <div className="bg-white/[0.02] border border-white/[0.07] rounded-3xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.07] flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-violet-400" />
                  <h2 className="text-white font-bold text-sm">
                    {selectedClient ? `${selectedClient.email}'s Orders` : "All Orders"}
                  </h2>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedClient && (
                    <button onClick={() => setSelectedClient(null)} className="text-slate-400 hover:text-white text-xs border border-white/10 rounded-lg px-3 py-1.5 transition-colors">
                      Show All
                    </button>
                  )}
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-violet-500/40 transition-colors appearance-none">
                    <option value="all" className="bg-[#0d1225]">All statuses</option>
                    <option value="pending" className="bg-[#0d1225]">Pending</option>
                    <option value="in_progress" className="bg-[#0d1225]">In Progress</option>
                    <option value="revision" className="bg-[#0d1225]">Revision</option>
                    <option value="completed" className="bg-[#0d1225]">Completed</option>
                  </select>
                </div>
              </div>

              {(() => {
                const displayOrders = selectedClient
                  ? (filterStatus === "all" ? selectedClient.orders : selectedClient.orders.filter(o => o.status === filterStatus))
                    .map(o => ({ client: selectedClient, order: o }))
                  : filtered;

                return displayOrders.length === 0 ? (
                  <div className="py-12 text-center">
                    <Inbox className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">No orders to display</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.05]">
                    {displayOrders.map(({ client, order }) => (
                      <div key={order.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors group">
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                          <BookOpen className="w-5 h-5 text-violet-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{order.bookTitle}</p>
                          <p className="text-slate-500 text-xs truncate">{client.email} · {order.plan} · {fmtDate(order.createdAt)}</p>
                          {order.files.length > 0 && (
                            <p className="text-slate-600 text-xs mt-0.5">{order.files.length} file{order.files.length > 1 ? "s" : ""} uploaded</p>
                          )}
                        </div>
                        <div className="shrink-0 flex items-center gap-3">
                          <StatusBadge status={order.status} />
                          <button onClick={() => setSelectedOrder({ client, order })}
                            className="flex items-center gap-1.5 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/40 text-violet-400 text-xs font-bold px-3 py-2 rounded-lg transition-all">
                           <Eye className="w-3.5 h-3.5" />
                          Manage
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    )}

    <a href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm mt-8 transition-colors w-fit">
      <ArrowLeft className="w-4 h-4" />
      Back to main site
    </a>
  </main>

      {/* # NEW FEATURE START - admin chat */}
      {chatOrder && adminSecret && <AdminChatPanel order={chatOrder} secret={adminSecret} onClose={() => setChatOrder(null)} />}
      {/* # NEW FEATURE END */}
      {selectedOrder && (
        <OrderManager
          client={selectedOrder.client}
          order={selectedOrder.order}
          onClose={() => setSelectedOrder(null)}
          onUpdate={handleOrderUpdate}
        />
      )}
    </div>
  );
}
// # NEW FEATURE END - Admin Dashboard
