import { NextResponse } from "next/server";

export const revalidate = 3600; // revalidate every hour

export async function GET() {
  // NEW FEATURE START
  const BEHANCE_RSS_URL =
    process.env.BEHANCE_RSS_URL ||
    "https://www.behance.net/feeds/user?username=abbassamalik";
  // NEW FEATURE END

  try {
    // NEW FEATURE START
    const res = await fetch(BEHANCE_RSS_URL, {
      next: { revalidate: 3600 },
      headers: {
        Accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
      },
    });
    // NEW FEATURE END

    if (!res.ok) throw new Error("Behance RSS fetch failed");

    const rssText = await res.text();

    return new NextResponse(rssText, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
      },
    });
  } catch {
    return new NextResponse("", {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
      },
    });
  }
}
