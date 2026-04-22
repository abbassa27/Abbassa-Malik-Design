// NEW FEATURE START (v6)
import { NextRequest, NextResponse } from "next/server";
import { getInvoiceById, updateInvoice } from "@/lib/db";
import { verifyAdminToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inv = await getInvoiceById(id);
  if (!inv) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ invoice: inv });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = (await cookies()).get("admin_token")?.value;
  if (!token || !verifyAdminToken(token))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const updated = await updateInvoice(id, {
    ...body,
    dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    sentAt:  body.sentAt  ? new Date(body.sentAt)  : undefined,
    paidAt:  body.paidAt  ? new Date(body.paidAt)  : undefined,
  });
  return NextResponse.json({ success: true, invoice: updated });
}
// NEW FEATURE END (v6)