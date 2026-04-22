"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const links = [
  { href: "#home", label: "Home" },
  { href: "#services", label: "Services" },
  { href: "#process", label: "Process" },
  { href: "#portfolio", label: "Portfolio" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-[background,box-shadow,border-color] duration-300 border-b ${
        scrolled ? "glass-nav border-white/10 shadow-lg shadow-black/40" : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        <Link
          href="/#home"
          className="flex items-center gap-2 font-serif text-xl font-semibold tracking-tight text-white shrink-0"
          aria-label="Abbassa Malik home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gold to-gold-deep text-void text-sm font-bold ring-1 ring-gold/40">
            AM
          </span>
          <span className="hidden sm:inline text-white/90">
            Abbassa<span className="text-gold">.</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center justify-center flex-1 gap-7">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[11px] font-semibold tracking-[0.18em] text-white/70 hover:text-gold transition-colors uppercase"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:block shrink-0">
          <a
            href="https://www.upwork.com/freelancers/~01d05e8e2086ca8d4e"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full border border-gold/50 px-5 py-2 text-[11px] font-semibold tracking-widest text-gold hover:bg-gold/10 transition-colors uppercase"
          >
            Work With Me
          </a>
        </div>

        <button
          type="button"
          className="lg:hidden p-2 rounded-lg text-white border border-white/15 hover:border-gold/40 transition-colors"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden glass-nav border-t border-white/10 px-5 py-6 flex flex-col gap-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium tracking-wide text-white/85 hover:text-gold"
            >
              {l.label}
            </a>
          ))}
          <a
            href="https://www.upwork.com/freelancers/~01d05e8e2086ca8d4e"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex justify-center rounded-full border border-gold px-5 py-3 text-sm font-semibold text-gold hover:bg-gold/10"
            onClick={() => setOpen(false)}
          >
            Hire me on Upwork
          </a>
        </div>
      )}
    </nav>
  );
}
