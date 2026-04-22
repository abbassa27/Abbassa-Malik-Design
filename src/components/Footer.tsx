import Link from "next/link";

const nav = [
  ["#services", "Services"],
  ["#process", "Process"],
  ["#portfolio", "Portfolio"],
  ["#testimonials", "Testimonials"],
  ["#pricing", "Pricing"],
  ["#contact", "Contact"],
];

export default function Footer() {
  return (
    <footer className="bg-void border-t border-white/10 py-14">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
          <div>
            <span className="font-serif text-2xl font-semibold text-white">
              Abbassa<span className="text-gold">.</span>
            </span>
            <p className="text-white/45 text-sm mt-2 max-w-xs">
              Book cover designer &amp; e-book formatting specialist · Remote worldwide
            </p>
            <a
              href="mailto:abbassamalik@gmail.com"
              className="inline-block mt-3 text-sm text-gold hover:text-gold-light transition-colors"
            >
              abbassamalik@gmail.com
            </a>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/50">
            {nav.map(([href, label]) => (
              <a key={href} href={href} className="hover:text-gold transition-colors">
                {label}
              </a>
            ))}
            <Link href="/dashboard" className="hover:text-gold transition-colors">
              Dashboard
            </Link>
          </div>

          <div className="flex gap-3">
            <a
              href="https://www.upwork.com/freelancers/~01d05e8e2086ca8d4e"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center hover:border-gold hover:text-gold text-white/80 transition-all"
              aria-label="Upwork"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.546-1.405 0-2.543-1.14-2.543-2.546V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.452-5.439-5.452z" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/in/abbassamalik"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center hover:border-gold hover:text-gold text-white/80 transition-all"
              aria-label="LinkedIn"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              href="mailto:abbassamalik@gmail.com"
              className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center hover:border-gold hover:text-gold text-white/80 transition-all"
              aria-label="Gmail"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </a>
            <a
              href="https://www.behance.net/abbassamalik"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center hover:border-gold hover:text-gold text-white/80 transition-all"
              aria-label="Behance"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 1.2.836 1.679 1.895 1.679.709 0 1.101-.37 1.354-.9h3.507zM7.823 10H1v11h6.823c1.584 0 2.507-.835 2.507-2.186 0-.95-.427-1.652-1.189-2.009.997-.35 1.603-1.108 1.603-2.266C9.744 11.723 8.332 10 6.386 10H1V10h6.823zm-.83 3.368H3.845v-1.909h3.148c.675 0 1.034.345 1.034.96 0 .583-.416.949-1.062.949zm.197 3.488H3.845V14.8h3.345c.783 0 1.164.384 1.164 1.006 0 .652-.431 1.044-1.172 1.044z" />
              </svg>
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-8 text-center text-white/35 text-xs">
          © {new Date().getFullYear()} Abbassa Malik. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
