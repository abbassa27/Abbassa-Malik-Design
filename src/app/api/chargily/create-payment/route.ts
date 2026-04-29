// # NEW FEATURE START - Chargily Pay: create-payment API route (Vercel Serverless)
import { NextResponse } from "next/server";
import { createCheckout, createCustomer } from "@/lib/chargily";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = {
  name: string;
  email: string;
  phone: string;
  amount: number | string;
  description?: string;
};

function getBaseUrl(req: Request): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_BASE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");

  try {
    const url = new URL(req.url);
    const proto = req.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || url.host;
    return `${proto}://${host}`;
  } catch {
    return "";
  }
}

function sanitize(input: Payload) {
  const name = String(input.name || "").trim();
  const email = String(input.email || "").trim().toLowerCase();
  const phone = String(input.phone || "").trim();
  const description = input.description ? String(input.description).trim() : "Edahabia payment";
  const amountNum = Number(input.amount);

  const errors: string[] = [];
  if (!name || name.length < 2) errors.push("Name is required");
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.push("Valid email is required");
  if (!phone || phone.replace(/\D/g, "").length < 6) errors.push("Phone is required");
  if (!Number.isFinite(amountNum) || amountNum < 50)
    errors.push("Amount must be at least 50 DZD (Chargily minimum)");

  return { name, email, phone, amount: Math.round(amountNum), description, errors };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;
    const input = sanitize(body);
    if (input.errors.length) {
      return NextResponse.json({ error: input.errors.join(", ") }, { status: 400 });
    }

    if (!process.env.CHARGILY_SECRET_KEY) {
      return NextResponse.json(
        {
          error:
            "Chargily is not configured on the server. Please set CHARGILY_SECRET_KEY in your environment.",
        },
        { status: 500 }
      );
    }

    const baseUrl = getBaseUrl(req);
    if (!baseUrl) {
      return NextResponse.json(
        { error: "Unable to determine site URL for redirects." },
        { status: 500 }
      );
    }

    // Create / find customer first so we can associate the checkout with them.
    const customer = await createCustomer({
      name: input.name,
      email: input.email,
      phone: input.phone,
    });

    const failureUrl = `${baseUrl}/checkout/edahabia?payment=failed`;
    const webhookEndpoint = `${baseUrl}/api/chargily/webhook`;
    const successUrl = `${baseUrl}/upload?payment=success&provider=chargily`;

    const checkout = await createCheckout({
      amount: input.amount,
      currency: "dzd",
      payment_method: "edahabia",
      customer_id: customer.id,
      success_url: successUrl,
      failure_url: failureUrl,
      webhook_endpoint: webhookEndpoint,
      description: input.description,
      locale: "en",
      metadata: {
        customer_name: input.name,
        customer_email: input.email,
        customer_phone: input.phone,
        source: "abbassa-malik-site",
      },
    });

    // Persist the checkout id in a cookie so the success page can look up
    // authoritative customer info from Chargily after the cross-origin
    // redirect, even if sessionStorage is dropped by the browser.
    const response = NextResponse.json({
      checkout_url: checkout.checkout_url,
      checkout_id: checkout.id,
      customer_id: customer.id,
      amount: checkout.amount,
      currency: checkout.currency,
    });
    response.cookies.set("chargily_last_checkout", checkout.id, {
      httpOnly: false, // client also reads this as a fallback
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60, // 1 hour is plenty for a checkout flow
    });
    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[chargily/create-payment] failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
// # NEW FEATURE END
