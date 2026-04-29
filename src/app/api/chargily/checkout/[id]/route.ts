// # NEW FEATURE START - Chargily Pay: GET checkout details by id
// Server-side lookup so the /upload success modal can show authoritative
// customer info even when sessionStorage was lost during the redirect.
import { NextResponse } from "next/server";
import { getCheckout, getCustomer } from "@/lib/chargily";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || !/^[a-z0-9_]+$/i.test(id)) {
      return NextResponse.json({ error: "Invalid checkout id" }, { status: 400 });
    }

    const checkout = await getCheckout(id);

    // Pull customer info from Chargily so we don't depend on browser state.
    let customerName: string | undefined;
    let customerEmail: string | undefined;
    let customerPhone: string | undefined;
    if (checkout.customer_id) {
      try {
        const customer = await getCustomer(checkout.customer_id);
        customerName = customer.name;
        customerEmail = customer.email;
        customerPhone = customer.phone;
      } catch (err) {
        // Fall back to metadata we set when creating the checkout.
        console.warn("[chargily/checkout] customer lookup failed:", err);
      }
    }

    // Fallback: metadata we attached on create.
    const meta = checkout.metadata || {};
    customerName =
      customerName ?? (typeof meta.customer_name === "string" ? meta.customer_name : undefined);
    customerEmail =
      customerEmail ?? (typeof meta.customer_email === "string" ? meta.customer_email : undefined);
    customerPhone =
      customerPhone ?? (typeof meta.customer_phone === "string" ? meta.customer_phone : undefined);

    return NextResponse.json({
      id: checkout.id,
      status: checkout.status,
      amount: checkout.amount,
      currency: checkout.currency,
      payment_method: checkout.payment_method,
      description: checkout.description,
      customer: {
        id: checkout.customer_id,
        name: customerName || null,
        email: customerEmail || null,
        phone: customerPhone || null,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[chargily/checkout] failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
// # NEW FEATURE END
