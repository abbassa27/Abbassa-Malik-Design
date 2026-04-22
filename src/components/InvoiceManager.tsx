"use client";
// NEW FEATURE START (v6 — Invoice Manager Component)
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Plus, Send, CheckCircle, Clock,
  XCircle, AlertCircle, Eye, DollarSign, Trash2, X,
} from "lucide-react";

interface InvoiceItem {
  description: string;
  quantity:    number;
  unitPrice:   number;
  total:       number;
}

interface Invoice {
  id:            string;
  invoiceNumber: string;
  clientName:    string;
  clientEmail:   string;
  items:         string;
  subtotal:      number;
  tax:           number;
  total:         number;
  currency:      string;
  status:        string;
  dueDate:       string | null;
  notes:         string;
  sentAt:        string | null;
  paidAt:        string | null;
  createdAt:     string;
}

interface InvoiceStats {
  total:     number;
  collected: number;
  byStatus:  { status: string; count: number; sum: number }[];
}

const STATUS_CFG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  draft:     { label: "Draft",     color: "text-white/50",     bg: "bg-white/5 border border-white/10",     icon: Clock },
  sent:      { label: "Sent",      color: "text-sky-300",  bg: "bg-sky-500/15 border border-sky-500/25",   icon: FileText },
  paid:      { label: "Paid",      color: "text-emerald-300", bg: "bg-emerald-500/15 border border-emerald-500/25",  icon: CheckCircle },
  overdue:   { label: "Overdue",   color: "text-red-300",   bg: "bg-red-500/15 border border-red-500/25",    icon: AlertCircle },
  cancelled: { label: "Cancelled", color: "text-white/45",     bg: "bg-white/5 border border-white/10",     icon: XCircle },
};

const EMPTY_ITEM: InvoiceItem = { description: "", quantity: 1, unitPrice: 0, total: 0 };

function fmt(n: number, currency = "USD") {
  return `${currency} ${n.toFixed(2)}`;
}

export default function InvoiceManager() {
  const [invoices,   setInvoices]   = useState<Invoice[]>([]);
  const [stats,      setStats]      = useState<InvoiceStats | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [sending,    setSending]    = useState<string | null>(null);
  const [marking,    setMarking]    = useState<string | null>(null);
  const [toast,      setToast]      = useState<{ msg: string; ok: boolean } | null>(null);
  const [saving,     setSaving]     = useState(false);

  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    currency: "USD",
    dueDate: "",
    notes: "",
    tax: "0",
  });
  const [items, setItems] = useState<InvoiceItem[]>([{ ...EMPTY_ITEM }]);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/invoices");
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
        setStats(data.stats || null);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  const updateItem = (i: number, field: keyof InvoiceItem, val: string | number) => {
    setItems((prev) =>
      prev.map((it, idx) => {
        if (idx !== i) return it;
        const updated = { ...it, [field]: field === "description" ? val : Number(val) };
        if (field === "quantity" || field === "unitPrice") {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      })
    );
  };

  const subtotal  = items.reduce((s, it) => s + it.total, 0);
  const taxAmount = (subtotal * Number(form.tax || 0)) / 100;
  const total     = subtotal + taxAmount;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: JSON.stringify(items),
          subtotal,
          tax:   taxAmount,
          total,
        }),
      });
      if (res.ok) {
        showToast("Invoice created successfully!");
        setShowCreate(false);
        setForm({ clientName: "", clientEmail: "", currency: "USD", dueDate: "", notes: "", tax: "0" });
        setItems([{ ...EMPTY_ITEM }]);
        fetchInvoices();
      } else {
        showToast("Failed to create invoice", false);
      }
    } catch {
      showToast("Network error", false);
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async (id: string) => {
    setSending(id);
    try {
      const res  = await fetch(`/api/invoices/${id}/send`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        showToast("Invoice sent to client's email!");
        fetchInvoices();
      } else {
        showToast(data.error || "Send failed", false);
      }
    } catch {
      showToast("Network error", false);
    } finally {
      setSending(null);
    }
  };

  const handleMarkPaid = async (id: string) => {
    setMarking(id);
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid", paidAt: new Date().toISOString() }),
      });
      if (res.ok) {
        showToast("Invoice marked as paid ✓");
        fetchInvoices();
      } else {
        showToast("Failed to update status", false);
      }
    } catch {
      showToast("Network error", false);
    } finally {
      setMarking(null);
    }
  };

  const filtered = filter === "all"
    ? invoices
    : invoices.filter((inv) => inv.status === filter);

  return (
    <div className="space-y-6">

      {/* ── Toast Notification ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold
              ${toast.ok ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-bold text-white">Invoices</h2>
          <p className="text-white/50 text-sm mt-0.5">Create, send & track client invoices</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 bg-gold text-white px-5 py-2.5 rounded-full
                     font-semibold text-sm hover:bg-gold/90 transition-all shadow-sm"
        >
          <Plus size={16} /> New Invoice
        </button>
      </div>

      {/* ── Stats Cards ── */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Invoices", value: stats.total,         icon: FileText,     color: "text-white" },
            { label: "Collected",      value: fmt(stats.collected), icon: DollarSign,   color: "text-gold" },
            {
              label: "Paid",
              value: stats.byStatus.find((s) => s.status === "paid")?.count ?? 0,
              icon: CheckCircle,
              color: "text-emerald-300",
            },
            {
              label: "Pending",
              value: stats.byStatus.find((s) => s.status === "sent")?.count ?? 0,
              icon: Clock,
              color: "text-sky-300",
            },
          ].map((k, i) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
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

      {/* ── Create Invoice Form ── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/[0.04] rounded-2xl border border-white/10 p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white text-lg">Create New Invoice</h3>
              <button
                onClick={() => setShowCreate(false)}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X size={14} className="text-white/45" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-5">

              {/* Client Info */}
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
                    Currency
                  </label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-white/[0.05]
                               focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm text-white placeholder:text-white/35"
                  >
                    <option>USD</option>
                    <option>EUR</option>
                    <option>GBP</option>
                    <option>DZD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/45 uppercase tracking-wide mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-white/[0.05]
                               focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm text-white placeholder:text-white/35"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-white/45 uppercase tracking-wide">
                    Line Items
                  </label>
                  <button
                    type="button"
                    onClick={() => setItems([...items, { ...EMPTY_ITEM }])}
                    className="text-xs text-gold hover:text-gold/80 font-semibold flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Item
                  </button>
                </div>

                {/* Column headers */}
                <div className="grid grid-cols-12 gap-2 mb-1 px-1">
                  <span className="col-span-5 text-xs text-white/45">Description</span>
                  <span className="col-span-2 text-xs text-white/45 text-center">Qty</span>
                  <span className="col-span-2 text-xs text-white/45 text-right">Unit Price</span>
                  <span className="col-span-2 text-xs text-white/45 text-right">Total</span>
                  <span className="col-span-1" />
                </div>

                <div className="space-y-2">
                  {items.map((it, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        value={it.description}
                        onChange={(e) => updateItem(i, "description", e.target.value)}
                        placeholder="Service description"
                        className="col-span-5 px-3 py-2 rounded-lg border border-white/15 bg-white/[0.05]
                                   text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold/30 placeholder:text-white/35"
                      />
                      <input
                        type="number"
                        min="1"
                        value={it.quantity}
                        onChange={(e) => updateItem(i, "quantity", e.target.value)}
                        className="col-span-2 px-3 py-2 rounded-lg border border-white/15 bg-white/[0.05]
                                   text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold/30 text-center"
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={it.unitPrice}
                        onChange={(e) => updateItem(i, "unitPrice", e.target.value)}
                        className="col-span-2 px-3 py-2 rounded-lg border border-white/15 bg-white/[0.05]
                                   text-sm text-white focus:outline-none focus:ring-1 focus:ring-gold/30 text-right"
                      />
                      <div className="col-span-2 text-right text-sm font-semibold text-gold">
                        {fmt(it.total, form.currency)}
                      </div>
                      <button
                        type="button"
                        onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                        className="col-span-1 w-7 h-7 rounded-lg hover:bg-red-500/15 flex items-center justify-center transition-colors"
                      >
                        <Trash2 size={12} className="text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tax + Totals */}
              <div className="flex flex-wrap items-end gap-6">
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-xs font-semibold text-white/45 uppercase tracking-wide mb-1.5">
                    Tax (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={form.tax}
                    onChange={(e) => setForm({ ...form, tax: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-white/[0.05]
                               focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm text-white placeholder:text-white/35"
                  />
                </div>
                <div className="text-right space-y-1 min-w-[200px]">
                  <div className="flex justify-between text-sm gap-8">
                    <span className="text-white/45">Subtotal</span>
                    <span className="font-medium text-white">{fmt(subtotal, form.currency)}</span>
                  </div>
                  {taxAmount > 0 && (
                    <div className="flex justify-between text-sm gap-8">
                      <span className="text-white/45">Tax ({form.tax}%)</span>
                      <span className="font-medium text-white">{fmt(taxAmount, form.currency)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold border-t border-white/15 pt-1 gap-8">
                    <span className="text-white">Total</span>
                    <span className="text-gold">{fmt(total, form.currency)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-white/45 uppercase tracking-wide mb-1.5">
                  Notes <span className="text-white/40 font-normal">(optional)</span>
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  placeholder="Payment terms, special instructions..."
                  className="w-full px-4 py-2.5 rounded-xl border border-white/15 bg-white/[0.05]
                             focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm text-white resize-none placeholder:text-white/35"
                />
              </div>

              <button
                type="submit"
                disabled={saving || items.length === 0}
                className="bg-gold text-white font-semibold px-8 py-3 rounded-full
                           hover:bg-gold/90 transition-all disabled:opacity-60 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FileText size={16} /> Create Invoice
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Filter Tabs ── */}
      <div className="flex flex-wrap gap-2">
        {["all", "draft", "sent", "paid", "overdue", "cancelled"].map((s) => (
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

      {/* ── Invoice List ── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white/[0.04] rounded-2xl border border-white/10">
          <FileText size={40} className="text-gold/30 mx-auto mb-3" />
          <p className="text-white/50 font-medium">No invoices found.</p>
          <p className="text-white/35 text-sm mt-1">Create your first invoice above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inv) => {
            const sc         = STATUS_CFG[inv.status] || STATUS_CFG.draft;
            const StatusIcon = sc.icon;
            const parsedItems: InvoiceItem[] = JSON.parse(inv.items);

            return (
              <motion.div
                key={inv.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white/[0.04] rounded-2xl border border-white/10 p-5 hover:border-gold/20 transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-xs font-bold text-gold bg-white/10 px-2 py-0.5 rounded border border-white/10">
                        {inv.invoiceNumber}
                      </span>
                      <span
                        className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}
                      >
                        <StatusIcon size={11} /> {sc.label}
                      </span>
                    </div>
                    <p className="font-semibold text-white text-base">{inv.clientName}</p>
                    <p className="text-white/50 text-sm">{inv.clientEmail}</p>
                    <p className="text-white/40 text-xs mt-1">
                      {parsedItems.length} item{parsedItems.length !== 1 ? "s" : ""}
                      &nbsp;·&nbsp; Issued {new Date(inv.createdAt).toLocaleDateString()}
                      {inv.dueDate ? ` · Due ${new Date(inv.dueDate).toLocaleDateString()}` : ""}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-gold font-serif">
                      {fmt(inv.total, inv.currency)}
                    </p>
                    {inv.paidAt && (
                      <p className="text-xs text-emerald-400 mt-0.5">
                        Paid {new Date(inv.paidAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <a
                    href={`/invoice/${inv.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold text-white
                               border border-white/15 px-3 py-1.5 rounded-full hover:border-gold/40 hover:text-gold transition-colors"
                  >
                    <Eye size={12} /> View
                  </a>

                  {inv.status !== "paid" && inv.status !== "cancelled" && (
                    <button
                      onClick={() => handleSend(inv.id)}
                      disabled={sending === inv.id}
                      className="flex items-center gap-1.5 text-xs font-semibold text-sky-300
                                 border border-sky-500/30 px-3 py-1.5 rounded-full hover:bg-sky-500/10
                                 transition-colors disabled:opacity-60"
                    >
                      {sending === inv.id ? (
                        <span className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send size={12} />
                      )}
                      {inv.sentAt ? "Resend Email" : "Send Email"}
                    </button>
                  )}

                  {(inv.status === "sent" || inv.status === "overdue") && (
                    <button
                      onClick={() => handleMarkPaid(inv.id)}
                      disabled={marking === inv.id}
                      className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300
                                 border border-emerald-500/30 px-3 py-1.5 rounded-full hover:bg-emerald-500/10
                                 transition-colors disabled:opacity-60"
                    >
                      {marking === inv.id ? (
                        <span className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle size={12} />
                      )}
                      Mark as Paid
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
}
// NEW FEATURE END (v6)
