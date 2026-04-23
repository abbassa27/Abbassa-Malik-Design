"use client";

import { useState } from "react";
import { Mail, MapPin, ExternalLink, MessageCircle, Send, Loader2 } from "lucide-react";
import Reveal from "@/components/Reveal";

const platforms = [
  {
    name: "Upwork",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.546-1.405 0-2.543-1.14-2.543-2.546V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.452-5.439-5.452z" />
      </svg>
    ),
    label: "Hire on Upwork",
    href: "https://www.upwork.com/freelancers/~01d05e8e2086ca8d4e",
    color: "bg-[#14A800] hover:bg-[#118f00] text-white",
  },
  {
    name: "Behance",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H14.97c.13 1.2.836 1.679 1.895 1.679.709 0 1.101-.37 1.354-.9h3.507zm-3.585-3.1c-.087-.977-.616-1.645-1.672-1.645-.93 0-1.6.485-1.78 1.645h3.452zM7.823 10c1.584 0 2.507.835 2.507 2.186 0 .95-.427 1.652-1.189 2.009.997.35 1.603 1.108 1.603 2.266 0 1.827-1.412 2.767-3.358 2.767H1V10h6.823zm-.83 3.368c.646 0 1.062-.366 1.062-.949 0-.615-.359-.96-1.034-.96H3.845v1.909h3.148zm.197 3.488c.741 0 1.172-.392 1.172-1.044 0-.622-.381-1.006-1.164-1.006H3.845v2.05h3.345z" />
      </svg>
    ),
    label: "Behance",
    href: "https://www.behance.net/abbassamalik",
    color: "bg-[#1769ff] hover:bg-[#0d5ee8] text-white",
  },
  {
    name: "LinkedIn",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/abbassamalik",
    color: "bg-[#0A66C2] hover:bg-[#0957a5] text-white",
  },
];

const faqs = [
  {
    q: "How long does a book cover take?",
    a: "Typically 3–5 business days depending on package and queue. Rush options are available for premium timelines.",
  },
  {
    q: "What files will I receive?",
    a: "Print-ready PDF, high-resolution raster exports, and e-book formats (EPUB / KDP-compliant) as agreed in your package.",
  },
  {
    q: "Do you work with self-published authors?",
    a: "Yes — most of my clients are indie authors on KDP, IngramSpark, and similar platforms.",
  },
];

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
      setMessage("");
    } catch {
      setStatus("err");
    }
  }

  return (
    <section id="contact" className="py-24 lg:py-32 bg-ink border-t border-white/5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-4 py-1.5 mb-5">
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-gold text-[11px] font-semibold uppercase tracking-widest">Get in touch</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-white mb-5 leading-tight">
              Ready to bring your book to life?
            </h2>
            <p className="text-white/55 text-base sm:text-lg leading-relaxed mb-8">
              Tell me about your manuscript, timeline, and platforms. I reply within 24 hours — or message me
              directly on Upwork for escrow-protected work.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-white/65 text-sm">
                <div className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-gold" />
                </div>
                <span>Mostaganem, Algeria · Remote worldwide</span>
              </div>
              <div className="flex items-center gap-3 text-white/65 text-sm">
                <div className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-gold" />
                </div>
                <span>Available for freelance &amp; direct clients</span>
              </div>
              <a
                href="mailto:abbassamalik@gmail.com"
                className="flex items-center gap-3 text-white/65 text-sm hover:text-gold transition-colors"
              >
                <div className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-gold" />
                </div>
                <span>abbassamalik@gmail.com</span>
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
              {platforms.map((p) => (
                <a
                  key={p.name}
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2 font-semibold px-5 py-3.5 rounded-xl transition-all ${p.color}`}
                >
                  {p.icon}
                  {p.label}
                  <ExternalLink className="w-4 h-4 opacity-80" />
                </a>
              ))}
            </div>
          </Reveal>

          <div className="space-y-8">
            <Reveal delay={0.08}>
              <div
                id="contact-lead"
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 scroll-mt-28"
              >
                <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                  <Send className="w-4 h-4 text-gold" /> Booking details
                </h3>
                <p className="text-white/45 text-sm mb-6">
                  Ready to transform your book into a professional digital product?{" "}
                  <code className="text-gold/80 text-xs">Apply Now</code>.
                </p>
                <form onSubmit={onSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/55 mb-1.5">Name *</label>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-void px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-gold/40"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/55 mb-1.5">Email *</label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-void px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-gold/40"
                      placeholder="you@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/55 mb-1.5">Phone (optional)</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-void px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-gold/40"
                      placeholder="+213 …"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-white/55 mb-1.5">Message *</label>
                    <textarea
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-void px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-gold/40 resize-none"
                      placeholder="Book title, genre, deadline, package interest, Wise vs PayPal, etc."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gold py-3.5 text-sm font-semibold text-void hover:bg-gold-light transition-colors disabled:opacity-60"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Sending…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Send message
                      </>
                    )}
                  </button>
                  {status === "ok" && (
                    <p className="text-green-400 text-sm text-center">Thanks — I&apos;ll get back to you shortly.</p>
                  )}
                  {status === "err" && (
                    <p className="text-red-400 text-sm text-center">Something went wrong. Try email or Upwork.</p>
                  )}
                </form>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <h3 className="text-lg font-semibold text-white mb-4">FAQ</h3>
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div
                    key={faq.q}
                    className="rounded-xl border border-white/10 bg-white/[0.02] p-5 hover:border-gold/25 transition-colors"
                  >
                    <h4 className="text-sm font-semibold text-white mb-2">{faq.q}</h4>
                    <p className="text-white/50 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
