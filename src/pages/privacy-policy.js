import Head from "next/head";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | Abbassa Malik</title>
        <meta
          name="description"
          content="Privacy Policy explaining how Abbassa Malik collects and uses data."
        />
      </Head>

      <Navbar />

      <main className="bg-void text-white">
        <section className="max-w-4xl mx-auto px-6 py-24">

          {/* TITLE */}
          <h1 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight mb-6">
            Privacy Policy
          </h1>

          <p className="text-white/40 text-sm mb-12">
            Last updated: {new Date().getFullYear()}
          </p>

          {/* CONTENT */}
          <div className="space-y-10 text-white/80 leading-relaxed text-lg">

            <p>
              This Privacy Policy describes how your personal information is collected,
              used, and protected when you visit this website.
            </p>

            {/* SECTION */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">
                Information We Collect
              </h2>
              <p>
                We may collect personal data such as your name, email address,
                and usage data when you interact with our website or services.
              </p>
            </div>

            {/* SECTION */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">
                How We Use Your Information
              </h2>
              <p>
                Your information is used to improve our services, respond to inquiries,
                and enhance the overall user experience.
              </p>
            </div>

            {/* SECTION */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">
                Cookies & Tracking
              </h2>
              <p>
                We use cookies and similar technologies to analyze usage and optimize
                performance. You can disable cookies in your browser settings.
              </p>
            </div>

            {/* SECTION */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">
                Third-Party Services
              </h2>
              <p>
                We may use trusted third-party tools (such as analytics providers)
                that collect, monitor, and analyze data according to their own policies.
              </p>
            </div>

            {/* SECTION */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">
                Data Protection
              </h2>
              <p>
                We take reasonable measures to protect your personal data, but no
                method of transmission over the Internet is 100% secure.
              </p>
            </div>

            {/* SECTION */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">
                Your Rights
              </h2>
              <p>
                You have the right to request access, correction, or deletion of your
                personal information.
              </p>
            </div>

            {/* SECTION */}
            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">
                Contact
              </h2>
              <p>
                For any questions regarding this Privacy Policy, you can contact us
                via email or through the website.
              </p>
            </div>

          </div>

          {/* DIVIDER */}
          <div className="mt-16 pt-8 border-t border-white/10 text-sm text-white/30">
            © {new Date().getFullYear()} Abbassa Malik. All rights reserved.
          </div>

        </section>
      </main>

      <Footer />
    </>
  );
}