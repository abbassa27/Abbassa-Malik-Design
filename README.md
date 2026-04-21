# Abbassa Malik — SaaS Landing Page

A professional, minimalist Next.js 14 landing page for **Abbassa Malik**, a Book Cover Designer & E-Book Formatting Specialist.

## ✨ Features

- **Minimalist design** with cream, charcoal, and gold palette
- **Dynamic Behance portfolio** via Behance API
- Smooth **Framer Motion** animations
- Fully **responsive** (mobile-first)
- Sections: Hero, Services, Portfolio, About, Pricing, Contact, Footer
- Prominent **"Hire Me on Upwork"** CTA throughout
- **LinkedIn** & **Behance** social links

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local and add your Behance API key

# 3. Run development server
npm run dev

Open http://localhost:3000.🔑 Behance API SetupGo to https://www.behance.net/dev/registerCreate a new app to get your API keyAdd it to .env.local as BEHANCE_API_KEY=your_keyWithout an API key, the portfolio section shows placeholder project cards with Unsplash images and links to your Behance profile.🏗️ Project StructurePlaintextsrc/
├── app/
│   ├── api/behance/route.ts   # Behance API proxy
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
└── components/
    ├── Navbar.tsx
    ├── Hero.tsx
    ├── Services.tsx
    ├── Portfolio.tsx          # Dynamic Behance gallery
    ├── About.tsx
    ├── Pricing.tsx
    ├── Contact.tsx
    └── Footer.tsx
🎨 Design SystemTokenValuecream#FAF8F5charcoal#1A1A1Agold#C9A84Cmuted#6B6B6B📦 Deploy on VercelBashnpm install -g vercel
vercel
Add BEHANCE_API_KEY as an environment variable in the Vercel dashboard.Built with Next.js 14, Tailwind CSS, and Framer Motion.
**خطوات رفع الملف بعد النسخ:**
1. افتح الـ Terminal في مجلد المشروع.
2. تأكد من حفظ الملف بعد لصق النص أعلاه.
3. نفذ الأوامر التالية لرفع التعديلات:
   ```bash
   git add README.md
   git commit -m "Final professional README format"
   git push origin main