"use client";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
// NEW FEATURE START
import { useState } from "react";
import dynamic from "next/dynamic";
import WiseBankModal from "@/components/WiseBankModal";

const PayPalButton = dynamic(() => import("@/components/PayPalButton"), {
  ssr: false,
});
// NEW FEATURE END

const plans = [
  {
    name: "Basic",
    price: "$49",
    // NEW FEATURE START
    amount: "49.00",
    // NEW FEATURE END
    description: "Perfect for simple projects and tight budgets",
    features: [
      "1 Book Cover Design",
      "2 Concept Options",
      "3 Revision Rounds",
      "Print & Digital Files",
      "7-Day Delivery",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "$149",
    // NEW FEATURE START
    amount: "149.00",
    // NEW FEATURE END
    description: "Best for authors who want a complete package",
    features: [
      "Book Cover + E-Book Formatting",
      "4 Concept Options",
      "Unlimited Revisions",
      "All File Formats (EPUB, PDF, KFX)",
      "5-Day Priority Delivery",
      "Source Files Included",
    ],
    cta: "Most Popular",
    highlighted: true,
  },
  {
    name: "Premium",
    price: "$299",
    // NEW FEATURE START
    amount: "299.00",
    // NEW FEATURE END
    description: "Full-service solution for publishers & series",
    features: [
      "Full Series Cover Design (up to 3)",
      "E-Book + Print Interior Formatting",
      "Unlimited Revisions",
      "Metadata & SEO Optimization",
      "3-Day Express Delivery",
      "Dedicated Support",
      "Source Files Included",
    ],
    cta: "Contact Me",
    highlighted: false,
  },
];

// NEW FEATURE START
type PaymentMethod = "paypal" | "wise" | null;

function PlanCard({
  plan,
  index,
}: {
  plan: (typeof plans)[0];
  index: number;
}) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [wiseOpen, setWiseOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.15, duration: 0.6 }}
        className={`relative rounded-2xl p-8 card-hover flex flex-col ${
          plan.highlighted
            ? "bg-charcoal text-white shadow-2xl scale-105"
            : "bg-white border border-gold-light/60"
        }`}
      >
        {plan.highlighted && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gold text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wide uppercase">
            Best Value
          </div>
        )}
        <div
          className={`text-sm font-semibold tracking-wider uppercase mb-2 ${
            plan.highlighted ? "text-gold" : "text-gold"
          }`}
        >
          {plan.name}
        </div>
        <div
          className={`font-serif text-5xl font-bold mb-2 ${
            plan.highlighted ? "text-white" : "text-charcoal"
          }`}
        >
          {plan.price}
        </div>
        <p
          className={`text-sm mb-8 ${
            plan.highlighted ? "text-white/60" : "text-muted"
          }`}
        >
          {plan.description}
        </p>
        <ul className="space-y-3 mb-8 flex-1">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-3 text-sm">
              <Check
                size={16}
                className={`mt-0.5 flex-shrink-0 ${
                  plan.highlighted ? "text-gold" : "text-gold"
                }`}
              />
              <span className={plan.highlighted ? "text-white/85" : "text-charcoal"}>
                {f}
              </span>
            </li>
          ))}
        </ul>

        {/* NEW FEATURE START — Payment method selector */}
        {paymentMethod === null ? (
          <div className="space-y-3 mt-auto">
            <p
              className={`text-xs font-semibold text-center mb-3 uppercase tracking-wider ${
                plan.highlighted ? "text-white/50" : "text-muted"
              }`}
            >
              Choose Payment Method
            </p>
            {/* PayPal Button */}
            <button
              onClick={() => setPaymentMethod("paypal")}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm transition-all ${
                plan.highlighted
                  ? "bg-[#FFC439] text-[#003087] hover:bg-[#FFD070]"
                  : "bg-[#FFC439] text-[#003087] hover:bg-[#FFD070]"
              }`}
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z" />
              </svg>
              Pay with PayPal
            </button>
            {/* Wise Button */}
            <button
              onClick={() => setWiseOpen(true)}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-full font-semibold text-sm transition-all border-2 ${
                plan.highlighted
                  ? "border-[#9FE870] text-[#9FE870] hover:bg-[#9FE870] hover:text-charcoal"
                  : "border-[#9FE870] text-charcoal hover:bg-[#9FE870]"
              }`}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M12.5 2L2 22h20L12.5 2zm0 4.5l6.5 13h-13l6.5-13z" />
              </svg>
              Bank Transfer via Wise
            </button>
            {/* Upwork fallback */}
            <a
              href="https://www.upwork.com/freelancers/~01d05e8e2086ca8d4e"
              target="_blank"
              rel="noopener noreferrer"
              className={`block text-center font-semibold py-3 rounded-full transition-all text-sm ${
                plan.highlighted
                  ? "bg-gold text-white hover:bg-gold/90"
                  : "border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-white"
              }`}
            >
              {plan.cta} on Upwork
            </a>
          </div>
        ) : (
          <div className="mt-auto space-y-3">
            <div className="bg-gold/10 rounded-xl p-3 text-xs text-charcoal text-center">
              💳 Paying <strong>{plan.price}</strong> for <strong>{plan.name}</strong> via PayPal
            </div>
            <PayPalButton amount={plan.amount} planName={plan.name} />
            <button
              onClick={() => setPaymentMethod(null)}
              className="w-full text-xs text-muted hover:text-charcoal transition-colors py-1"
            >
              ← Back to payment options
            </button>
          </div>
        )}
        {/* NEW FEATURE END */}
      </motion.div>

      {/* NEW FEATURE START — Wise Modal */}
      <WiseBankModal
        isOpen={wiseOpen}
        onClose={() => setWiseOpen(false)}
        planName={plan.name}
        amount={plan.amount}
      />
      {/* NEW FEATURE END */}
    </>
  );
}

export default function Pricing() {
  return (
    <section id="pricing" className="py-28 bg-cream">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-gold text-sm font-semibold tracking-[0.2em] uppercase mb-4">
            Investment
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-charcoal mb-5">
            Pricing
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto">
            Transparent, value-driven pricing with no hidden fees. All packages include
            revisions until you&apos;re 100% satisfied.
          </p>
          {/* NEW FEATURE START */}
          <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
            <span className="flex items-center gap-2 text-sm text-muted">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#FFC439]" fill="currentColor">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z" />
              </svg>
              PayPal Secure Checkout
            </span>
            <span className="flex items-center gap-2 text-sm text-muted">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#9FE870]" fill="currentColor">
                <path d="M12.5 2L2 22h20L12.5 2zm0 4.5l6.5 13h-13l6.5-13z" />
              </svg>
              Bank Transfer via Wise
            </span>
            <span className="flex items-center gap-2 text-sm text-muted">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#14A800]" fill="currentColor">
                <path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.546-1.405 0-2.543-1.14-2.543-2.546V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.452-5.439-5.452z"/>
              </svg>
              Upwork Protected
            </span>
          </div>
          {/* NEW FEATURE END */}
        </motion.div>

        {/* NEW FEATURE START — use PlanCard component */}
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} index={i} />
          ))}
        </div>
        {/* NEW FEATURE END */}

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-muted text-sm mt-10"
        >
          Need a custom package?{" "}
          <a
            href="https://www.upwork.com/freelancers/~01d05e8e2086ca8d4e"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold font-semibold hover:underline"
          >
            Get in touch on Upwork
          </a>{" "}
          for a tailored quote.
        </motion.p>
      </div>
    </section>
  );
}
