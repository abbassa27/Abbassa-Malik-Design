"use client";

import { useSearchParams } from "next/navigation";
import { useState, useRef, Suspense, useEffect } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle, ArrowLeft, BookOpen, Send } from "lucide-react";
import Link from "next/link";
// # NEW FEATURE START - Chargily payment success modal integration
import PaymentSuccessModal, {
  type PaymentTransaction,
} from "@/components/PaymentSuccessModal";
// # NEW FEATURE END

function UploadForm() {
  const params = useSearchParams();
  const planName = params?.get("plan") || "Selected";
  const amount = params?.get("amount") || "";

  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    authorName: "",
    bookTitle: "",
    genre: "",
    synopsis: "",
    email: "",
    instructions: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // # NEW FEATURE START - Chargily payment success state
  const paymentStatus = params?.get("payment");
  const paymentProvider = params?.get("provider");
  const paymentSessionId = params?.get("session_id") || params?.get("checkout_id");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentTx, setPaymentTx] = useState<PaymentTransaction | null>(null);

  useEffect(() => {
    if (paymentStatus !== "success") return;
    if (typeof window === "undefined") return;

    let saved: Partial<PaymentTransaction> & {
      amount?: number | string;
      checkout_id?: string;
      name?: string;
      email?: string;
      phone?: string;
      description?: string;
    } = {};
    try {
      const raw = sessionStorage.getItem("chargily_pending_payment");
      if (raw) saved = JSON.parse(raw);
    } catch {
      /* ignore */
    }

    const tx: PaymentTransaction = {
      transactionId:
        paymentSessionId ||
        (saved.checkout_id as string | undefined) ||
        `TXN-${Date.now()}`,
      name: saved.name || "Customer",
      email: saved.email || "",
      phone: saved.phone || "",
      amount: saved.amount ?? amount ?? "",
      currency: "DZD",
      provider: paymentProvider || "chargily-edahabia",
      description: saved.description || "Edahabia payment",
      paidAt: new Date().toLocaleString(),
    };

    setPaymentTx(tx);
    setShowPaymentModal(true);

    // Pre-fill upload form with the payment customer details so the flow is seamless
    setFormData((prev) => ({
      ...prev,
      authorName: prev.authorName || tx.name,
      email: prev.email || tx.email,
    }));
  }, [paymentStatus, paymentProvider, paymentSessionId, amount]);
  // # NEW FEATURE END

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...dropped]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planName,
          amount,
          authorName: formData.authorName,
          bookTitle: formData.bookTitle,
          genre: formData.genre,
          email: formData.email,
          synopsis: formData.synopsis,
          instructions: formData.instructions,
        }),
      });
      const orderData = await orderRes.json();
      const newOrderId = orderData.orderId || "";
      setOrderId(newOrderId);

      if (files.length > 0 && newOrderId) {
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        await fetch(`/api/orders/${newOrderId}/upload`, { method: "POST", body: fd });
      }
    } catch {
      /* still show success */
    }
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-gold/15 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-gold/30">
            <CheckCircle size={40} className="text-gold" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-white mb-4">
            Files Received
          </h1>
          <p className="text-white/65 text-lg mb-8 leading-relaxed">
            Thank you, <strong className="text-white">{formData.authorName || "Author"}</strong>!
            I&apos;ve received your files and project details. I&apos;ll review everything and
            get back to you within <strong className="text-gold">24 hours</strong>.
          </p>
          <div className="bg-white/[0.04] rounded-2xl p-6 border border-white/10 mb-8 text-left">
            <h3 className="font-semibold text-white mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/50">Package</span>
                <span className="font-medium text-white">{planName}</span>
              </div>
              {amount && (
                <div className="flex justify-between">
                  <span className="text-white/50">Amount Paid</span>
                  <span className="font-medium text-gold">${amount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-white/50">Book Title</span>
                <span className="font-medium text-white">{formData.bookTitle || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Files Uploaded</span>
                <span className="font-medium text-white">{files.length}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {orderId && (
              <Link
                href={`/order/${orderId}`}
                className="inline-flex items-center gap-2 bg-gold text-void font-semibold px-8 py-3 rounded-full hover:bg-gold-light transition-all"
              >
                Track My Order
              </Link>
            )}
            <Link
              href="/"
              className="inline-flex items-center gap-2 border border-white/20 hover:border-gold text-white font-semibold px-8 py-3 rounded-full transition-all"
            >
              <ArrowLeft size={16} /> Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-void">
      {/* # NEW FEATURE START - Chargily success modal */}
      {paymentTx && (
        <PaymentSuccessModal
          open={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onContinue={() => setShowPaymentModal(false)}
          transaction={paymentTx}
        />
      )}
      {/* # NEW FEATURE END */}
      <div className="bg-void/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white/55 hover:text-gold transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <span className="font-serif text-lg font-bold text-white">
            AM<span className="text-gold">.</span>
          </span>
          <div className="text-right">
            <p className="text-xs text-white/45">Package</p>
            <p className="font-semibold text-white text-sm">{planName} {amount && `— $${amount}`}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gold/15 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-1 ring-gold/25">
            <CheckCircle size={32} className="text-gold" />
          </div>
          <p className="text-gold text-sm font-semibold tracking-[0.2em] uppercase mb-3">
            Payment Successful
          </p>
          <h1 className="font-serif text-4xl font-bold text-white mb-4">
            Upload Your Book Files
          </h1>
          <p className="text-white/60 text-lg max-w-xl mx-auto">
            Your payment is confirmed. Share your manuscript, reference images, and project
            details so I can start on your <strong className="text-gold">{planName}</strong> package.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/[0.04] rounded-2xl p-8 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gold/15 rounded-xl flex items-center justify-center">
                  <BookOpen size={20} className="text-gold" />
                </div>
                <h2 className="font-serif text-xl font-bold text-white">Book Details</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">Your Name *</label>
                  <input
                    required
                    value={formData.authorName}
                    onChange={(e) => setFormData((p) => ({ ...p, authorName: e.target.value }))}
                    placeholder="Author / Publisher name"
                    className="w-full px-4 py-3 rounded-xl border border-white/15 bg-void focus:outline-none focus:ring-2 focus:ring-gold/40 text-sm text-white placeholder:text-white/35"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">Book Title *</label>
                  <input
                    required
                    value={formData.bookTitle}
                    onChange={(e) => setFormData((p) => ({ ...p, bookTitle: e.target.value }))}
                    placeholder="The title of your book"
                    className="w-full px-4 py-3 rounded-xl border border-white/15 bg-void focus:outline-none focus:ring-2 focus:ring-gold/40 text-sm text-white placeholder:text-white/35"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">Genre</label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData((p) => ({ ...p, genre: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-white/15 bg-void focus:outline-none focus:ring-2 focus:ring-gold/40 text-sm text-white"
                  >
                    <option value="">Select genre...</option>
                    <option>Fiction</option>
                    <option>Non-Fiction</option>
                    <option>Self-Help</option>
                    <option>Business</option>
                    <option>Children&apos;s Book</option>
                    <option>Academic</option>
                    <option>Poetry</option>
                    <option>Biography</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">Email *</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-white/15 bg-void focus:outline-none focus:ring-2 focus:ring-gold/40 text-sm text-white placeholder:text-white/35"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">Book Synopsis</label>
                  <textarea
                    rows={3}
                    value={formData.synopsis}
                    onChange={(e) => setFormData((p) => ({ ...p, synopsis: e.target.value }))}
                    placeholder="Brief description of your book..."
                    className="w-full px-4 py-3 rounded-xl border border-white/15 bg-void focus:outline-none focus:ring-2 focus:ring-gold/40 text-sm text-white placeholder:text-white/35 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1.5">Design Instructions</label>
                  <textarea
                    rows={3}
                    value={formData.instructions}
                    onChange={(e) => setFormData((p) => ({ ...p, instructions: e.target.value }))}
                    placeholder="Colors, style preferences, references..."
                    className="w-full px-4 py-3 rounded-xl border border-white/15 bg-void focus:outline-none focus:ring-2 focus:ring-gold/40 text-sm text-white placeholder:text-white/35 resize-none"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/[0.04] rounded-2xl p-8 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gold/15 rounded-xl flex items-center justify-center">
                  <Upload size={20} className="text-gold" />
                </div>
                <h2 className="font-serif text-xl font-bold text-white">File Upload</h2>
              </div>

              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gold/35 hover:border-gold/60 rounded-2xl p-8 text-center cursor-pointer transition-colors mb-4 group"
              >
                <Upload size={32} className="mx-auto mb-3 text-white/40 group-hover:text-gold transition-colors" />
                <p className="font-medium text-white text-sm mb-1">Drag & drop files here</p>
                <p className="text-white/45 text-xs">or click to browse — PDF, DOCX, EPUB, PNG, JPG, ZIP</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  accept=".pdf,.doc,.docx,.epub,.png,.jpg,.jpeg,.zip"
                  onChange={handleFileChange}
                />
              </div>

              {files.length > 0 && (
                <div className="space-y-2 mb-4">
                  {files.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-white/[0.05] rounded-xl px-4 py-3 text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={14} className="text-gold flex-shrink-0" />
                        <span className="text-white truncate">{f.name}</span>
                        <span className="text-white/40 text-xs flex-shrink-0">
                          ({(f.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="text-white/45 hover:text-red-400 transition-colors ml-2 flex-shrink-0 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-gold/10 rounded-xl p-4 text-xs text-white/55 leading-relaxed border border-gold/15">
                <strong className="text-white block mb-1">What to upload</strong>
                <ul className="space-y-0.5">
                  <li>• Manuscript (DOCX or PDF)</li>
                  <li>• Reference images for the cover</li>
                  <li>• Author photo (optional)</li>
                  <li>• Logos / branding files</li>
                </ul>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-3 bg-gold text-void font-bold text-lg px-12 py-5 rounded-full hover:bg-gold-light transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-gold/20"
            >
              {submitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-void/30 border-t-void rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Submit Project Details
                </>
              )}
            </button>
            <p className="text-white/45 text-sm mt-4">I&apos;ll review your files and respond within 24 hours.</p>
          </motion.div>
        </form>
      </div>
    </div>
  );
}

export default function UploadProjectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-void flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      }
    >
      <UploadForm />
    </Suspense>
  );
}
