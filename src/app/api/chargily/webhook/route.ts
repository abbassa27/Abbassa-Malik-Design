// # NEW FEATURE START - Chargily Pay webhook handler (Vercel Serverless)
// Verifies the `signature` header using HMAC-SHA256 with CHARGILY_SECRET_KEY
// and logs the event. No DB mutation here — this endpoint simply acknowledges
// the webhook so Chargily stops retrying. Extend as needed.

import { NextResponse } from "next/server";
import crypto from "crypto";
import { timingSafeEqual } from "@/lib/chargily";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const computed = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return timingSafeEqual(computed, signature);
}

export async function POST(req: Request) {
  const secret = (process.env.CHARGILY_SECRET_KEY || "").trim().replace(/^["']|["']$/g, "");
  if (!secret) {
    console.error("[chargily/webhook] CHARGILY_SECRET_KEY not set");
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  // Read raw body for signature verification
  const rawBody = await req.text();
  const signature = req.headers.get("signature") || req.headers.get("x-signature");

  if (!verifySignature(rawBody, signature, secret)) {
    console.warn("[chargily/webhook] invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  try {
    const payload = rawBody ? JSON.parse(rawBody) : {};
    const event = typeof payload?.type === "string" ? payload.type : "unknown";
    const data = payload?.data ?? {};

    // Log only — hook up to DB / email here if needed.
    console.log("[chargily/webhook] received:", event, {
      id: data?.id,
      status: data?.status,
      amount: data?.amount,
      currency: data?.currency,
      customer_id: data?.customer_id,
    });
  } catch (err) {
    console.error("[chargily/webhook] failed to parse payload:", err);
  }

  // Always acknowledge quickly so Chargily does not retry.
  return NextResponse.json({ received: true });
}
// # NEW FEATURE END
