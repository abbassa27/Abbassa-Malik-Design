import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="font-serif text-2xl font-bold">Abbassa<span className="text-gold">.</span></span>
            <p className="text-white/50 text-sm mt-1">Book Cover Designer & E-Book Specialist</p>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-white/60">
            {[
              ["#services","Services"],
              ["#portfolio","Portfolio"],
              ["#about","About"],
              ["#pricing","Pricing"],
              ["#contact","Contact"],
            ].map(([href,label]) => (
              <a key={href} href={href} className="hover:text-gold transition-colors">{label}</a>
            ))}
          </div>

          <div className="flex gap-4">
            <a href="https://www.upwork.com/freelancers/~01d05e8e2086ca8d4e" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:border-gold hover:text-gold transition-all">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.546-1.405 0-2.543-1.14-2.543-2.546V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.452-5.439-5.452z"/>
              </svg>
            </a>
            <a href="https://www.linkedin.com/in/abbassamalik" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:border-gold hover:text-gold transition-all">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            <a href="https://www.behance.net/abbassamalik" target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:border-gold hover:text-gold transition-all">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029H23.726zm-7.726-3h3.883c-.065-1.376-.668-1.957-1.878-1.957-1.16 0-1.882.55-2.005 1.957zM0 5h8.5c2.009 0 3.5 1.142 3.5 3.5S8.509 12 8.5 12H0V5zm2 5.5h5.5c.828 0 1.5-.672 1.5-1.5S8.328 7.5 7.5 7.5H2v3zm0 3.5h6c.828 0 1.5.672 1.5 1.5S8.828 17.5 8 17.5H2V14z"/>
              </svg>
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 text-center text-white/40 text-xs">
          © {new Date().getFullYear()} Abbassa Malik. All rights reserved. · Mostaganem, Algeria
        </div>
      </div>
    </footer>
  );
}
