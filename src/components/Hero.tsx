"use client";

import { motion } from "framer-motion";
import { PenLine, RefreshCw, Truck, ShieldCheck } from "lucide-react";

const badges = [
  { icon: ShieldCheck, text: "100% original designs" },
  { icon: RefreshCw, text: "Unlimited revisions (Premium)" },
  { icon: Truck, text: "Fast, agreed delivery" },
  { icon: PenLine, text: "Satisfaction-focused process" },
];

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center pt-24 pb-20 overflow-hidden bg-void"
    >
      <div className="pointer-events-none absolute inset-0 bg-radial-gold opacity-90" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)",
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gold text-xs sm:text-sm font-semibold tracking-[0.28em] uppercase mb-5"
          >
            Premium book design services
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-[1.08] mb-4"
          >
            Professional Book Cover Designer
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gold-light/90 text-sm sm:text-base font-medium tracking-[0.12em] uppercase mb-8"
          >
            E-book formatting specialist
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/65 text-base sm:text-lg leading-relaxed max-w-xl mb-10"
          >
            Your book deserves more than words — it deserves a design that sells. I transform manuscripts into
            visually stunning, market-ready books for Amazon KDP, Kindle, Kobo, and beyond. Available on{" "}
            <span className="text-gold/90">Upwork</span> and for direct projects worldwide.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row flex-wrap gap-4 mb-12"
          >
            <a
              href="https://www.upwork.com/freelancers/~01d05e8e2086ca8d4e"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold to-gold-deep px-8 py-4 text-sm font-semibold text-void shadow-lg shadow-gold/25 hover:opacity-95 transition-opacity"
            >
              <span className="text-lg leading-none">🚀</span>
              Hire me on Upwork
              
            </a>
            <a
              href="#portfolio"
              className="inline-flex items-center justify-center rounded-full border border-white/25 px-8 py-4 text-sm font-semibold text-white hover:border-gold hover:text-gold transition-colors"
            >
              View portfolio
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4 max-w-lg"
          >
            {badges.map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 sm:px-4"
              >
                <Icon className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                <span className="text-[11px] sm:text-xs text-white/70 leading-snug">{text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="relative flex justify-center lg:justify-end"
        >
          <div className="relative w-full max-w-md aspect-[4/5] rounded-2xl border border-gold/25 bg-gradient-to-b from-white/[0.07] to-transparent p-1 shadow-2xl shadow-black/60">
            <div className="absolute -inset-4 rounded-3xl bg-gold/5 blur-3xl -z-10" />
            <div className="h-full w-full rounded-xl bg-ink/80 flex flex-col items-center justify-center text-center px-8 py-12 border border-white/5">
              <p className="text-gold text-xs tracking-[0.25em] uppercase mb-4">Featured direction</p>
              <p className="font-serif text-2xl sm:text-3xl text-white mb-2 leading-tight">
                The Mindset of a Champion
              </p>
              <p className="text-white/45 text-sm mb-8">Premium cover mockup · KDP-ready</p>
              <img
  src="/my-cover.png"
  className="w-32 h-44 object-cover rounded-md border border-gold/40"
/>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
