// NEW FEATURE START (v4 — Single Order API with Prisma)
import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrderStatus, logEvent } from "@/lib/db";
import { verifyAdminToken } from "@/lib/auth";
import { cookies } from "next/headers";
import type { OrderStatus } from "@prisma/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const order = await getOrderById(params.id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const cookieStore = cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const updated = await updateOrderStatus(
      params.id,
      body.status as OrderStatus,
      body.adminNotes
    );
    await logEvent(params.id, "status_changed", "admin", {
      newStatus: body.status,
      adminNotes: body.adminNotes,
    });
    return NextResponse.json({ success: true, order: updated });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
// NEW FEATURE END (v4)
