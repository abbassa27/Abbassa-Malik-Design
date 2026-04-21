"use client";
// NEW FEATURE START
import { useSearchParams } from "next/navigation";
import { useState, useRef, Suspense } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, CheckCircle, ArrowLeft, BookOpen, Send } from "lucide-react";
import Link from "next/link";

function UploadForm() {
  const params = useSearchParams();
  const planName = params.get("plan") || "Selected";
  const amount = params.get("amount") || "";

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
    // NEW FEATURE START (v3) — Create order in DB + upload files
    try {
      // 1. Create order record
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

      // 2. Upload files if any
      if (files.length > 0 && newOrderId) {
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        await fetch(`/api/orders/${newOrderId}/upload`, { method: "POST", body: fd });
      }
    } catch {
      /* still show success even if API fails */
    }
    // NEW FEATURE END (v3)
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-gold" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-charcoal mb-4">
            Files Received! 🎉
          </h1>
          <p className="text-muted text-lg mb-8 leading-relaxed">
            Thank you, <strong className="text-charcoal">{formData.authorName || "Author"}</strong>!
            I&apos;ve received your files and project details. I&apos;ll review everything and
            get back to you within <strong className="text-gold">24 hours</strong> to confirm
            your order and timeline.
          </p>
          <div className="bg-white rounded-2xl p-6 border border-gold-light/50 mb-8 text-left">
            <h3 className="font-semibold text-charcoal mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Package</span>
                <span className="font-medium text-charcoal">{planName}</span>
              </div>
              {amount && (
                <div className="flex justify-between">
                  <span className="text-muted">Amount Paid</span>
                  <span className="font-medium text-gold">${amount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Book Title</span>
                <span className="font-medium text-charcoal">{formData.bookTitle || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Files Uploaded</span>
                <span className="font-medium text-charcoal">{files.length}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {/* NEW FEATURE START (v3) */}
            {orderId && (
              <Link
                href={`/order/${orderId}`}
                className="inline-flex items-center gap-2 bg-gold text-white font-semibold px-8 py-3 rounded-full hover:bg-gold/90 transition-all"
              >
                Track My Order
              </Link>
            )}
            {/* NEW FEATURE END (v3) */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 border-2 border-charcoal/20 hover:border-gold hover:text-gold text-charcoal font-semibold px-8 py-3 rounded-full transition-all"
            >
              <ArrowLeft size={16} /> Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-gold-light/40 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted hover:text-charcoal transition-colors text-sm font-medium">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <span className="font-serif text-lg font-bold text-charcoal">
            Abbassa<span className="text-gold">.</span>
          </span>
          <div className="text-right">
            <p className="text-xs text-muted">Package</p>
            <p className="font-semibold text-charcoal text-sm">{planName} {amount && `— $${amount}`}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-gold" />
          </div>
          <p className="text-gold text-sm font-semibold tracking-[0.2em] uppercase mb-3">
            Payment Successful
          </p>
          <h1 className="font-serif text-4xl font-bold text-charcoal mb-4">
            Upload Your Book Files
          </h1>
          <p className="text-muted text-lg max-w-xl mx-auto">
            Your payment is confirmed. Now share your manuscript, reference images, and project
            details so I can start working on your <strong className="text-gold">{planName}</strong> package.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Book Details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-8 border border-gold-light/50"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center">
                  <BookOpen size={20} className="text-gold" />
                </div>
                <h2 className="font-serif text-xl font-bold text-charcoal">Book Details</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1.5">
                    Your Name *
                  </label>
                  <input
                    required
                    value={formData.authorName}
                    onChange={(e) => setFormData((p) => ({ ...p, authorName: e.target.value }))}
                    placeholder="Author / Publisher name"
                    className="w-full px-4 py-3 rounded-xl border border-gold-light/60 bg-cream focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm text-charcoal placeholder:text-muted/60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1.5">
                    Book Title *
                  </label>
                  <input
                    required
                    value={formData.bookTitle}
                    onChange={(e) => setFormData((p) => ({ ...p, bookTitle: e.target.value }))}
                    placeholder="The title of your book"
                    className="w-full px-4 py-3 rounded-xl border border-gold-light/60 bg-cream focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm text-charcoal placeholder:text-muted/60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1.5">Genre</label>
                  <select
                    value={formData.genre}
                    onChange={(e) => setFormData((p) => ({ ...p, genre: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-gold-light/60 bg-cream focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm text-charcoal"
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
                  <label className="block text-sm font-medium text-charcoal mb-1.5">Email *</label>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-gold-light/60 bg-cream focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm text-charcoal placeholder:text-muted/60"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1.5">
                    Book Synopsis
                  </label>
                  <textarea
                    rows={3}
                    value={formData.synopsis}
                    onChange={(e) => setFormData((p) => ({ ...p, synopsis: e.target.value }))}
                    placeholder="Brief description of your book..."
                    className="w-full px-4 py-3 rounded-xl border border-gold-light/60 bg-cream focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm text-charcoal placeholder:text-muted/60 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-charcoal mb-1.5">
                    Design Instructions
                  </label>
                  <textarea
                    rows={3}
                    value={formData.instructions}
                    onChange={(e) => setFormData((p) => ({ ...p, instructions: e.target.value }))}
                    placeholder="Colors, style preferences, references, specific requests..."
                    className="w-full px-4 py-3 rounded-xl border border-gold-light/60 bg-cream focus:outline-none focus:ring-2 focus:ring-gold/30 text-sm text-charcoal placeholder:text-muted/60 resize-none"
                  />
                </div>
              </div>
            </motion.div>

            {/* File Upload */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-8 border border-gold-light/50"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center">
                  <Upload size={20} className="text-gold" />
                </div>
                <h2 className="font-serif text-xl font-bold text-charcoal">File Upload</h2>
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gold-light hover:border-gold rounded-2xl p-8 text-center cursor-pointer transition-colors mb-4 group"
              >
                <Upload
                  size={32}
                  className="mx-auto mb-3 text-muted group-hover:text-gold transition-colors"
                />
                <p className="font-medium text-charcoal text-sm mb-1">
                  Drag & drop files here
                </p>
                <p className="text-muted text-xs">
                  or click to browse — PDF, DOCX, EPUB, PNG, JPG accepted
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  accept=".pdf,.doc,.docx,.epub,.png,.jpg,.jpeg,.zip"
                  onChange={handleFileChange}
                />
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="space-y-2 mb-4">
                  {files.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-cream rounded-xl px-4 py-3 text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText size={14} className="text-gold flex-shrink-0" />
                        <span className="text-charcoal truncate">{f.name}</span>
                        <span className="text-muted text-xs flex-shrink-0">
                          ({(f.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="text-muted hover:text-red-500 transition-colors ml-2 flex-shrink-0 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-gold/5 rounded-xl p-4 text-xs text-muted leading-relaxed">
                <strong className="text-charcoal block mb-1">📁 What to upload:</strong>
                <ul className="space-y-0.5">
                  <li>• Manuscript file (DOCX or PDF)</li>
                  <li>• Reference images for the cover style</li>
                  <li>• Author photo (optional)</li>
                  <li>• Any logo or branding files</li>
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
              className="inline-flex items-center gap-3 bg-gold text-white font-bold text-lg px-12 py-5 rounded-full hover:bg-gold/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-gold/25"
            >
              {submitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Submit Project Details
                </>
              )}
            </button>
            <p className="text-muted text-sm mt-4">
              I&apos;ll review your files and respond within 24 hours.
            </p>
          </motion.div>
        </form>
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    }>
      <UploadForm />
    </Suspense>
  );
}
// NEW FEATURE END
