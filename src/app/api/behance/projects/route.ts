import { NextResponse } from "next/server";

export const revalidate = 3600;

type BehanceProject = {
  id: number;
  name: string;
  url: string;
  published_on: number;
  covers?: Record<string, string>;
  fields?: string[];
};

// # NEW FEATURE START - Memory Cache
let CACHE: BehanceProject[] | null = null;
let LAST_FETCH = 0;
const CACHE_TTL = 1000 * 60 * 10; // 10 min
// # NEW FEATURE END

// # NEW FEATURE START - Fetch with timeout + retry
async function fetchWithRetry(url: string, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(url, {
        signal: controller.signal,
        next: { revalidate: 3600 },
      });

      clearTimeout(timeout);

      if (!res.ok) throw new Error("Fetch failed");

      return res;
    } catch (err) {
      if (i === retries) throw err;
    }
  }
}
// # NEW FEATURE END

function parseRssProjects(xmlText: string): BehanceProject[] {
  if (!xmlText || xmlText.trim().startsWith("{")) return [];
  const items: BehanceProject[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;
  let idx = 0;

  while ((m = itemRegex.exec(xmlText)) !== null) {
    const block = m[1];
    const title =
      block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i)?.[1] ??
      block.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() ??
      `Project ${idx + 1}`;

    const link =
      block.match(/<link>([^<]*)<\/link>/i)?.[1]?.trim() ??
      "https://www.behance.net/abbassamalik";

    const desc =
      block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i)?.[1] ??
      block.match(/<description>([\s\S]*?)<\/description>/i)?.[1] ??
      "";

    const img = desc.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];

    items.push({
      id: idx + 1,
      name: title.replace(/&amp;/g, "&"),
      url: link,
      published_on: Date.now(),
      covers: img ? { "404": img, original: img } : {},
      fields: ["Behance"],
    });

    idx++;
    if (idx >= 18) break;
  }

  return items;
}

export async function GET() {
  const now = Date.now();

  // # NEW FEATURE START - Serve from cache
  if (CACHE && now - LAST_FETCH < CACHE_TTL) {
    return NextResponse.json({ source: "cache", projects: CACHE });
  }
  // # NEW FEATURE END

  const clientId = process.env.BEHANCE_CLIENT_ID;

  // 🔥 API FIRST
  if (clientId) {
    try {
      const res = await fetchWithRetry(
        `https://api.behance.net/v2/users/abbassamalik/projects?client_id=${clientId}`
      );
	  
// ✅ أضف هذا السطر هنا
if (!res || !res.ok) throw new Error("Behance API failed");

      const json = (await res.json()) as { projects?: BehanceProject[] };

      if (json?.projects?.length) {
        // # NEW FEATURE START - Save cache
        CACHE = json.projects;
        LAST_FETCH = now;
        // # NEW FEATURE END

        return NextResponse.json({ source: "api", projects: json.projects });
      }
    } catch {
      /* fallback */
    }
  }

  // 🔥 RSS fallback
  const rssUrl =
    process.env.BEHANCE_RSS_URL ||
    "https://www.behance.net/feeds/user?username=abbassamalik";

  try {
    const res = await fetchWithRetry(rssUrl);
	
	// ✅ أضف هذا الشرط هنا
if (!res || !res.ok) throw new Error("RSS fetch failed");

    const xml = await res.text();
    const projects = parseRssProjects(xml);

    // # NEW FEATURE START - Save cache
    CACHE = projects;
    LAST_FETCH = now;
    // # NEW FEATURE END

    return NextResponse.json({ source: "rss", projects });
  } catch {
    return NextResponse.json({
      source: "fallback",
      projects: CACHE || [],
    });
  }
}