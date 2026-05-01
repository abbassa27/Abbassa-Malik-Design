import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <main className="bg-void min-h-screen text-white">
      <Navbar />

      <section className="max-w-4xl mx-auto px-6 py-24">

        <h1 className="font-serif text-4xl md:text-5xl font-semibold mb-6">
          Privacy Policy
        </h1>

        <p className="text-white/40 text-sm mb-12">
          Last updated: {new Date().getFullYear()}
        </p>

        <div className="space-y-10 text-white/80 text-lg leading-relaxed">

          <p>
            This Privacy Policy describes how your personal information is collected,
            used, and protected when you visit this website.
          </p>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">
              Information We Collect
            </h2>
            <p>
              We may collect personal data such as your name, email address,
              and usage data.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">
              How We Use Your Information
            </h2>
            <p>
              We use your data to improve services and user experience.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">
              Cookies & Tracking
            </h2>
            <p>
              We use cookies to analyze usage and optimize performance.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">
              Third-Party Services
            </h2>
            <p>
              We may use third-party tools like analytics providers.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">
              Data Protection
            </h2>
            <p>
              We take reasonable measures to protect your personal data.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-3">
              Your Rights
            </h2>
            <p>
              You can request access or deletion of your data.
            </p>
          </div>

        </div>

      </section>

      <Footer />
    </main>
  );
}