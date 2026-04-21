// NEW FEATURE START (v6)
import { NextRequest, NextResponse } from "next/server";
import { getSubscriptionByPaypalId, updateSubscription, cancelSubscription } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { event_type, resource } = await req.json();
    const paypalSubId = resource?.id || resource?.billing_agreement_id;
    if (!paypalSubId) return NextResponse.json({ received: true });
    const sub = await getSubscriptionByPaypalId(paypalSubId);
    if (!sub) return NextResponse.json({ received: true });
    if (event_type === "BILLING.SUBSCRIPTION.ACTIVATED")
      await updateSubscription(sub.id, { status: "active" });
    else if (event_type === "BILLING.SUBSCRIPTION.SUSPENDED")
      await updateSubscription(sub.id, { status: "paused" });
    else if (["BILLING.SUBSCRIPTION.CANCELLED","BILLING.SUBSCRIPTION.EXPIRED"].includes(event_type))
      await cancelSubscription(sub.id);
    return NextResponse.json({ received: true });
  } catch { return NextResponse.json({ error: "Webhook error" }, { status: 500 }); }
}
// NEW FEATURE END (v6)