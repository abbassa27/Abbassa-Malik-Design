"use client";

import { Linkedin, ExternalLink } from "lucide-react";
import Reveal from "@/components/Reveal";

const stats = [
  { value: "5+", label: "Years experience" },
  { value: "150+", label: "Books & layouts" },
  { value: "100+", label: "Happy clients" },
  { value: "24h", label: "Typical reply time" },
];

export default function About() {
  return (
    <section id="about" className="py-24 lg:py-32 bg-void border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-14 lg:gap-20 items-start">
          <Reveal>
            <p className="text-gold text-xs font-semibold tracking-[0.28em] uppercase mb-4">About</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-6 leading-tight">
              Designs that tell stories and{" "}
              <span className="text-gold italic">build brands</span>
            </h2>
            <div className="space-y-4 text-white/60 leading-relaxed text-sm sm:text-base">
              <p>
                I&apos;m <strong className="text-white">Abbass Malik</strong>, a graphic designer and visual storyteller
                in Mostaganem, Algeria. I help authors turn ideas into polished, market-ready books — from covers that
                stop the scroll to e-book interiors that feel effortless on every device.
              </p>
              <p>
                Whether you publish on Amazon KDP, Kobo, or Barnes &amp; Noble, I focus on reader-first typography,
                clean structure, and detail-oriented delivery so your title can compete with the best in its category.
              </p>
              <p>
                Good design is not only aesthetics — it clarifies your message and earns trust before page one. I work
                remotely with authors and publishers worldwide.
              </p>
            </div>

            <p className="mt-8 font-serif text-2xl text-gold">Abbass Malik</p>
            <p className="text-white/45 text-sm mb-8">Book cover designer · E-book formatting specialist</p>

            <div className="flex flex-wrap gap-3">
              <a
                href="https://www.upwork.com/freelancers/~01d05e8e2086ca8d4e"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-void hover:bg-gold-light transition-colors"
              >
                Hire me on Upwork <ExternalLink size={14} />
              </a>
              <a
                href="https://www.linkedin.com/in/abbassamalik"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-gold hover:text-gold transition-colors"
              >
                <Linkedin size={16} /> LinkedIn
              </a>
              <a
                href="https://www.behance.net/abbassamalik"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white hover:border-gold hover:text-gold transition-colors"
              >
                Behance <ExternalLink size={14} />
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="rounded-2xl border border-gold/25 bg-white/[0.03] p-8 lg:p-10">
              <p className="text-gold text-xs font-semibold tracking-[0.2em] uppercase mb-6">At a glance</p>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-xl border border-white/10 bg-void/60 px-4 py-5 text-center"
                  >
                    <div className="font-serif text-3xl font-semibold text-gold mb-1">{s.value}</div>
                    <div className="text-[11px] sm:text-xs text-white/50 font-medium leading-snug">{s.label}</div>
                  </div>
                ))}
              </div>
              <p className="text-white/45 text-xs mt-8 leading-relaxed">
                Worked with authors publishing on: Amazon KDP · Kindle · Kobo · Barnes &amp; Noble
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
