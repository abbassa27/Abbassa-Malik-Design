// NEW FEATURE START (v6)
import { NextRequest, NextResponse } from "next/server";
import { getSubscriptionById, cancelSubscription, updateSubscription } from "@/lib/db";
import { verifyAdminToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const token = cookies().get("admin_token")?.value;
  if (!token || !verifyAdminToken(token))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sub = await getSubscriptionById(params.id);
  if (!sub) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ subscription: sub });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = cookies().get("admin_token")?.value;
  if (!token || !verifyAdminToken(token))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const updated = body.action === "cancel"
    ? await cancelSubscription(params.id)
    : await updateSubscription(params.id, {
        ...body,
        nextBillingDate: body.nextBillingDate ? new Date(body.nextBillingDate) : undefined,
      });
  return NextResponse.json({ success: true, subscription: updated });
}
// NEW FEATURE END (v6)