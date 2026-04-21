"use client";
// NEW FEATURE START (v6 — Public Invoice View Page)
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileText, CheckCircle, Clock, XCircle, AlertCircle,
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

const STATUS_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  draft:     { label: "Draft",     icon: Clock,        color: "text-muted",      bg: "bg-cream"      },
  sent:      { label: "Sent",      icon: FileText,     color: "text-blue-600",   bg: "bg-blue-50"    },
  paid:      { label: "Paid",      icon: CheckCircle,  color: "text-green-700",  bg: "bg-green-50"   },
  overdue:   { label: "Overdue",   icon: AlertCircle,  color: "text-red-600",    bg: "bg-red-50"     },
  cancelled: { label: "Cancelled", icon: XCircle,      color: "text-muted",      bg: "bg-cream"      },
};

export default function InvoicePublicPage() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    fetch(`/api/invoices/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.invoice) setInvoice(d.invoice);
        else setError("Invoice not found.");
      })
      .catch(() => setError("Failed to load invoice."))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Loading State ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          <p className="text-muted text-sm">Loading invoice...</p>
        </div>
      </div>
    );
  }

  // ── Error / Not Found State ──
  if (error || !invoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white border border-gold-light flex items-center justify-center shadow-sm">
          <FileText size={28} className="text-gold/40" />
        </div>
        <p className="text-charcoal font-semibold text-lg">{error || "Invoice not found."}</p>
        <p className="text-muted text-sm">Please check the link or contact us.</p>
      </div>
    );
  }

  const items: InvoiceItem[] = JSON.parse(invoice.items);
  const sc         = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.draft;
  const StatusIcon = sc.icon;
  const fmt        = (n: number) => `${invoice.currency} ${Number(n).toFixed(2)}`;

  return (
    <div className="min-h-screen bg-cream py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-[680px] mx-auto bg-white rounded-3xl shadow-xl overflow-hidden"
      >

        {/* ══════════════════════════════
            HEADER
        ══════════════════════════════ */}
        <div className="bg-charcoal px-10 pt-10 pb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl font-bold text-gold tracking-widest">
                ABBASSA MALIK
              </h1>
              <p className="text-white/40 text-xs mt-1 tracking-widest uppercase">
                Book Design &amp; Publishing Services
              </p>
            </div>
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 ${sc.bg} ${sc.color}`}
            >
              <StatusIcon size={12} />
              {sc.label}
            </div>
          </div>

          <div className="mt-6 flex items-end justify-between flex-wrap gap-4">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Invoice</p>
              <p className="text-white font-mono text-xl font-bold">{invoice.invoiceNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Issued</p>
              <p className="text-white text-sm font-medium">
                {new Date(invoice.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </p>
            </div>
          </div>

          {invoice.dueDate && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
              <Clock size={13} className="text-gold" />
              <span className="text-white/70 text-xs">Due:</span>
              <span className="text-white text-xs font-semibold">
                {new Date(invoice.dueDate).toLocaleDateString("en-GB", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </span>
            </div>
          )}
        </div>

        {/* ══════════════════════════════
            BODY
        ══════════════════════════════ */}
        <div className="px-10 py-8">

          {/* Billed To */}
          <div className="mb-8 pb-6 border-b border-gold-light/30">
            <p className="text-xs text-muted uppercase tracking-widest mb-2 font-semibold">
              Billed To
            </p>
            <p className="font-semibold text-charcoal text-lg leading-tight">{invoice.clientName}</p>
            <p className="text-muted text-sm mt-0.5">{invoice.clientEmail}</p>
          </div>

          {/* Items Table */}
          <div className="border border-gold-light/50 rounded-2xl overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-cream">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">
                    Description
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">
                    Qty
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">
                    Unit Price
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wide">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr
                    key={i}
                    className="border-t border-gold-light/30 hover:bg-cream/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-charcoal">{item.description}</td>
                    <td className="px-4 py-3 text-center text-muted">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-muted">{fmt(item.unitPrice)}</td>
                    <td className="px-4 py-3 text-right font-semibold text-charcoal">
                      {fmt(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="min-w-[240px] space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="text-charcoal font-medium">{fmt(invoice.subtotal)}</span>
              </div>
              {Number(invoice.tax) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Tax</span>
                  <span className="text-charcoal font-medium">{fmt(invoice.tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t-2 border-gold pt-3 mt-2">
                <span className="text-charcoal">Total Due</span>
                <span className="text-gold">{fmt(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-cream rounded-2xl p-5 mb-6 border-l-4 border-gold">
              <p className="text-xs text-muted uppercase tracking-wide font-semibold mb-1.5">Notes</p>
              <p className="text-charcoal text-sm leading-relaxed">{invoice.notes}</p>
            </div>
          )}

          {/* Payment Status Block */}
          {invoice.status === "paid" ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle size={24} className="text-green-600" />
              </div>
              <p className="text-green-700 font-bold text-xl">Payment Received</p>
              {invoice.paidAt && (
                <p className="text-green-600 text-sm mt-2">
                  Paid on{" "}
                  {new Date(invoice.paidAt).toLocaleDateString("en-GB", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </p>
              )}
              <p className="text-green-600/70 text-xs mt-2">Thank you for your payment!</p>
            </div>

          ) : invoice.status === "cancelled" ? (
            <div className="bg-cream border border-gold-light rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <XCircle size={24} className="text-muted" />
              </div>
              <p className="text-muted font-semibold text-lg">Invoice Cancelled</p>
              <p className="text-muted/60 text-sm mt-1">This invoice is no longer active.</p>
            </div>

          ) : (
            <div className="bg-cream rounded-2xl p-6 border border-gold-light/50">
              <p className="text-xs text-muted uppercase tracking-wide font-semibold text-center mb-4">
                Payment Methods
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-4 border border-gold-light/50 text-center">
                  <div className="text-2xl mb-1">💳</div>
                  <p className="font-semibold text-charcoal text-sm">PayPal</p>
                  <p className="text-muted text-xs mt-0.5">Instant payment</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gold-light/50 text-center">
                  <div className="text-2xl mb-1">🏦</div>
                  <p className="font-semibold text-charcoal text-sm">Wise Transfer</p>
                  <p className="text-muted text-xs mt-0.5">Bank transfer</p>
                </div>
              </div>
              <p className="text-center text-muted text-xs mt-4">
                After payment, please contact us to confirm at{" "}
                <span className="text-gold font-semibold">abbassa-malik.com</span>
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gold-light/30 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs text-muted">
                Invoice #{invoice.invoiceNumber}
              </p>
              <p className="text-xs text-muted/60 mt-0.5">
                Issued{" "}
                {new Date(invoice.createdAt).toLocaleDateString("en-GB", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </p>
            </div>
            <a
              href="https://abbassa-malik.com"
              target="_blank"
              rel="noreferrer"
              className="font-serif text-gold font-bold text-lg tracking-wide hover:text-gold/80 transition-colors"
            >
              Abbassa.
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
// NEW FEATURE END (v6)
