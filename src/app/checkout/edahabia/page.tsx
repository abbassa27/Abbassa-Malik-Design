"use client";
// # NEW FEATURE START - Chargily Pay: Edahabia checkout page
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Loader2, ShieldCheck, AlertCircle } from "lucide-react";

type FormState = {
  name: string;
  email: string;
  phone: string;
  amount: string;
  description: string;
};

const SESSION_KEY = "chargily_pending_payment";

function CheckoutForm() {
  const router = useRouter();
  const params = useSearchParams();
  const failed = params?.get("payment") === "failed";

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    amount: "",
    description: "Book design package",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    failed ? "Your previous payment did not complete. Please try again." : null
  );

  useEffect(() => {
    // Pre-fill if the user came back from a failed attempt
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<FormState>;
        setForm((f) => ({ ...f, ...saved }));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const amountNum = Number(form.amount);
      if (!Number.isFinite(amountNum) || amountNum < 50) {
        throw new Error("Amount must be at least 50 DZD.");
      }

      // Persist customer details so /upload can show them in the success modal
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          SESSION_KEY,
          JSON.stringify({
            name: form.name,
            email: form.email,
            phone: form.phone,
            amount: amountNum,
            description: form.description,
            initiated_at: Date.now(),
          })
        );
      }

      const res = await fetch("/api/chargily/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          amount: amountNum,
          description: form.description,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.checkout_url) {
        throw new Error(data?.error || "Unable to start Edahabia payment.");
      }

      // Store the returned ids so we can surface them after the redirect back
      if (typeof window !== "undefined") {
        const prev = sessionStorage.getItem(SESSION_KEY);
        const merged = prev ? { ...JSON.parse(prev) } : {};
        merged.checkout_id = data.checkout_id;
        merged.customer_id = data.customer_id;
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(merged));
      }

      // Redirect the user to Chargily's hosted checkout page
      window.location.href = data.checkout_url as string;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-void text-ivory">
      {/* Header */}
      <div className="bg-void/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-white/55 hover:text-gold transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
          <span className="font-serif text-lg font-bold text-white">
            Abbassa<span className="text-gold">.</span>
          </span>
          <span className="text-[10px] font-semibold tracking-widest text-gold border border-gold/35 px-2 py-0.5 rounded-full uppercase">
            Edahabia
          </span>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 py-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="w-16 h-16 bg-gold/15 rounded-2xl flex items-center justify-center mx-auto mb-6 ring-1 ring-gold/25">
            <CreditCard size={30} className="text-gold" />
          </div>
          <p className="text-gold text-xs font-semibold tracking-[0.28em] uppercase mb-3">
            Chargily Pay · Edahabia
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3">
            Pay securely in DZD
          </h1>
          <p className="text-white/60 text-sm sm:text-base leading-relaxed">
            Enter your details below. You&apos;ll be redirected to Chargily&apos;s secure Edahabia
            checkout and returned here once payment is confirmed.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white/[0.04] rounded-2xl border border-white/10 p-6 sm:p-8 space-y-5"
        >
          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Full name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="John Doe"
              className="w-full rounded-xl border border-white/15 bg-void px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Email *</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="you@email.com"
              className="w-full rounded-xl border border-white/15 bg-void px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Phone *</label>
            <input
              required
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+213 ..."
              className="w-full rounded-xl border border-white/15 bg-void px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">
              Amount (DZD) *
            </label>
            <input
              required
              type="number"
              min={50}
              step={1}
              value={form.amount}
              onChange={(e) => update("amount", e.target.value)}
              placeholder="e.g. 5000"
              className="w-full rounded-xl border border-white/15 bg-void px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
            <p className="text-white/40 text-xs mt-1.5">
              Chargily minimum is 50 DZD. Your card will be charged in Algerian Dinars.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">
              Description (optional)
            </label>
            <input
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Book design package"
              className="w-full rounded-xl border border-white/15 bg-void px-4 py-3 text-sm text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold to-gold-deep px-8 py-4 text-sm font-semibold text-void shadow-lg shadow-gold/25 hover:opacity-95 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Redirecting to Chargily...
              </>
            ) : (
              <>
                <CreditCard size={18} /> Pay with EDAHABIA
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-white/45">
            <ShieldCheck size={12} className="text-gold" />
            Secured by Chargily Pay · PCI-DSS compliant
          </div>

          <p className="text-center text-[11px] text-white/40">
            By continuing, you agree to be charged by Chargily on behalf of Abbassa Malik Design.
          </p>
        </motion.form>

        <p className="text-center text-white/40 text-xs mt-6">
          Prefer a different method?{" "}
          <Link href="/#pricing" className="text-gold hover:text-gold-light transition-colors">
            See all options
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function EdahabiaCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-void flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutForm />
    </Suspense>
  );
}
// # NEW FEATURE END
