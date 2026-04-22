"use client";
// NEW FEATURE START (v7 — Customer Management Component)
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Filter, Mail, Calendar, Package,
  FileText, ChevronDown, ChevronUp, Eye, Plus,
  RefreshCw, Download,
} from "lucide-react";

interface CustomerOrder {
  id:        string;
  plan:      string;
  amount:    string;
  status:    string;
  createdAt: string;
  bookTitle: string;
}

interface CustomerInvoice {
  id:            string;
  invoiceNumber: string;
  total:         number;
  currency:      string;
  status:        string;
  createdAt:     string;
}

interface Customer {
  email:         string;
  name:          string;
  firstSeen:     string;
  lastSeen:      string;
  totalSpent:    number;
  orderCount:    number;
  invoiceCount:  number;
  services:      string[];
  orders:        CustomerOrder[];
  invoices:      CustomerInvoice[];
}

const STATUS_COLOR: Record<string, string> = {
  pending:     "bg-amber-500/15 text-amber-200 border border-amber-500/25",
  in_progress: "bg-sky-500/15   text-sky-200 border border-sky-500/25",
  completed:   "bg-violet-500/15 text-violet-200 border border-violet-500/25",
  delivered:   "bg-emerald-500/15  text-emerald-200 border border-emerald-500/25",
  paid:        "bg-emerald-500/15  text-emerald-200 border border-emerald-500/25",
  sent:        "bg-sky-500/15   text-sky-200 border border-sky-500/25",
  draft:       "bg-white/5      text-white/50 border border-white/10",
  overdue:     "bg-red-500/15    text-red-300 border border-red-500/25",
  cancelled:   "bg-white/5      text-white/50 border border-white/10",
};

function exportCustomersCSV(customers: Customer[]) {
  const headers = [
    "Name", "Email", "First Seen", "Last Seen",
    "Total Spent (USD)", "Orders", "Invoices", "Services",
  ];
  const rows = customers.map((c) => [
    `"${c.name}"`,
    c.email,
    new Date(c.firstSeen).toLocaleDateString("en-GB"),
    new Date(c.lastSeen).toLocaleDateString("en-GB"),
    c.totalSpent.toFixed(2),
    c.orderCount,
    c.invoiceCount,
    `"${c.services.join(", ")}"`,
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `customers-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CustomerManager() {
  const [customers,  setCustomers]  = useState<Customer[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [sortBy,     setSortBy]     = useState<"name" | "spent" | "orders" | "lastSeen">("lastSeen");
  const [sortDir,    setSortDir]    = useState<"asc" | "desc">("desc");
  const [expanded,   setExpanded]   = useState<string | null>(null);
  const [toast,      setToast]      = useState<{ msg: string; ok: boolean } | null>(null);
  const [filterPlan, setFilterPlan] = useState("all");

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/customers");
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const allPlans = Array.from(
    new Set(customers.flatMap((c) => c.services))
  ).sort();

  const filtered = customers
    .filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.services.some((s) => s.toLowerCase().includes(q));
      const matchPlan =
        filterPlan === "all" || c.services.includes(filterPlan);
      return matchSearch && matchPlan;
    })
    .sort((a, b) => {
      let va: number | string = 0;
      let vb: number | string = 0;
      if (sortBy === "name")     { va = a.name;        vb = b.name; }
      if (sortBy === "spent")    { va = a.totalSpent;  vb = b.totalSpent; }
      if (sortBy === "orders")   { va = a.orderCount;  vb = b.orderCount; }
      if (sortBy === "lastSeen") { va = a.lastSeen;    vb = b.lastSeen; }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ?  1 : -1;
      return 0;
    });

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir("desc"); }
  };

  const SortIcon = ({ col }: { col: typeof sortBy }) =>
    sortBy === col ? (
      sortDir === "asc"
        ? <ChevronUp size={12} className="text-gold" />
        : <ChevronDown size={12} className="text-gold" />
    ) : (
      <ChevronDown size={12} className="text-white/25" />
    );

  const handleCreateInvoice = async (customer: Customer) => {
    try {
      const res = await fetch("/api/invoices", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName:  customer.name,
          clientEmail: customer.email,
          items: JSON.stringify([
            {
              description: "Book Design Service",
              quantity:    1,
              unitPrice:   customer.totalSpent > 0 ? customer.totalSpent : 99,
              total:       customer.totalSpent > 0 ? customer.totalSpent : 99,
            },
          ]),
          subtotal: customer.totalSpent > 0 ? customer.totalSpent : 99,
          tax:      0,
          total:    customer.totalSpent > 0 ? customer.totalSpent : 99,
          currency: "USD",
        }),
      });
      if (res.ok) {
        showToast(`Invoice created for ${customer.name}!`);
        fetchCustomers();
      } else {
        showToast("Failed to create invoice", false);
      }
    } catch {
      showToast("Network error", false);
    }
  };

  // ── Stats ──
  const totalCustomers = customers.length;
  const totalRevenue   = customers.reduce((s, c) => s + c.totalSpent, 0);
  const avgSpend       = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
  const repeatClients  = customers.filter((c) => c.orderCount > 1).length;

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
          <h2 className="font-serif text-2xl font-bold text-white">Customers</h2>
          <p className="text-white/50 text-sm mt-0.5">
            {totalCustomers} client{totalCustomers !== 1 ? "s" : ""} · Advanced management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCustomers}
            className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center hover:border-gold/40 transition-colors"
          >
            <RefreshCw size={14} className="text-white/45" />
          </button>
          <button
            onClick={() => exportCustomersCSV(filtered)}
            className="flex items-center gap-2 border border-white/15 text-white px-4 py-2 rounded-full
                       text-sm font-semibold hover:border-gold/40 hover:text-gold transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Clients",   value: totalCustomers,          icon: Users,    color: "text-white" },
          { label: "Total Revenue",   value: `$${totalRevenue.toFixed(0)}`, icon: FileText, color: "text-gold" },
          { label: "Avg. Spend",      value: `$${avgSpend.toFixed(0)}`,    icon: Package,  color: "text-white/90" },
          { label: "Repeat Clients",  value: repeatClients,           icon: RefreshCw, color: "text-emerald-300" },
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

      {/* Search + Filter */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or service..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/15 bg-white/[0.05]
                       focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm text-white placeholder:text-white/35"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-white/45" />
          <select
            value={filterPlan}
            onChange={(e) => setFilterPlan(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-white/15 bg-white/[0.05] text-sm text-white
                       focus:outline-none focus:ring-2 focus:ring-gold/30"
          >
            <option value="all">All Plans</option>
            {allPlans.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white/[0.04] rounded-2xl border border-white/10">
          <Users size={40} className="text-gold/30 mx-auto mb-3" />
          <p className="text-white/50 font-medium">No customers found.</p>
        </div>
      ) : (
        <div className="bg-white/[0.04] rounded-2xl border border-white/10 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-white/[0.06] border-b border-white/10">
            <button
              onClick={() => toggleSort("name")}
              className="col-span-3 flex items-center gap-1 text-left text-xs font-semibold text-white/45 uppercase tracking-wide hover:text-gold transition-colors"
            >
              <Users size={11} /> Client <SortIcon col="name" />
            </button>
            <span className="col-span-3 text-xs font-semibold text-white/45 uppercase tracking-wide flex items-center gap-1">
              <Mail size={11} /> Email
            </span>
            <button
              onClick={() => toggleSort("lastSeen")}
              className="col-span-2 flex items-center gap-1 text-left text-xs font-semibold text-white/45 uppercase tracking-wide hover:text-gold transition-colors"
            >
              <Calendar size={11} /> Last Order <SortIcon col="lastSeen" />
            </button>
            <span className="col-span-2 text-xs font-semibold text-white/45 uppercase tracking-wide flex items-center gap-1">
              <Package size={11} /> Services
            </span>
            <button
              onClick={() => toggleSort("spent")}
              className="col-span-1 flex items-center gap-1 text-right text-xs font-semibold text-white/45 uppercase tracking-wide hover:text-gold transition-colors justify-end"
            >
              Spent <SortIcon col="spent" />
            </button>
            <span className="col-span-1 text-xs font-semibold text-white/45 uppercase tracking-wide text-right">
              Actions
            </span>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-white/10">
            {filtered.map((customer) => (
              <div key={customer.email}>
                {/* Row */}
                <div className="grid grid-cols-12 gap-2 px-5 py-4 hover:bg-white/[0.04] transition-colors items-center">
                  {/* Name */}
                  <div className="col-span-3 flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-gold font-bold text-xs">
                        {customer.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{customer.name}</p>
                      <p className="text-white/45 text-xs">
                        {customer.orderCount} order{customer.orderCount !== 1 ? "s" : ""}
                        {customer.invoiceCount > 0 && ` · ${customer.invoiceCount} inv.`}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="col-span-3 min-w-0">
                    <p className="text-sm text-white/50 truncate">{customer.email}</p>
                    <p className="text-xs text-white/35">
                      Since {new Date(customer.firstSeen).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                    </p>
                  </div>

                  {/* Last Seen */}
                  <div className="col-span-2">
                    <p className="text-sm text-white/90">
                      {new Date(customer.lastSeen).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Services */}
                  <div className="col-span-2 flex flex-wrap gap-1">
                    {customer.services.slice(0, 2).map((s) => (
                      <span
                        key={s}
                        className="text-xs bg-gold/10 text-gold px-2 py-0.5 rounded-full font-medium truncate max-w-[80px]"
                      >
                        {s}
                      </span>
                    ))}
                    {customer.services.length > 2 && (
                      <span className="text-xs text-white/40">+{customer.services.length - 2}</span>
                    )}
                  </div>

                  {/* Spent */}
                  <div className="col-span-1 text-right">
                    <p className="font-bold text-gold text-sm">${customer.totalSpent.toFixed(0)}</p>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center justify-end gap-1">
                    <button
                      onClick={() => setExpanded(expanded === customer.email ? null : customer.email)}
                      title="View details"
                      className="w-7 h-7 rounded-lg hover:bg-gold/10 flex items-center justify-center transition-colors"
                    >
                      <Eye size={13} className="text-white/45" />
                    </button>
                    <button
                      onClick={() => handleCreateInvoice(customer)}
                      title="Create invoice"
                      className="w-7 h-7 rounded-lg hover:bg-sky-500/15 flex items-center justify-center transition-colors"
                    >
                      <Plus size={13} className="text-sky-400" />
                    </button>
                  </div>
                </div>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {expanded === customer.email && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden border-t border-white/10 bg-white/[0.03]"
                    >
                      <div className="px-5 py-5 grid sm:grid-cols-2 gap-6">

                        {/* Orders History */}
                        <div>
                          <p className="text-xs font-semibold text-white/45 uppercase tracking-wide mb-3 flex items-center gap-1">
                            <Package size={11} /> Order History ({customer.orders.length})
                          </p>
                          {customer.orders.length === 0 ? (
                            <p className="text-white/45 text-sm">No orders.</p>
                          ) : (
                            <div className="space-y-2">
                              {customer.orders.map((o) => (
                                <div
                                  key={o.id}
                                  className="bg-white/[0.05] rounded-xl px-4 py-3 border border-white/10 flex items-center justify-between gap-3"
                                >
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{o.bookTitle}</p>
                                    <p className="text-xs text-white/45">
                                      {o.plan} · {new Date(o.createdAt).toLocaleDateString("en-GB")}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-gold font-bold text-sm">${o.amount}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[o.status] || "bg-white/5 text-white/50 border border-white/10"}`}>
                                      {o.status.replace("_", " ")}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Invoices History */}
                        <div>
                          <p className="text-xs font-semibold text-white/45 uppercase tracking-wide mb-3 flex items-center gap-1">
                            <FileText size={11} /> Invoices ({customer.invoices.length})
                          </p>
                          {customer.invoices.length === 0 ? (
                            <div className="bg-white/[0.03] rounded-xl p-4 border border-dashed border-white/15 text-center">
                              <p className="text-white/45 text-sm mb-2">No invoices yet</p>
                              <button
                                onClick={() => handleCreateInvoice(customer)}
                                className="text-xs text-sky-400 font-semibold hover:underline flex items-center gap-1 mx-auto"
                              >
                                <Plus size={11} /> Create Invoice
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {customer.invoices.map((inv) => (
                                <a
                                  key={inv.id}
                                  href={`/invoice/${inv.id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="bg-white/[0.05] rounded-xl px-4 py-3 border border-white/10 flex items-center justify-between gap-3 hover:border-gold/35 transition-colors"
                                >
                                  <div className="min-w-0">
                                    <p className="text-sm font-mono font-bold text-white">{inv.invoiceNumber}</p>
                                    <p className="text-xs text-white/45">
                                      {new Date(inv.createdAt).toLocaleDateString("en-GB")}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <span className="text-gold font-bold text-sm">
                                      {inv.currency} {Number(inv.total).toFixed(0)}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[inv.status] || "bg-white/5 text-white/50 border border-white/10"}`}>
                                      {inv.status}
                                    </span>
                                  </div>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
// NEW FEATURE END (v7)
