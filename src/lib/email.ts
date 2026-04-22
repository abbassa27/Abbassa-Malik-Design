// NEW FEATURE START (v6 — Resend Email Helper)
import { Resend } from "resend";

// ✅ NEW FEATURE START - SAFE RESEND INIT
function getResendClient() {
  const key = process.env.RESEND_API_KEY;

  if (!key) {
    console.warn("⚠️ RESEND_API_KEY missing - emails disabled");
    return null;
  }

  return new Resend(key);
}
// ✅ NEW FEATURE END

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
    <tr style="border-bottom:1px solid #f0e8d5;">
      <td style="padding:10px 8px;color:#2c2c2c;font-size:14px;">${it.description}</td>
      <td style="padding:10px 8px;text-align:center;font-size:14px;">${it.quantity}</td>
      <td style="padding:10px 8px;text-align:right;font-size:14px;">${fmt(it.unitPrice)}</td>
      <td style="padding:10px 8px;text-align:right;color:#c9a84c;font-weight:700;font-size:14px;">${fmt(it.total)}</td>
    </tr>
  `).join("");

  const html = `<!DOCTYPE html><html><body style="margin:0;background:#fafaf8;font-family:Georgia,serif;">
  <div style="max-width:620px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;">
    <div style="background:#1a1a1a;padding:40px;">
      <h1 style="color:#c9a84c;">ABBASSA MALIK</h1>
    </div>
    <div style="padding:40px;">
      <p>Dear <strong>${inv.clientName}</strong>,</p>
      <table width="100%">${rows}</table>
      <p>Total: ${fmt(inv.total)}</p>
      <a href="${BASE_URL}/invoice/${inv.id}">View Invoice</a>
    </div>
  </div>
  </body></html>`;

  // ✅ NEW FEATURE START - SAFE SEND
  const resend = getResendClient();

  if (!resend) {
    console.log("Email skipped (no API key)");
    return { skipped: true };
  }

  return resend.emails.send({
    from: FROM,
    to: inv.clientEmail,
    subject: `Invoice ${inv.invoiceNumber} from Abbassa Malik`,
    html,
  });
  // ✅ NEW FEATURE END
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
// NEW FEATURE END (v6)