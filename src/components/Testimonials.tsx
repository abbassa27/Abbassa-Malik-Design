"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import Reveal from "@/components/Reveal";

const items = [
  {
    quote:
      "Abbassa translated a messy manuscript into a clean, professional e-book. Communication was clear and delivery was on time.",
    name: "Indie Author",
    role: "Amazon KDP · Fiction",
  },
  {
    quote:
      "The cover exceeded my expectations — it looks premium on the store page and matches the tone of the series perfectly.",
    name: "Series writer",
    role: "Book cover + branding",
  },
  {
    quote:
      "Great experience from brief to final files. Revisions were handled patiently until every detail was right.",
    name: "Non-fiction publisher",
    role: "Cover + print layout",
  },
];

export default function Testimonials() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % items.length), 6500);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="testimonials" className="py-24 lg:py-32 bg-ink border-y border-white/5">
      <div className="max-w-4xl mx-auto px-6">
        <Reveal className="text-center mb-14">
          <p className="text-gold text-xs font-semibold tracking-[0.28em] uppercase mb-4">Social proof</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-white mb-4">Testimonials</h2>
          <p className="text-white/50 text-sm sm:text-base max-w-lg mx-auto">
            A few words from authors and collaborators — replace with your verified Upwork / Behance reviews anytime.
          </p>
        </Reveal>

        <Reveal>
          <div className="relative rounded-3xl border border-gold/20 bg-gradient-to-br from-white/[0.06] to-transparent px-6 sm:px-12 py-12 sm:py-14">
            <Quote className="absolute top-8 left-6 sm:left-10 w-10 h-10 text-gold/25" />
            <AnimatePresence mode="wait">
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -28 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 text-center"
              >
                <p className="font-serif text-lg sm:text-xl md:text-2xl text-white/90 leading-relaxed mb-8">
                  “{items[i].quote}”
                </p>
                <p className="text-gold font-medium text-sm">{items[i].name}</p>
                <p className="text-white/45 text-xs mt-1">{items[i].role}</p>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-center gap-4 mt-10">
              <button
                type="button"
                aria-label="Previous testimonial"
                onClick={() => setI((v) => (v - 1 + items.length) % items.length)}
                className="p-2.5 rounded-full border border-white/15 text-white hover:border-gold hover:text-gold transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex gap-2">
                {items.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Go to testimonial ${idx + 1}`}
                    onClick={() => setI(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === i ? "w-8 bg-gold" : "w-2 bg-white/25 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label="Next testimonial"
                onClick={() => setI((v) => (v + 1) % items.length)}
                className="p-2.5 rounded-full border border-white/15 text-white hover:border-gold hover:text-gold transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
