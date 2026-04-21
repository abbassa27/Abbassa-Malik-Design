"use client";
import { motion } from "framer-motion";
import { Linkedin, ExternalLink } from "lucide-react";

const stats = [
  { value: "5+", label: "Years Experience" },
  { value: "200+", label: "Projects Delivered" },
  { value: "50+", label: "Happy Clients" },
  { value: "100%", label: "Satisfaction Rate" },
];

export default function About() {
  return (
    <section id="about" className="py-28 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
          >
            <p className="text-gold text-sm font-semibold tracking-[0.2em] uppercase mb-4">About Me</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-charcoal mb-6 leading-tight">
              A Designer Who <span className="text-gold italic">Tells Stories</span> Through Visuals
            </h2>
            <div className="space-y-4 text-muted leading-relaxed">
              <p>
                I'm <strong className="text-charcoal">Abbassa Malik</strong>, a dedicated Graphic Designer and Visual Storyteller
                based in Mostaganem, Algeria. I specialize in crafting compelling book covers and professional
                e-book layouts that resonate with audiences and convert browsers into readers.
              </p>
              <p>
                My work is driven by the belief that good design is not just about aesthetics — it's about
                solving problems and communicating clearly. Every cover I design tells a story before
                the reader opens the first page.
              </p>
              <p>
                I'm available for freelance projects and love collaborating with independent authors,
                publishers, and content creators around the world.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              <a
                href="https://www.upwork.com/freelancers/~01d05e8e2086ca8d4e"
                target="_blank" rel="noopener noreferrer"
                className="bg-gold text-white font-semibold px-6 py-3 rounded-full text-sm hover:bg-gold/90 transition-all flex items-center gap-2"
              >
                Hire Me on Upwork <ExternalLink size={14} />
              </a>
              <a
                href="https://www.linkedin.com/in/abbassamalik"
                target="_blank" rel="noopener noreferrer"
                className="border-2 border-[#0A66C2] text-[#0A66C2] font-semibold px-6 py-3 rounded-full text-sm hover:bg-[#0A66C2] hover:text-white transition-all flex items-center gap-2"
              >
                <Linkedin size={16} /> LinkedIn
              </a>
              <a
                href="https://www.behance.net/abbassamalik"
                target="_blank" rel="noopener noreferrer"
                className="border-2 border-[#1769FF] text-[#1769FF] font-semibold px-6 py-3 rounded-full text-sm hover:bg-[#1769FF] hover:text-white transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029H23.726zm-7.726-3h3.883c-.assumesopen 1.335-.668-1.183-1.9-1.183-1.31 0-1.895.836-1.983 1.183z"/></svg>
                Behance
              </a>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="grid grid-cols-2 gap-6"
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 + 0.3 }}
                className="bg-cream rounded-2xl p-8 text-center border border-gold-light/50"
              >
                <div className="font-serif text-4xl font-bold text-gold mb-2">{s.value}</div>
                <div className="text-sm text-muted font-medium">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
