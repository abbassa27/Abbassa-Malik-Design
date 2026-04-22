// NEW FEATURE START (v4 — Public Client Order Status with Prisma)
import { NextRequest, NextResponse } from "next/server";
import { getOrderById } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const safe = {
    id: order.id,
    plan: order.plan,
    amount: order.amount,
    authorName: order.authorName,
    bookTitle: order.bookTitle,
    genre: order.genre,
    status: order.status,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    deliverables: order.deliverables.map((f) => ({
      id: f.id,
      filename: f.filename,
      storedAs: f.storedAs,
      size: f.size,
      mimeType: f.mimeType,
      uploadedAt: f.createdAt,
    })),
  };

  return NextResponse.json({ order: safe });
}
// NEW FEATURE END (v4)
