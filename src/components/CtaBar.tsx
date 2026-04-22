"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Rocket } from "lucide-react";

export default function CtaBar() {
  return (
    <section className="py-16 bg-gradient-to-r from-gold-deep/40 via-void to-gold-deep/30 border-y border-gold/20">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="flex gap-4 items-start"
        >
          <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center shrink-0 border border-gold/30">
            <Rocket className="w-6 h-6 text-gold" />
          </div>
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl text-white font-semibold mb-1">
              Ready to bring your book to life?
            </h2>
            <p className="text-white/55 text-sm sm:text-base max-w-xl">
              Start with a clear brief and reference links — I&apos;ll confirm scope, timeline, and the best package for your launch.
            </p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="shrink-0"
        >
          <Link
            href="/#contact-lead"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-4 text-sm font-bold text-void hover:bg-gold-light transition-colors shadow-lg shadow-gold/20"
          >
            Start your project
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
