// ✅ NEW FEATURE START - FIX BUILD ERROR
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// ✅ NEW FEATURE END


// NEW FEATURE START (v6)
import { NextRequest, NextResponse } from "next/server";
import { getInvoiceById, markInvoiceSent } from "@/lib/db";
import { sendInvoiceEmail } from "@/lib/email";
import { verifyAdminToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = (await cookies()).get("admin_token")?.value;
  if (!token || !verifyAdminToken(token))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const invoice = await getInvoiceById(id);
  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (invoice.status === "cancelled")
    return NextResponse.json({ error: "Cannot send cancelled invoice" }, { status: 400 });
  try {
    await sendInvoiceEmail({ ...invoice, items: JSON.parse(invoice.items) });
    await markInvoiceSent(invoice.id);
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: "Email failed" }, { status: 500 }); }
}
// NEW FEATURE END (v6)