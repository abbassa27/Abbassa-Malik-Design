// NEW FEATURE START (v4 — Analytics API)
import { NextRequest, NextResponse } from "next/server";
import { getAnalytics, getBusinessAnalytics } from "@/lib/db";
import { verifyAdminToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token || !verifyAdminToken(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    // NEW FEATURE START (v5 — business analytics mode)
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode");
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;

    if (mode === "business") {
      const data = await getBusinessAnalytics(year);
      return NextResponse.json(data);
    }
    // NEW FEATURE END (v5)

    // Original v4 analytics (preserved)
    const analytics = await getAnalytics();
    return NextResponse.json(analytics);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
// NEW FEATURE END (v4)
