// NEW FEATURE START (v3 — Admin Logout API)
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("admin_token", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });
  return res;
}
// NEW FEATURE END (v3)
