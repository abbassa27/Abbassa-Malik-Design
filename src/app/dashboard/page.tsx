import Link from "next/link";
import { ArrowRight, LayoutDashboard, Shield, Upload } from "lucide-react";

export const metadata = {
  title: "Dashboard · Abbass Malik",
  description: "Client uploads and admin order management.",
};

export default function DashboardHubPage() {
  return (
    <div className="min-h-screen bg-void text-white">
      <header className="border-b border-white/10 glass-nav">
        <div className="max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link href="/" className="font-serif text-lg font-semibold">
            Abbass<span className="text-gold">.</span>
          </Link>
          <span className="text-[10px] uppercase tracking-widest text-white/40">Portal</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-4">
          <LayoutDashboard className="w-8 h-8 text-gold" />
          <h1 className="font-serif text-3xl font-semibold">Dashboard</h1>
        </div>
        <p className="text-white/55 mb-12 max-w-xl">
          Choose your area: clients upload briefs and references after checkout; you (admin) review orders and upload final deliverables.
        </p>

        <div className="grid sm:grid-cols-2 gap-6">
          <Link
            href="/upload"
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-8 hover:border-gold/40 transition-colors"
          >
            <Upload className="w-10 h-10 text-gold mb-4" />
            <h2 className="font-serif text-xl font-semibold mb-2">Client · File upload</h2>
            <p className="text-white/50 text-sm mb-6 leading-relaxed">
              After PayPal, complete your book details and uploads here (same flow as /file-upload).
            </p>
            <span className="inline-flex items-center gap-2 text-gold text-sm font-semibold group-hover:gap-3 transition-all">
              Open upload <ArrowRight className="w-4 h-4" />
            </span>
          </Link>

          <Link
            href="/admin"
            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-8 hover:border-gold/40 transition-colors"
          >
            <Shield className="w-10 h-10 text-gold mb-4" />
            <h2 className="font-serif text-xl font-semibold mb-2">Admin · Orders</h2>
            <p className="text-white/50 text-sm mb-6 leading-relaxed">
              Sign in to review requests, client files, messages, and upload final e-books for download.
            </p>
            <span className="inline-flex items-center gap-2 text-gold text-sm font-semibold group-hover:gap-3 transition-all">
              Admin login <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </div>

        <p className="text-white/35 text-xs mt-12 max-w-lg leading-relaxed">
          Files are stored outside the web root and served only through signed download routes. Configure{" "}
          <code className="text-gold/70">DATABASE_URL</code>, <code className="text-gold/70">UPLOAD_DIR</code> on your host,
          and run Prisma migrations (including the <code className="text-gold/70">Lead</code> table for contact leads).
        </p>
      </div>
    </div>
  );
}
