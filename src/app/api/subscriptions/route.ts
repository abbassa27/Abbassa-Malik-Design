// NEW FEATURE START (v6)
import { NextRequest, NextResponse } from "next/server";
import { getAllSubscriptions, createSubscription, getSubscriptionStats } from "@/lib/db";
import { sendSubscriptionConfirmEmail } from "@/lib/email";
import { verifyAdminToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  const token = cookies().get("admin_token")?.value;
  if (!token || !verifyAdminToken(token))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [subscriptions, stats] = await Promise.all([getAllSubscriptions(), getSubscriptionStats()]);
  return NextResponse.json({ subscriptions, stats });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sub = await createSubscription({ ...body, amount: Number(body.amount) || 0,
      nextBillingDate: body.nextBillingDate ? new Date(body.nextBillingDate) : undefined });
    try { await sendSubscriptionConfirmEmail({ ...body, amount: Number(body.amount) || 0 }); }
    catch (e) { console.warn("Email failed:", e); }
    return NextResponse.json({ success: true, subscription: sub }, { status: 201 });
  } catch { return NextResponse.json({ error: "Server error" }, { status: 500 }); }
}
// NEW FEATURE END (v6)