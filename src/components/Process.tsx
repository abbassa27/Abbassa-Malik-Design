"use client";

import Reveal from "@/components/Reveal";
import { MessageSquare, Palette, FileCheck, Rocket } from "lucide-react";

const steps = [
  {
    n: "01",
    title: "Discovery",
    body: "You share the manuscript, genre, references, and deadlines. We align on scope and package.",
    icon: MessageSquare,
  },
  {
    n: "02",
    title: "Concept & design",
    body: "Cover concepts and/or interior structure — refined with clear revision rounds until it feels right.",
    icon: Palette,
  },
  {
    n: "03",
    title: "Production files",
    body: "Print-ready PDFs, high-res artwork, EPUB/KDP-compliant e-books, and organized handoff.",
    icon: FileCheck,
  },
  {
    n: "04",
    title: "Launch support",
    body: "Final checks for storefronts and quick tweaks so you can publish with confidence.",
    icon: Rocket,
  },
];

export default function Process() {
  return (
    <section id="process" className="py-24 lg:py-32 bg-void relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gold/[0.04] to-transparent pointer-events-none" />
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <Reveal className="text-center mb-16 max-w-2xl mx-auto">
          <p className="text-gold text-xs font-semibold tracking-[0.28em] uppercase mb-4">How we work</p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-5">
            Process
          </h2>
          <p className="text-white/55 text-base sm:text-lg">
            A structured workflow so you always know what happens next — whether we collaborate on Upwork or directly.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.07}>
              <div className="relative h-full rounded-2xl border border-white/10 bg-ink/80 p-7 pt-10">
                <span className="absolute top-5 right-5 text-[10px] font-bold tracking-widest text-gold/50">
                  {s.n}
                </span>
                <s.icon className="w-6 h-6 text-gold mb-4" strokeWidth={1.5} />
                <h3 className="font-serif text-lg font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-sm text-white/55 leading-relaxed">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
