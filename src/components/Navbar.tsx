"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const links = [
  { href: "#services", label: "Services" },
  { href: "#portfolio", label: "Portfolio" },
  { href: "#about", label: "About" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-cream/95 backdrop-blur-sm shadow-sm" : "bg-transparent"}`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-serif text-xl font-bold text-charcoal tracking-tight">
          Abbassa<span className="text-gold">.</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-muted hover:text-charcoal transition-colors font-medium tracking-wide">
              {l.label}
            </a>
          ))}
          <a
            href="https://www.upwork.com/freelancers/~01d05e8e2086ca8d4e"
            target="_blank" rel="noopener noreferrer"
            className="bg-gold text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gold/90 transition-colors"
          >
            Hire Me on Upwork
          </a>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-cream border-t border-gold-light px-6 py-6 flex flex-col gap-5">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="text-sm text-charcoal font-medium tracking-wide">{l.label}</a>
          ))}
          <a href="https://www.upwork.com/freelancers/~01d05e8e2086ca8d4e"
            target="_blank" rel="noopener noreferrer"
            className="bg-gold text-white text-sm font-semibold px-5 py-2.5 rounded-full text-center hover:bg-gold/90 transition-colors">
            Hire Me on Upwork
          </a>
        </div>
      )}
    </nav>
  );
}
