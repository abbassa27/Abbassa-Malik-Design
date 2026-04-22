import type { Metadata } from "next";
import "./globals.css";
// NEW FEATURE START
import PayPalProvider from "@/components/PayPalProvider";
// NEW FEATURE END

export const metadata: Metadata = {
  title: "Abbassa Malik — Book Cover Designer & E-book Formatting Specialist",
  description:
    "Premium book cover design and Kindle/EPUB formatting for Amazon KDP and beyond. Remote worldwide — Upwork & direct.",
  keywords: ["book cover design", "ebook formatting", "KDP", "Behance", "Abbassa Malik", "Abbassa Malik"],
  openGraph: {
    title: "Abbassa Malik — Book Cover Designer",
    description: "Dark & gold premium studio for authors and publishers.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-void text-ivory">
        {/* NEW FEATURE START */}
        <PayPalProvider>
          {children}
        </PayPalProvider>
        {/* NEW FEATURE END */}
      </body>
    </html>
  );
}
