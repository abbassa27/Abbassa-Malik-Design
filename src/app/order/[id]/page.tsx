"use client";
// NEW FEATURE START (v3 — Client Order Tracker)
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Download, FileText, Clock, RefreshCw, CheckCircle, Truck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Order, OrderFile } from "@prisma/client";
// NEW FEATURE START (v4 — Messages in client order page)
import dynamic from "next/dynamic";
const MessageThread = dynamic(() => import("@/components/MessageThread"), { ssr: false });
// NEW FEATURE END (v4)

const STATUS_STEPS: Order["status"][] = ["pending", "in_progress", "completed", "delivered"];
const STATUS_LABELS: Record<Order["status"], string> = {
  pending: "Received",
  in_progress: "In Progress",
  completed: "Completed",
  delivered: "Delivered",
};
const STATUS_ICONS: Record<Order["status"], typeof Clock> = {
  pending: Clock,
  in_progress: RefreshCw,
  completed: CheckCircle,
  delivered: Truck,
};

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export default function ClientOrderPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/orders/client/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.order) setOrder(d.order);
        else setError("Order not found.");
        setLoading(false);
      })
      .catch(() => { setError("Could not load order."); setLoading(false); });
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
    </div>
  );

  if (error || !order) return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-muted text-lg mb-4">{error || "Order not found."}</p>
        <Link href="/" className="text-gold font-semibold hover:underline">← Back to Home</Link>
      </div>
    </div>
  );

  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-gold-light/40">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted hover:text-charcoal transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Home
          </Link>
          <span className="font-serif text-xl font-bold text-charcoal">Abbassa<span className="text-gold">.</span></span>
          <div />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-gold text-sm font-semibold tracking-[0.2em] uppercase mb-3">Order Tracker</p>
          <h1 className="font-serif text-3xl font-bold text-charcoal mb-1">{order.bookTitle}</h1>
          <p className="text-muted mb-8">by {order.authorName} · {order.plan} Package · <span className="text-gold font-semibold">${order.amount}</span></p>

          {/* Progress Steps */}
          <div className="bg-white rounded-2xl border border-gold-light/50 p-6 mb-6">
            <h2 className="font-semibold text-charcoal text-sm mb-5">Order Status</h2>
            <div className="flex items-center gap-2">
              {STATUS_STEPS.map((step, i) => {
                const Icon = STATUS_ICONS[step];
                const done = i <= currentStep;
                const active = i === currentStep;
                return (
                  <div key={step} className="flex items-center gap-2 flex-1 last:flex-none">
                    <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${done ? "bg-gold text-white" : "bg-cream text-muted border border-gold-light"}`}>
                      <Icon size={14} className={active ? "animate-pulse" : ""} />
                    </div>
                    <div className="flex-1 last:hidden">
                      <div className={`h-0.5 rounded-full ${done && i < currentStep ? "bg-gold" : "bg-gold-light/50"}`} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex mt-2">
              {STATUS_STEPS.map((step) => (
                <div key={step} className="flex-1 last:flex-none">
                  <p className={`text-xs font-medium ${step === order.status ? "text-gold" : "text-muted"}`}>
                    {STATUS_LABELS[step]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Deliverables */}
          <div className="bg-white rounded-2xl border border-gold-light/50 p-6 mb-6">
            <h2 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
              <Truck size={16} className="text-gold" /> Your Files
            </h2>
            {order.deliverables.length === 0 ? (
              <div className="text-center py-8">
                <Clock size={28} className="mx-auto text-muted/40 mb-3" />
                <p className="text-muted text-sm">Your files are being prepared. You&apos;ll find them here once ready.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {order.deliverables.map((f: OrderFile) => (
                  <div key={f.id} className="flex items-center justify-between bg-green-50 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={14} className="text-green-600 flex-shrink-0" />
                      <span className="text-charcoal text-sm truncate">{f.filename}</span>
                      <span className="text-muted text-xs flex-shrink-0">({formatBytes(f.size)})</span>
                    </div>
                    <a
                      href={`/api/orders/${order.id}/download/${f.storedAs}`}
                      download={f.filename}
                      className="flex items-center gap-1.5 bg-gold text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-gold/90 transition-colors flex-shrink-0 ml-2"
                    >
                      <Download size={11} /> Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* NEW FEATURE START (v4 — Message Thread for client) */}
          <div className="bg-white rounded-2xl border border-gold-light/50 p-6 mb-6">
            <MessageThread orderId={order.id} viewerRole="client" />
          </div>
          {/* NEW FEATURE END (v4) */}

          {/* Order Info */}
          <div className="bg-white rounded-2xl border border-gold-light/50 p-6">
            <h2 className="font-semibold text-charcoal mb-4 text-sm">Order Details</h2>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              {[
                ["Order ID", order.id.slice(0, 8).toUpperCase()],
                ["Package", order.plan],
                ["Genre", order.genre || "—"],
                ["Submitted", new Date(order.createdAt).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" })],
              ].map(([l, v]) => (
                <div key={l} className="bg-cream rounded-xl px-4 py-3">
                  <p className="text-xs text-muted uppercase tracking-wide font-medium">{l}</p>
                  <p className="text-charcoal font-medium mt-0.5">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
// NEW FEATURE END (v3)
