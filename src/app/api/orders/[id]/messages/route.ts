// NEW FEATURE START (v4 — Messages API)
import { NextRequest, NextResponse } from "next/server";
import { getMessages, sendMessage, markMessagesRead, logEvent } from "@/lib/db";
import { verifyAdminToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token")?.value;
  const isAdmin = !!adminToken && !!verifyAdminToken(adminToken);

  const messages = await getMessages(id);

  // Mark messages as read for the reader
  await markMessagesRead(id, isAdmin ? "admin" : "client");

  return NextResponse.json({ messages });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("admin_token")?.value;
  const isAdmin = !!adminToken && !!verifyAdminToken(adminToken);

  try {
    const { body } = await req.json();
    if (!body?.trim()) {
      return NextResponse.json({ error: "Message body is required" }, { status: 400 });
    }

    const sender = isAdmin ? "admin" : "client";
    const message = await sendMessage(id, sender, body.trim());
    await logEvent(id, "message_sent", sender, { preview: body.slice(0, 60) });

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
// NEW FEATURE END (v4)
