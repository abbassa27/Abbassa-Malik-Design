"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";
import WiseBankModal from "@/components/WiseBankModal";
import Reveal from "@/components/Reveal";

const PayPalButton = dynamic(() => import("@/components/PayPalButton"), { ssr: false });

const plans = [
  {
    name: "Starter",
    priceDisplay: "$40 – $70",
    amount: "55.00",
    description: "Basic cover, simple formatting, one revision round — ideal for first-time publishers.",
    features: [
      "Basic book cover",
      "Simple Kindle / EPUB formatting",
      "1 revision round",
      "Delivery: 3–5 days",
    ],
    cta: "Start",
    highlighted: false,
  },
  {
    name: "Professional",
    priceDisplay: "$90 – $150",
    amount: "120.00",
    description: "Custom cover plus advanced formatting — the sweet spot for serious indie releases.",
    features: [
      "Custom cover design",
      "Advanced Kindle / EPUB layout",
      "2–3 revision rounds",
      "Delivery: 2–4 days",
    ],
    cta: "Most popular",
    highlighted: true,
  },
  {
    name: "Premium",
    priceDisplay: "$180 – $300",
    amount: "240.00",
    description: "High-end cover, full formatting stack, priority timeline — for launches that must look flawless.",
    features: [
      "High-end cover art direction",
      "Full Kindle + print interior where needed",
      "Priority delivery",
      "Unlimited revisions within scope",
    ],
    cta: "Go premium",
    highlighted: false,
  },
];

type PaymentMethod = "paypal" | null;

function PlanCard({ plan, index }: { plan: (typeof plans)[0]; index: number }) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [wiseOpen, setWiseOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.12, duration: 0.6 }}
        className={`relative rounded-2xl p-8 card-hover flex flex-col border ${
          plan.highlighted
            ? "bg-gradient-to-b from-white/[0.1] to-white/[0.02] border-gold/40 shadow-xl shadow-black/40 lg:scale-[1.03]"
            : "bg-white/[0.03] border-white/10"
        }`}
      >
        {plan.highlighted && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-void text-[10px] font-bold px-4 py-1.5 rounded-full tracking-widest uppercase">
            Best value
          </div>
        )}
        <div className="text-xs font-semibold tracking-[0.2em] uppercase mb-2 text-gold">{plan.name}</div>
        <div className="font-serif text-4xl sm:text-5xl font-semibold text-white mb-1">{plan.priceDisplay}</div>
        <p className="text-[11px] text-white/40 mb-1">PayPal checkout uses a fixed package price (mid-range).</p>
        <p className="text-sm text-white/55 mb-8 flex-1">{plan.description}</p>
        <ul className="space-y-3 mb-8">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm text-white/75">
              <Check size={16} className="mt-0.5 flex-shrink-0 text-gold" />
              <span>{f}</span>
            </li>
          ))}
        </ul>

        {paymentMethod === null ? (
          <div className="space-y-3 mt-auto">
            <p className="text-[10px] font-semibold text-center text-white/40 uppercase tracking-widest mb-1">
              Payment options
            </p>
            <button
              type="button"
              onClick={() => setPaymentMethod("paypal")}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm bg-[#FFC439] text-[#003087] hover:bg-[#FFD070] transition-all"
            >
              Pay with PayPal
            </button>
            <button
              type="button"
              onClick={() => setWiseOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm border-2 border-[#9FE870] text-[#9FE870] hover:bg-[#9FE870]/10 transition-all"
            >
              Direct bank transfer (Wise)
            </button>
            <a
              href="#contact-lead"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm border border-white/20 text-white/90 hover:border-gold hover:text-gold transition-all text-center"
            >
              Pay via Wise — contact form
            </a>
            <a
              href="https://www.upwork.com/freelancers/~01d05e8e2086ca8d4e"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center font-semibold py-3 rounded-full text-sm bg-gold/15 text-gold hover:bg-gold/25 transition-all"
            >
              Hire on Upwork (escrow)
            </a>
          </div>
        ) : (
          <div className="mt-auto space-y-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.05] p-3 text-xs text-white/80 text-center">
              Paying <strong className="text-gold">${plan.amount}</strong> for{" "}
              <strong>{plan.name}</strong> — via PayPal — then you&apos;ll be sent to file upload.
            </div>
            <PayPalButton amount={plan.amount} planName={plan.name} />
            <button
              type="button"
              onClick={() => setPaymentMethod(null)}
              className="w-full text-xs text-white/45 hover:text-gold transition-colors py-1"
            >
              ← Back to payment options
            </button>
          </div>
        )}
      </motion.div>

      <WiseBankModal
        isOpen={wiseOpen}
        onClose={() => setWiseOpen(false)}
        planName={plan.name}
        amount={plan.amount}
      />
    </>
  );
}

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 lg:py-32 bg-void border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal className="text-center mb-14 lg:mb-16">
          <p className="text-gold text-xs font-semibold tracking-[0.28em] uppercase mb-4">Investment</p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-5">Pricing</h2>
          <p className="text-white/55 text-base sm:text-lg max-w-2xl mx-auto">
            Ranges reflect typical project scope from my public brief. Final quotes may vary with manuscript length
            and complexity. PayPal charges a fixed mid-range amount for checkout; bank transfer shows my Wise details.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-white/45">
            <span className="flex items-center gap-2">
              <span className="text-[#FFC439]">●</span> PayPal → then /file-upload
            </span>
            <span className="flex items-center gap-2">
              <span className="text-[#9FE870]">●</span> Wise IBAN modal
            </span>
            <span className="flex items-center gap-2">
              <span className="text-gold">●</span> Upwork escrow
            </span>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} index={i} />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-white/40 text-sm mt-10"
        >
          Need a custom scope?{" "}
          <a
            href="https://www.upwork.com/freelancers/~01d05e8e2086ca8d4e"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold font-medium hover:underline"
          >
            Message me on Upwork
          </a>{" "}
          or use the contact form.
        </motion.p>
      </div>
    </section>
  );
}
