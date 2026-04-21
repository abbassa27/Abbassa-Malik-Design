import { Mail, MapPin, ExternalLink, MessageCircle } from "lucide-react";

const platforms = [
  {
    name: "Upwork",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.546-1.405 0-2.543-1.14-2.543-2.546V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.439-5.439-5.439z" />
      </svg>
    ),
    label: "Hire on Upwork",
    href: "https://www.upwork.com/freelancers/~01d05e8e2086ca8d4e",
    color: "bg-[#6fda44] hover:bg-[#5bc936] text-white",
    primary: true,
  },
  {
    name: "Behance",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H14.97c.13 1.2.836 1.679 1.895 1.679.709 0 1.101-.37 1.354-.9h3.507zm-3.585-3.1c-.087-.977-.616-1.645-1.672-1.645-.93 0-1.6.485-1.78 1.645h3.452zM7.823 10c1.584 0 2.507.835 2.507 2.186 0 .95-.427 1.652-1.189 2.009.997.35 1.603 1.108 1.603 2.266 0 1.827-1.412 2.767-3.358 2.767H1V10h6.823zm-.83 3.368c.646 0 1.062-.366 1.062-.949 0-.615-.359-.96-1.034-.96H3.845v1.909h3.148zm.197 3.488c.741 0 1.172-.392 1.172-1.044 0-.622-.381-1.006-1.164-1.006H3.845v2.05h3.345z" />
      </svg>
    ),
    label: "View Behance",
    href: "https://www.behance.net/abbassamalik",
    color: "bg-[#1769ff] hover:bg-[#0d5ee8] text-white",
    primary: false,
  },
  // # NEW FEATURE START - LinkedIn contact link
  {
    name: "LinkedIn",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    label: "Connect on LinkedIn",
    href: "https://www.linkedin.com/in/abbassamalik",
    color: "bg-[#0077B5] hover:bg-[#006396] text-white",
    primary: false,
  },
  // # NEW FEATURE END - LinkedIn contact link
];

const faqs = [
  {
    q: "How long does a book cover design take?",
    a: "Standard delivery is 3–5 business days. Rush 48-hour delivery is available on Publisher plan.",
  },
  {
    q: "What file formats will I receive?",
    a: "You'll receive print-ready PDF, high-res PNG/JPG, EPUB thumbnail, and source files (AI/PSD/INDD).",
  },
  {
    q: "Do you work with self-published authors?",
    a: "Absolutely! Most of my clients are indie authors. I'm experienced with KDP, IngramSpark, Smashwords, and Draft2Digital.",
  },
  {
    q: "Can you match the style of an existing book series?",
    a: "Yes — just share the existing books and I'll ensure visual consistency across all titles.",
  },
];

export default function Contact() {
  return (
    <section id="contact" className="bg-[#07091a] py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest">Get in Touch</span>
            </div>
            <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-5 leading-tight">
              Let's Build Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                Next Bestseller
              </span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Ready to transform your manuscript into a stunning digital
              experience? I'm currently available for new projects and would love
              to hear about your book.
            </p>

            {/* Info */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-amber-400" />
                </div>
                <span>Mostaganem, Algeria · Remote Worldwide</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-amber-400" />
                </div>
                <span>Available for freelance &amp; full-time</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-amber-400" />
                </div>
                <span>Responds within 24 hours</span>
              </div>
            </div>

            {/* Platform buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {platforms.map((p) => (
                <a
                  key={p.name}
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-2.5 font-bold px-6 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl ${p.color}`}
                >
                  {p.icon}
                  {p.label}
                  <ExternalLink className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Right: FAQ */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">💬</span> Frequently Asked Questions
            </h3>
            <div className="space-y-5">
              {faqs.map((faq) => (
                <div
                  key={faq.q}
                  className="bg-white/[0.03] border border-white/[0.07] hover:border-amber-500/20 rounded-2xl p-6 transition-all duration-200 group"
                >
                  <h4 className="text-white font-semibold mb-2 text-sm group-hover:text-amber-400 transition-colors">
                    {faq.q}
                  </h4>
                  <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>

            {/* Final push CTA */}
            <div className="mt-8 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6">
              <p className="text-white font-semibold mb-1">Still have questions?</p>
              <p className="text-slate-400 text-sm mb-4">
                Send me a message directly on Upwork — I typically respond within a few hours.
              </p>
              <a
                href="https://www.upwork.com/freelancers/~01d05e8e2086ca8d4e"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold text-sm transition-colors"
              >
                Message me on Upwork →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
