// NEW FEATURE START (v6 — Resend Email Helper)
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = `${process.env.RESEND_FROM_NAME || "Abbassa Malik"} <${process.env.RESEND_FROM_EMAIL || "invoices@abbassa-malik.com"}>`;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://abbassa-malik.com";

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export async function sendInvoiceEmail(inv: {
  id: string; invoiceNumber: string; clientName: string; clientEmail: string;
  items: InvoiceItem[]; subtotal: number; tax: number; total: number;
  currency: string; dueDate?: Date | null; notes?: string;
}) {
  const fmt = (n: number) => `${inv.currency} ${n.toFixed(2)}`;
  const rows = inv.items.map((it) => `
    <tr style="border-bottom:1px solid #f0e8d5;">
      <td style="padding:10px 8px;color:#2c2c2c;font-size:14px;">${it.description}</td>
      <td style="padding:10px 8px;text-align:center;font-size:14px;">${it.quantity}</td>
      <td style="padding:10px 8px;text-align:right;font-size:14px;">${fmt(it.unitPrice)}</td>
      <td style="padding:10px 8px;text-align:right;color:#c9a84c;font-weight:700;font-size:14px;">${fmt(it.total)}</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html><html><body style="margin:0;background:#fafaf8;font-family:Georgia,serif;">
  <div style="max-width:620px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#1a1a1a,#2d2d2d);padding:40px;">
      <h1 style="margin:0;color:#c9a84c;font-size:28px;font-weight:400;">ABBASSA MALIK</h1>
      <p style="margin:4px 0 0;color:#9a9a8a;font-size:13px;">Book Design & Publishing Services</p>
      <div style="margin-top:24px;">
        <span style="background:#c9a84c;color:#1a1a1a;padding:6px 16px;border-radius:20px;font-size:12px;font-weight:700;">INVOICE</span>
        <span style="color:#9a9a8a;font-size:13px;margin-left:12px;">${inv.invoiceNumber}</span>
      </div>
    </div>
    <div style="padding:40px;">
      <p style="color:#6b6b6b;">Dear <strong style="color:#2c2c2c;">${inv.clientName}</strong>,</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#fafaf8;border-radius:8px;">
        <thead><tr style="background:#f0e8d5;">
          <th style="padding:12px 8px;text-align:left;font-size:11px;color:#6b6b6b;text-transform:uppercase;">Description</th>
          <th style="padding:12px 8px;text-align:center;font-size:11px;color:#6b6b6b;text-transform:uppercase;">Qty</th>
          <th style="padding:12px 8px;text-align:right;font-size:11px;color:#6b6b6b;text-transform:uppercase;">Unit Price</th>
          <th style="padding:12px 8px;text-align:right;font-size:11px;color:#6b6b6b;text-transform:uppercase;">Total</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:20px;text-align:right;">
        <p style="color:#6b6b6b;">Subtotal: <strong>${fmt(inv.subtotal)}</strong></p>
        ${(inv.tax ?? 0) > 0 ? `<p style="color:#6b6b6b;">Tax: <strong>${fmt(inv.tax!)}</strong></p>` : ""}
        <p style="color:#c9a84c;font-size:20px;font-weight:700;">Total Due: ${fmt(inv.total)}</p>
      </div>
      ${inv.notes ? `<p style="color:#6b6b6b;font-size:13px;border-left:3px solid #c9a84c;padding-left:12px;">${inv.notes}</p>` : ""}
      <div style="text-align:center;margin-top:32px;">
        <a href="${BASE_URL}/invoice/${inv.id}" style="display:inline-block;background:#c9a84c;color:#1a1a1a;padding:14px 32px;border-radius:24px;font-weight:700;font-size:14px;text-decoration:none;">VIEW INVOICE ONLINE</a>
      </div>
      <p style="margin:24px 0 0;color:#9a9a8a;font-size:12px;text-align:center;">Payment via PayPal or Wise · abbassa-malik.com</p>
    </div>
  </div>
  </body></html>`;

  return resend.emails.send({
    from: FROM, to: inv.clientEmail,
    subject: `Invoice ${inv.invoiceNumber} from Abbassa Malik`, html,
  });
}

export async function sendSubscriptionConfirmEmail(sub: {
  clientName: string; clientEmail: string; plan: string;
  amount: number; currency: string; billingCycle: string;
}) {
  const html = `<!DOCTYPE html><html><body style="font-family:Georgia,serif;background:#fafaf8;margin:0;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#1a1a1a,#2d2d2d);padding:36px 40px;">
      <h1 style="margin:0;color:#c9a84c;font-size:24px;font-weight:400;">ABBASSA MALIK</h1>
      <p style="margin:4px 0 0;color:#9a9a8a;font-size:12px;">Subscription Confirmed ✓</p>
    </div>
    <div style="padding:40px;">
      <p style="color:#2c2c2c;font-size:15px;">Dear <strong>${sub.clientName}</strong>,</p>
      <p style="color:#6b6b6b;font-size:14px;">Your <strong>${sub.plan}</strong> subscription is now active.</p>
      <div style="background:#fafaf8;border-radius:12px;padding:20px;margin:20px 0;border:1px solid #f0e8d5;">
        <p style="margin:0 0 8px;color:#2c2c2c;font-size:14px;"><strong>Plan:</strong> ${sub.plan}</p>
        <p style="margin:0;color:#2c2c2c;font-size:14px;"><strong>Amount:</strong> ${sub.currency} ${sub.amount.toFixed(2)} / ${sub.billingCycle}</p>
      </div>
      <p style="color:#9a9a8a;font-size:12px;text-align:center;">You can cancel anytime by contacting us · abbassa-malik.com</p>
    </div>
  </div></body></html>`;

  return resend.emails.send({
    from: FROM, to: sub.clientEmail,
    subject: `Your ${sub.plan} Subscription is Active — Abbassa Malik`, html,
  });
}
// NEW FEATURE END (v6)