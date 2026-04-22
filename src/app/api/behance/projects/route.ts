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

function parseRssProjects(xmlText: string): BehanceProject[] {
  if (!xmlText || xmlText.trim().startsWith("{")) return [];
  const items: BehanceProject[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;
  let idx = 0;
  while ((m = itemRegex.exec(xmlText)) !== null) {
    const block = m[1];
    const title = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/i)?.[1]
      ?? block.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim()
      ?? `Project ${idx + 1}`;
    const link = block.match(/<link>([^<]*)<\/link>/i)?.[1]?.trim()
      ?? "https://www.behance.net/abbassamalik";
    const desc = block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i)?.[1]
      ?? block.match(/<description>([\s\S]*?)<\/description>/i)?.[1]
      ?? "";
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
  const clientId = process.env.BEHANCE_CLIENT_ID;
  if (clientId) {
    try {
      const res = await fetch(
        `https://api.behance.net/v2/users/abbassamalik/projects?client_id=${clientId}`,
        { next: { revalidate: 3600 } }
      );
      const json = (await res.json()) as { projects?: BehanceProject[] };
      if (json?.projects?.length) {
        return NextResponse.json({ source: "api", projects: json.projects });
      }
    } catch {
      /* fall through */
    }
  }

  const rssUrl =
    process.env.BEHANCE_RSS_URL ||
    "https://www.behance.net/feeds/user?username=abbassamalik";
  try {
    const res = await fetch(rssUrl, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8" },
    });
    const xml = await res.text();
    const projects = parseRssProjects(xml);
    return NextResponse.json({ source: "rss", projects });
  } catch {
    return NextResponse.json({ source: "none", projects: [] as BehanceProject[] });
  }
}
