"use client";
// NEW FEATURE START (v3 — Admin Dashboard)
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LogOut, Package, Clock, CheckCircle, Truck, Upload,
  Download, FileText, ChevronDown, ChevronUp, Edit3, X, RefreshCw,
  BarChart2, MessageCircle,
  TrendingUp,
  // NEW FEATURE START (v7)
  Users,
  // NEW FEATURE END (v7)
} from "lucide-react";
import type { Order, OrderFile } from "@prisma/client";
// NEW FEATURE START (v4 — Analytics + Messages tabs)
import dynamic from "next/dynamic";
const AnalyticsDashboard = dynamic(() => import("@/components/AnalyticsDashboard"), { ssr: false });
const MessageThread      = dynamic(() => import("@/components/MessageThread"),      { ssr: false });
// NEW FEATURE END (v4)
// NEW FEATURE START (v5 — Business Analytics tab)
const BusinessAnalytics = dynamic(() => import("@/components/BusinessAnalytics"), { ssr: false });
// NEW FEATURE END (v5)
// NEW FEATURE START (v6 — Invoices + Subscriptions tabs)
const InvoiceManager      = dynamic(() => import("@/components/InvoiceManager"),      { ssr: false });
const SubscriptionManager = dynamic(() => import("@/components/SubscriptionManager"), { ssr: false });
// NEW FEATURE END (v6)
// NEW FEATURE START (v7 — Customer Management + Year Comparison)
const CustomerManager      = dynamic(() => import("@/components/CustomerManager"),      { ssr: false });
const YearComparisonReport = dynamic(() => import("@/components/YearComparisonReport"), { ssr: false });
// NEW FEATURE END (v7)

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  pending:     { label: "Pending",     color: "bg-amber-500/15 text-amber-200 border border-amber-500/30", icon: Clock },
  in_progress: { label: "In Progress", color: "bg-sky-500/15 text-sky-200 border border-sky-500/30",     icon: RefreshCw },
  completed:   { label: "Completed",   color: "bg-violet-500/15 text-violet-200 border border-violet-500/30", icon: CheckCircle },
  delivered:   { label: "Delivered",   color: "bg-emerald-500/15 text-emerald-200 border border-emerald-500/30",   icon: Truck },
};

function formatBytes(b: number) {
  if (b < 1024)           return `${b} B`;
  if (b < 1024 * 1024)    return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

function OrderRow({
  order,
  onRefresh,
  openMessagesOrderId,
  setOpenMessagesOrderId,
}: {
  order: Order & { files: OrderFile[]; deliverables: OrderFile[] };
  onRefresh: () => void;
  openMessagesOrderId: string | null;
  setOpenMessagesOrderId: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  const [expanded,  setExpanded]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notes,  setNotes]  = useState(order.adminNotes || "");
  const [status, setStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);

  const cfg = STATUS_CONFIG[status];

  const handleStatusSave = async () => {
    setSaving(true);
    await fetch(`/api/orders/${order.id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNotes: notes }),
    });
    setSaving(false);
    onRefresh();
  };

  const handleDeliverableUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    const fd = new FormData();
    Array.from(e.target.files).forEach((f) => fd.append("files", f));
    await fetch(`/api/orders/${order.id}/upload`, { method: "POST", body: fd });
    setUploading(false);
    onRefresh();
  };

  return (
    <div className="bg-white/[0.04] rounded-2xl border border-white/10 overflow-hidden">
      {/* Summary Row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-6 py-5 flex items-center gap-4 hover:bg-white/[0.06] transition-colors"
      >
        <Package size={18} className="text-gold flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate">{order.bookTitle}</p>
          <p className="text-white/50 text-sm">
            {order.authorName} · {order.plan} · ${order.amount}
          </p>
          <p className="text-white/40 text-xs mt-0.5">
            {new Date(order.createdAt).toLocaleDateString("en-GB", {
              day: "2-digit", month: "short", year: "numeric",
            })}
            &nbsp;·&nbsp; {order.files.length} client file{order.files.length !== 1 ? "s" : ""}
            &nbsp;·&nbsp; {order.deliverables.length} deliverable{order.deliverables.length !== 1 ? "s" : ""}
          </p>
        </div>
        <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${cfg.color}`}>
          <cfg.icon size={12} /> {cfg.label}
        </span>
        {expanded
          ? <ChevronUp size={16} className="text-white/40 flex-shrink-0" />
          : <ChevronDown size={16} className="text-white/40 flex-shrink-0" />
        }
      </button>

      {/* Expanded Detail */}
      {expanded && (
        <div className="px-6 pb-6 border-t border-white/10 pt-5 space-y-5">
          {/* Client Info */}
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              ["Email",       order.email],
              ["Genre",       order.genre || "—"],
              ["Plan",        order.plan],
              ["Amount Paid", `$${order.amount}`],
            ].map(([l, v]) => (
              <div key={l} className="bg-void rounded-xl border border-white/10 px-4 py-3">
                <p className="text-xs text-white/45 uppercase tracking-wide mb-0.5">{l}</p>
                <p className="text-sm font-medium text-white/90">{v}</p>
              </div>
            ))}
            {order.synopsis && (
              <div className="sm:col-span-2 bg-void rounded-xl border border-white/10 px-4 py-3">
                <p className="text-xs text-white/45 uppercase tracking-wide mb-0.5">Synopsis</p>
                <p className="text-sm text-white/80">{order.synopsis}</p>
              </div>
            )}
            {order.instructions && (
              <div className="sm:col-span-2 bg-void rounded-xl border border-white/10 px-4 py-3">
                <p className="text-xs text-white/45 uppercase tracking-wide mb-0.5">Instructions</p>
                <p className="text-sm text-white/80">{order.instructions}</p>
              </div>
            )}
          </div>

          {/* Client Files */}
          <div>
            <p className="text-xs font-semibold text-white/45 uppercase tracking-wide mb-2">
              Client Uploads ({order.files.length})
            </p>
            {order.files.length === 0 ? (
              <p className="text-white/45 text-sm">No files uploaded yet.</p>
            ) : (
              <div className="space-y-2">
                {order.files.map((f: OrderFile) => (
                  <a
                    key={f.id}
                    href={`/api/orders/${order.id}/download/${encodeURIComponent(f.storedAs)}?by=client`}
                    className="flex items-center justify-between bg-void rounded-xl px-4 py-2.5 border border-white/10 hover:border-gold/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={14} className="text-gold flex-shrink-0" />
                      <span className="text-sm text-white/90 truncate">{f.filename}</span>
                    </div>
                    <span className="text-xs text-white/45 ml-3 flex-shrink-0">({formatBytes(f.size)})</span>
                    <Download size={14} className="text-white/40 ml-2 flex-shrink-0" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Deliverables */}
          <div>
            <p className="text-xs font-semibold text-white/45 uppercase tracking-wide mb-2">
              Deliverables ({order.deliverables.length})
            </p>
            {order.deliverables.length > 0 && (
              <div className="space-y-2 mb-3">
                {order.deliverables.map((f: OrderFile) => (
                  <a
                    key={f.id}
                    href={`/api/orders/${order.id}/download/${encodeURIComponent(f.storedAs)}?by=admin`}
                    className="flex items-center justify-between bg-void rounded-xl px-4 py-2.5 border border-white/10 hover:border-gold/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={14} className="text-gold flex-shrink-0" />
                      <span className="text-sm text-white/90 truncate">{f.filename}</span>
                    </div>
                    <span className="text-xs text-white/45 ml-3 flex-shrink-0">({formatBytes(f.size)})</span>
                    <Download size={14} className="text-white/40 ml-2 flex-shrink-0" />
                  </a>
                ))}
              </div>
            )}
            <label className="flex items-center gap-2 cursor-pointer bg-gold/10 border-2 border-dashed border-gold/35 rounded-xl px-4 py-3 hover:bg-gold/15 transition-colors w-fit">
              <Upload size={16} className="text-gold" />
              <span className="text-sm font-medium text-gold">
                {uploading ? "Uploading..." : "Upload Deliverable File"}
              </span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleDeliverableUpload}
                disabled={uploading}
              />
            </label>
          </div>

          {/* Status + Notes */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/45 uppercase tracking-wide mb-1.5">
                Order Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Order["status"])}
                className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-void text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold/40"
              >
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/45 uppercase tracking-wide mb-1.5">
                Admin Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Internal notes..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-void text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-gold/40 resize-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleStatusSave}
              disabled={saving}
              className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full bg-gold text-void hover:bg-gold-light transition-all disabled:opacity-60"
            >
              <Edit3 size={14} />
              {saving ? <>Saving...</> : <>Save Changes</>}
            </button>
            {/* NEW FEATURE START (v4 — messages button in OrderRow) */}
            <button
              onClick={() =>
                setOpenMessagesOrderId(
                  openMessagesOrderId === order.id ? null : order.id
                )
              }
              className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full border border-gold/40 text-gold hover:bg-gold/10 transition-all"
            >
              <MessageCircle size={14} />
              {openMessagesOrderId === order.id ? "Hide Chat" : "Open Chat"}
            </button>
            {/* NEW FEATURE END (v4) */}
          </div>

          {/* NEW FEATURE START (v4 — embedded chat) */}
          {openMessagesOrderId === order.id && (
            <div className="mt-2">
              <MessageThread orderId={order.id} viewerRole="admin" />
            </div>
          )}
          {/* NEW FEATURE END (v4) */}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [orders,  setOrders]  = useState<(Order & { files: OrderFile[]; deliverables: OrderFile[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<string>("all");

  // NEW FEATURE START (v4)
  const [openMessagesOrderId, setOpenMessagesOrderId] = useState<string | null>(null);
  // NEW FEATURE END (v4)

  // NEW FEATURE START (v7 — extended tab type)
  const [activeTab, setActiveTab] = useState<
    "orders" | "analytics" | "business" | "invoices" | "subscriptions" | "customers" | "reports"
  >("orders");
  // NEW FEATURE END (v7)

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      if (res.status === 401) { router.push("/admin"); return; }
      const data = await res.json();
      setOrders(data.orders || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin");
  };

  const filtered = filter === "all"
    ? orders
    : orders.filter((o) => o.status === filter);

  const counts = {
    all:         orders.length,
    pending:     orders.filter((o) => o.status === "pending").length,
    in_progress: orders.filter((o) => o.status === "in_progress").length,
    completed:   orders.filter((o) => o.status === "completed").length,
    delivered:   orders.filter((o) => o.status === "delivered").length,
  };

  return (
    <div className="min-h-screen bg-void text-ivory">
      {/* ── Top Bar ── */}
      <div className="glass-nav border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-40 gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-serif text-xl font-semibold text-white">
            Abbassa<span className="text-gold">.</span>
          </span>
          <span className="text-[10px] font-semibold tracking-widest text-gold border border-gold/35 px-2 py-0.5 rounded-full uppercase">
            Admin
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-white/[0.05] rounded-full px-1.5 py-1.5 flex-wrap border border-white/10">
          {/* NEW FEATURE START (v4) */}
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${activeTab === "orders" ? "bg-gold text-void shadow-md" : "text-white/55 hover:text-white"}`}
          >
            <Package size={12} /> Orders
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${activeTab === "analytics" ? "bg-gold text-void shadow-md" : "text-white/55 hover:text-white"}`}
          >
            <BarChart2 size={12} /> Analytics
          </button>
          {/* NEW FEATURE END (v4) */}

          {/* NEW FEATURE START (v5) */}
          <button
            onClick={() => setActiveTab("business")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${activeTab === "business" ? "bg-gold text-void shadow-md" : "text-white/55 hover:text-white"}`}
          >
            <TrendingUp size={12} /> Business
          </button>
          {/* NEW FEATURE END (v5) */}

          {/* NEW FEATURE START (v6) */}
          <button
            onClick={() => setActiveTab("invoices")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${activeTab === "invoices" ? "bg-gold text-void shadow-md" : "text-white/55 hover:text-white"}`}
          >
            <FileText size={12} /> Invoices
          </button>
          <button
            onClick={() => setActiveTab("subscriptions")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${activeTab === "subscriptions" ? "bg-gold text-void shadow-md" : "text-white/55 hover:text-white"}`}
          >
            <RefreshCw size={12} /> Subscriptions
          </button>
          {/* NEW FEATURE END (v6) */}

          {/* NEW FEATURE START (v7) */}
          <button
            onClick={() => setActiveTab("customers")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${activeTab === "customers" ? "bg-gold text-void shadow-md" : "text-white/55 hover:text-white"}`}
          >
            <Users size={12} /> Customers
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
              ${activeTab === "reports" ? "bg-gold text-void shadow-md" : "text-white/55 hover:text-white"}`}
          >
            <BarChart2 size={12} /> Reports
          </button>
          {/* NEW FEATURE END (v7) */}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm font-medium text-white/50 hover:text-red-400 transition-colors flex-shrink-0"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* NEW FEATURE START (v4) */}
        {activeTab === "analytics" && <AnalyticsDashboard />}
        {/* NEW FEATURE END (v4) */}

        {/* NEW FEATURE START (v5) */}
        {activeTab === "business" && <BusinessAnalytics />}
        {/* NEW FEATURE END (v5) */}

        {/* NEW FEATURE START (v6) */}
        {activeTab === "invoices"      && <InvoiceManager />}
        {activeTab === "subscriptions" && <SubscriptionManager />}
        {/* NEW FEATURE END (v6) */}

        {/* NEW FEATURE START (v7) */}
        {activeTab === "customers" && <CustomerManager />}
        {activeTab === "reports"   && <YearComparisonReport />}
        {/* NEW FEATURE END (v7) */}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { key: "all",         label: "Total Orders", color: "text-gold" },
                { key: "pending",     label: "Pending",      color: "text-amber-300" },
                { key: "in_progress", label: "In Progress",  color: "text-sky-300" },
                { key: "delivered",   label: "Delivered",    color: "text-emerald-300" },
              ].map((s) => (
                <motion.div
                  key={s.key}
                  onClick={() => setFilter(s.key as typeof filter)}
                  whileHover={{ y: -2 }}
                  className={`bg-white/[0.04] rounded-2xl p-5 text-center border transition-all cursor-pointer
                    ${filter === s.key ? "border-gold/60 ring-1 ring-gold/25 shadow-lg shadow-black/40" : "border-white/10 hover:border-white/20"}`}
                >
                  <p className={`font-serif text-3xl font-bold ${s.color}`}>
                    {counts[s.key as keyof typeof counts]}
                  </p>
                  <p className="text-white/45 text-xs mt-1 font-medium">{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {(["all", "pending", "in_progress", "completed", "delivered"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    filter === s
                      ? "bg-gold text-void"
                      : "bg-white/[0.05] border border-white/15 text-white/60 hover:border-gold/40 hover:text-white"
                  }`}
                >
                  {s === "all" ? "All" : STATUS_CONFIG[s].label}
                  {s !== "all" && counts[s] > 0 && (
                    <span className="ml-1.5 text-xs opacity-70">({counts[s]})</span>
                  )}
                </button>
              ))}
            </div>

            {/* Orders List */}
            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-white/[0.05] rounded-2xl border border-white/10 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 bg-white/[0.04] rounded-2xl border border-white/10">
                <Package size={40} className="text-gold/40 mx-auto mb-3" />
                <p className="text-white/50 font-medium">No orders found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onRefresh={fetchOrders}
                    openMessagesOrderId={openMessagesOrderId}
                    setOpenMessagesOrderId={setOpenMessagesOrderId}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
// NEW FEATURE END (v3)
