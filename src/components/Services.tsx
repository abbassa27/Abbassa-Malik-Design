"use client";
import { motion } from "framer-motion";
import { BookOpen, FileText, Palette } from "lucide-react";

const services = [
  {
    icon: Palette,
    title: "Book Cover Design",
    description:
      "Eye-catching, professional book covers that capture your story's essence and stand out in any marketplace — print or digital.",
    features: ["Custom illustration & typography", "Print-ready & digital formats", "Multiple revision rounds", "Genre-specific aesthetics"],
  },
  {
    icon: FileText,
    title: "E-Book Formatting",
    description:
      "Clean, reader-friendly e-book layouts optimized for Kindle, Apple Books, Kobo, and all major platforms.",
    features: ["EPUB & MOBI/KFX output", "Clickable TOC & metadata", "Font & layout optimization", "Platform-compliant files"],
  },
  {
    icon: BookOpen,
    title: "Print-to-Digital Conversion",
    description:
      "Transform your physical manuscript or PDF into a beautifully formatted digital publication ready for global distribution.",
    features: ["Accurate text extraction", "Preserved formatting integrity", "Image optimization", "Quality assurance checks"],
  },
];

export default function Services() {
  return (
    <section id="services" className="py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-gold text-sm font-semibold tracking-[0.2em] uppercase mb-4">What I Do</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-charcoal mb-5">Services</h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            Every book deserves a professional presentation. I deliver design and formatting solutions
            that help your work make the right first impression.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.6 }}
              className="card-hover bg-cream rounded-2xl p-8 border border-gold-light/50"
            >
              <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center mb-6">
                <s.icon size={22} className="text-gold" />
              </div>
              <h3 className="font-serif text-xl font-bold text-charcoal mb-3">{s.title}</h3>
              <p className="text-muted text-sm leading-relaxed mb-6">{s.description}</p>
              <ul className="space-y-2">
                {s.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-charcoal">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
