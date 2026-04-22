"use client";

import { PenLine, BookOpen, FileStack, Sparkles } from "lucide-react";
import Reveal from "@/components/Reveal";

const services = [
  {
    icon: PenLine,
    title: "Book Cover Design",
    description:
      "Custom covers that read at thumbnail size and feel premium in print — aligned with genre expectations and your voice.",
  },
  {
    icon: BookOpen,
    title: "E-book Formatting",
    description:
      "Clean Kindle / EPUB typography, hierarchy, and navigation so your digital edition feels effortless to read.",
  },
  {
    icon: FileStack,
    title: "Print Layout Design",
    description:
      "Interior layouts and print-ready files when you need a cohesive package beyond the cover alone.",
  },
  {
    icon: Sparkles,
    title: "Branding for Authors",
    description:
      "Consistent visuals across series, social assets, and storefront presence so readers recognize your brand.",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 lg:py-32 bg-ink border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <Reveal className="text-center mb-16 lg:mb-20 max-w-2xl mx-auto">
          <p className="text-gold text-xs font-semibold tracking-[0.28em] uppercase mb-4">What I offer</p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-5">
            Services
          </h2>
          <p className="text-white/55 text-base sm:text-lg leading-relaxed">
            From eye-catching covers to perfectly formatted e-books — built for Amazon KDP, IngramSpark, and modern reading apps.
          </p>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08}>
              <div className="card-hover h-full rounded-2xl border border-white/10 bg-white/[0.03] p-7 flex flex-col">
                <div className="w-11 h-11 rounded-xl border border-gold/30 flex items-center justify-center mb-5">
                  <s.icon className="w-5 h-5 text-gold" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-lg font-semibold text-white mb-3">{s.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed flex-1">{s.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
