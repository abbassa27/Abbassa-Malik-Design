// NEW FEATURE START (v6)
import { NextRequest, NextResponse } from "next/server";
import { getAllInvoices, createInvoice, getInvoiceStats } from "@/lib/db";
import { verifyAdminToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  const token = cookies().get("admin_token")?.value;
  if (!token || !verifyAdminToken(token))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [invoices, stats] = await Promise.all([getAllInvoices(), getInvoiceStats()]);
  return NextResponse.json({ invoices, stats });
}

export async function POST(req: NextRequest) {
  const token = cookies().get("admin_token")?.value;
  if (!token || !verifyAdminToken(token))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await req.json();
    const invoice = await createInvoice({
      ...body,
      items: typeof body.items === "string" ? body.items : JSON.stringify(body.items),
      subtotal: Number(body.subtotal) || 0,
      tax: Number(body.tax) || 0,
      total: Number(body.total) || 0,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    });
    return NextResponse.json({ success: true, invoice }, { status: 201 });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
// NEW FEATURE END (v6)