// NEW FEATURE START (v4 — Orders API with Prisma)
import { NextRequest, NextResponse } from "next/server";
import { getAllOrders, createOrder, logEvent } from "@/lib/db";
import { verifyAdminToken } from "@/lib/auth";
import { cookies } from "next/headers";

// GET — admin only: list all orders
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const orders = await getAllOrders();
  return NextResponse.json({ orders });
}

// POST — public: create a new order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plan, amount, authorName, bookTitle, genre, email, synopsis, instructions } = body;
    if (!email || !bookTitle) {
      return NextResponse.json({ error: "email and bookTitle are required" }, { status: 400 });
    }
    const order = await createOrder({
      plan: plan || "Custom",
      amount: amount || "0",
      authorName: authorName || "",
      bookTitle,
      genre: genre || "",
      email,
      synopsis: synopsis || "",
      instructions: instructions || "",
    });
    await logEvent(order.id, "order_created", "client", { plan, amount });
    return NextResponse.json({ success: true, orderId: order.id }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
// NEW FEATURE END (v4)
