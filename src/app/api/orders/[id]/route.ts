// NEW FEATURE START (v4 — Single Order API with Prisma)
import { NextRequest, NextResponse } from "next/server";
import { getOrderById, updateOrderStatus, logEvent } from "@/lib/db";
import { verifyAdminToken } from "@/lib/auth";
import { cookies } from "next/headers";
import type { OrderStatus } from "@prisma/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const order = await getOrderById(id);
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const updated = await updateOrderStatus(
      id,
      body.status as OrderStatus,
      body.adminNotes
    );
    await logEvent(id, "status_changed", "admin", {
      newStatus: body.status,
      adminNotes: body.adminNotes,
    });
    return NextResponse.json({ success: true, order: updated });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
// NEW FEATURE END (v4)
