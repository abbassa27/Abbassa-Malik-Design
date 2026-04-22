import { NextRequest, NextResponse } from "next/server";
import { createLead } from "@/lib/db";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const phone = body.phone ? String(body.phone).trim() : undefined;
    const message = String(body.message || "").trim();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "name, email, and message are required" }, { status: 400 });
    }

    try {
      await createLead({ name, email, phone, message });
    } catch (e) {
      console.warn("Lead DB (optional Lead table):", e);
    }

    const to = process.env.LEAD_NOTIFY_EMAIL || "abbassamalik@gmail.com";
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM || "Portfolio <onboarding@resend.dev>",
        to,
        reply_to: email,
        subject: `New inquiry — ${name}`,
        text: `${message}\n\n—\n${email}${phone ? `\nPhone: ${phone}` : ""}`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
