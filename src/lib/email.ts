// NEW FEATURE START (v7 — FULL SAFE RESEND)

// ❌ لا يوجد import هنا

// ✅ SAFE INIT (LAZY LOAD)
function getResendClient() {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    console.warn("⚠️ RESEND_API_KEY missing - emails disabled");
    return null;
  }

  const { Resend } = require("resend"); // 🔥 الحل هنا
  return new Resend(key);
}

const FROM = `${process.env.RESEND_FROM_NAME || "Abbassa Malik"} <${process.env.RESEND_FROM_EMAIL || "invoices@abbassa-malik.com"}>`;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://abbassa-malik.com";

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export async function sendInvoiceEmail(inv: {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  dueDate?: Date | null;
  notes?: string;
}) {
  const fmt = (n: number) => `${inv.currency} ${n.toFixed(2)}`;

  const rows = inv.items.map((it) => `
    <tr>
      <td>${it.description}</td>
      <td>${it.quantity}</td>
      <td>${fmt(it.unitPrice)}</td>
      <td>${fmt(it.total)}</td>
    </tr>
  `).join("");

  const html = `<html><body>
    <h2>Invoice ${inv.invoiceNumber}</h2>
    <p>Hello ${inv.clientName}</p>
    <table>${rows}</table>
    <p>Total: ${fmt(inv.total)}</p>
    <a href="${BASE_URL}/invoice/${inv.id}">View Invoice</a>
  </body></html>`;

  const resend = getResendClient();

  if (!resend) {
    console.log("Email skipped");
    return { skipped: true };
  }

  return resend.emails.send({
    from: FROM,
    to: inv.clientEmail,
    subject: `Invoice ${inv.invoiceNumber}`,
    html,
  });
}

export async function sendSubscriptionConfirmEmail(sub: {
  clientName: string;
  clientEmail: string;
  plan: string;
  amount: number;
  currency: string;
  billingCycle: string;
}) {
  const html = `<p>Subscription confirmed for ${sub.plan}</p>`;

  const resend = getResendClient();

  if (!resend) {
    console.log("Subscription email skipped");
    return { skipped: true };
  }

  return resend.emails.send({
    from: FROM,
    to: sub.clientEmail,
    subject: `Subscription Active`,
    html,
  });
}

// NEW FEATURE END (v7)