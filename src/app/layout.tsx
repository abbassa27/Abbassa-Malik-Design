import type { Metadata } from "next";
import "./globals.css";
// NEW FEATURE START
import PayPalProvider from "@/components/PayPalProvider";
// NEW FEATURE END

export const metadata: Metadata = {
  title: "Abbassa Malik — Book Cover Designer & E-book Formatter",
  description: "Professional book cover design and e-book formatting services. Transforming ideas into stunning visual narratives.",
  keywords: ["book cover design", "ebook formatting", "graphic designer", "Abbassa Malik"],
  openGraph: {
    title: "Abbassa Malik — Book Cover Designer",
    description: "Transforming Ideas into Stunning Visual Narratives",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {/* NEW FEATURE START */}
        <PayPalProvider>
          {children}
        </PayPalProvider>
        {/* NEW FEATURE END */}
      </body>
    </html>
  );
}
