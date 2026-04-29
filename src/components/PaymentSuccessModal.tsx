"use client";
// # NEW FEATURE START - Chargily Pay success modal (QR + PDF receipt)
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Download, X, ArrowRight, QrCode } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

export type PaymentTransaction = {
  transactionId: string;
  name: string;
  email: string;
  phone: string;
  amount: number | string;
  currency?: string;
  provider?: string;
  description?: string;
  paidAt?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
  transaction: PaymentTransaction;
};

export default function PaymentSuccessModal({ open, onClose, onContinue, transaction }: Props) {
  const qrWrapperRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const qrValue = JSON.stringify({
    txn: transaction.transactionId,
    amount: transaction.amount,
    currency: transaction.currency || "DZD",
    email: transaction.email,
    provider: transaction.provider || "chargily-edahabia",
  });

  const downloadReceipt = async () => {
    setDownloading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const marginX = 48;
      let y = 72;

      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor("#0A0A0A");
      doc.text("Payment Receipt", marginX, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor("#8B6914");
      doc.text("Abbassa Malik Design · Chargily Pay (EDAHABIA)", marginX, y + 18);

      // Gold separator
      y += 36;
      doc.setDrawColor("#C9A963");
      doc.setLineWidth(1);
      doc.line(marginX, y, pageWidth - marginX, y);

      // Body fields
      y += 32;
      doc.setFontSize(11);
      doc.setTextColor("#111111");
      const lines: [string, string][] = [
        ["Transaction ID", transaction.transactionId],
        ["Paid at", transaction.paidAt || new Date().toLocaleString()],
        ["Customer", transaction.name],
        ["Email", transaction.email],
        ["Phone", transaction.phone || "—"],
        ["Description", transaction.description || "Edahabia payment"],
        [
          "Amount",
          `${transaction.amount} ${(transaction.currency || "DZD").toUpperCase()}`,
        ],
        ["Status", "PAID"],
      ];

      for (const [label, value] of lines) {
        doc.setFont("helvetica", "bold");
        doc.text(`${label}:`, marginX, y);
        doc.setFont("helvetica", "normal");
        const text = doc.splitTextToSize(value, pageWidth - marginX * 2 - 110) as string[];
        doc.text(text, marginX + 110, y);
        y += 18 * Math.max(1, text.length);
      }

      // QR code — rendered from the canvas in the DOM
      const canvas = qrWrapperRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
      if (canvas) {
        const dataUrl = canvas.toDataURL("image/png");
        y += 16;
        doc.setFont("helvetica", "bold");
        doc.text("Transaction QR", marginX, y);
        y += 12;
        doc.addImage(dataUrl, "PNG", marginX, y, 140, 140);
        y += 148;
      }

      // Footer
      doc.setDrawColor("#C9A963");
      doc.line(marginX, y, pageWidth - marginX, y);
      y += 22;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor("#555555");
      doc.text(
        "Thank you for your purchase. This receipt was issued automatically.",
        marginX,
        y
      );

      doc.save(`receipt-${transaction.transactionId}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF receipt:", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center px-4"
          aria-modal="true"
          role="dialog"
          aria-labelledby="payment-success-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-lg rounded-2xl border border-gold/25 bg-void shadow-[0_24px_60px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 text-white/55 hover:text-gold transition-colors z-10"
            >
              <X size={20} />
            </button>

            {/* Gold top gradient */}
            <div className="h-1.5 w-full bg-gradient-to-r from-gold-deep via-gold to-gold-light" />

            <div className="p-7 sm:p-9">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-gold/15 ring-1 ring-gold/30 flex items-center justify-center">
                  <CheckCircle size={24} className="text-gold" />
                </div>
                <div>
                  <p className="text-gold text-[11px] font-semibold tracking-[0.28em] uppercase">
                    Payment successful
                  </p>
                  <h3
                    id="payment-success-title"
                    className="font-serif text-2xl font-bold text-white"
                  >
                    Thank you, {transaction.name || "Customer"}!
                  </h3>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm mb-5">
                <dl className="grid grid-cols-[120px_1fr] gap-y-2 gap-x-4 text-white/75">
                  <dt className="text-white/45">Transaction ID</dt>
                  <dd className="font-mono text-xs text-white break-all">
                    {transaction.transactionId}
                  </dd>
                  <dt className="text-white/45">Amount</dt>
                  <dd className="font-semibold text-gold">
                    {transaction.amount} {(transaction.currency || "DZD").toUpperCase()}
                  </dd>
                  <dt className="text-white/45">Email</dt>
                  <dd className="text-white break-all">{transaction.email || "—"}</dd>
                  <dt className="text-white/45">Phone</dt>
                  <dd className="text-white">{transaction.phone || "—"}</dd>
                  <dt className="text-white/45">Method</dt>
                  <dd className="text-white capitalize">
                    {transaction.provider || "Chargily · Edahabia"}
                  </dd>
                </dl>
              </div>

              <div className="flex items-center gap-5 mb-6">
                <div
                  ref={qrWrapperRef}
                  className="rounded-xl bg-white p-3 ring-1 ring-gold/30 flex-shrink-0"
                >
                  <QRCodeCanvas value={qrValue} size={108} level="M" includeMargin={false} />
                </div>
                <div className="text-xs text-white/55 leading-relaxed">
                  <div className="flex items-center gap-1.5 mb-1 text-gold font-semibold text-[11px] uppercase tracking-widest">
                    <QrCode size={12} /> Transaction QR
                  </div>
                  Scan this code to retrieve the transaction details. Keep it with your receipt
                  for reference.
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={downloadReceipt}
                  disabled={downloading}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-gold/40 text-gold font-semibold px-5 py-3 text-sm hover:bg-gold/10 transition-colors disabled:opacity-60"
                >
                  <Download size={16} />
                  {downloading ? "Generating..." : "Download Receipt"}
                </button>
                <button
                  onClick={onContinue}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold to-gold-deep text-void font-semibold px-5 py-3 text-sm shadow-lg shadow-gold/25 hover:opacity-95 transition-opacity"
                >
                  Continue to Upload <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
// # NEW FEATURE END
