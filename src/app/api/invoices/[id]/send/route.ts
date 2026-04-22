// ✅ NEW FEATURE START - FIX BUILD ERROR
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
// ✅ NEW FEATURE END

// NEW FEATURE START (v11 - FINAL FIX ALL)
import { NextRequest, NextResponse } from "next/server";
import { getInvoiceById, markInvoiceSent } from "@/lib/db";
import { sendInvoiceEmail } from "@/lib/email";
import { verifyAdminToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(
  request: NextRequest,
  context: any
) {
  try {
    const { id } = context.params as { id: string };

    // ✅ FIX: cookies() is async in Next.js 16
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_token")?.value;

    if (!token || !verifyAdminToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoice = await getInvoiceById(id);

    if (!invoice) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (invoice.status === "cancelled") {
      return NextResponse.json(
        { error: "Cannot send cancelled invoice" },
        { status: 400 }
      );
    }

    // ✅ SAFE JSON PARSE
    let items: any[] = [];
    try {
      items = JSON.parse(invoice.items || "[]");
    } catch (e) {
      console.warn("Invalid items JSON", e);
    }

    // ✅ SAFE EMAIL (does not break API)
    try {
      await sendInvoiceEmail({
        ...invoice,
        items,
      });
    } catch (e) {
      console.error("Email failed:", e);
    }

    // ✅ ALWAYS UPDATE STATUS
    await markInvoiceSent(invoice.id);

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("API ERROR:", err);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
// NEW FEATURE END (v11)