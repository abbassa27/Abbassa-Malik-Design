"use client";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cream">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, #1A1A1A 1px, transparent 0)",
        backgroundSize: "40px 40px"
      }} />

      {/* Decorative gold line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="text-gold text-sm font-semibold tracking-[0.25em] uppercase mb-6"
        >
          Book Cover Designer & E-Book Specialist
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="font-serif text-5xl md:text-7xl font-bold text-charcoal leading-tight mb-6"
        >
          Transforming Ideas into{" "}
          <span className="text-gold italic">Stunning</span>{" "}
          Visual Narratives
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="text-muted text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-12"
        >
          I craft compelling book covers and polished e-books that captivate readers
          and elevate your work. Based in Algeria, serving clients worldwide.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <a
            href="https://www.upwork.com/freelancers/~01d05e8e2086ca8d4e"
            target="_blank" rel="noopener noreferrer"
            className="bg-gold text-white font-semibold px-8 py-4 rounded-full text-base hover:bg-gold/90 transition-all hover:shadow-lg hover:shadow-gold/25 flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.546-1.405 0-2.543-1.14-2.543-2.546V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.452-5.439-5.452z"/>
            </svg>
            Hire Me on Upwork
          </a>
          <a
            href="#portfolio"
            className="text-charcoal font-semibold px-8 py-4 rounded-full border-2 border-charcoal/20 hover:border-gold hover:text-gold transition-all text-base"
          >
            View Portfolio
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }}
      >
        <a href="#services"><ArrowDown size={20} className="text-muted" /></a>
      </motion.div>
    </section>
  );
}
