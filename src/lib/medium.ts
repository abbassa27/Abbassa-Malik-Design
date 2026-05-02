import { XMLParser } from "fast-xml-parser";

export async function getMediumPosts() {
  try {
    const res = await fetch(
      "https://medium.com/feed/@abbassamalik",
      {
        cache: "force-cache",
        next: { revalidate: 3600 },
      }
    );

    const xml = await res.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
    });

    const json = parser.parse(xml);

    let items = json?.rss?.channel?.item;

    if (!items) return [];

    if (!Array.isArray(items)) {
      items = [items];
    }

    return items.map((item: any) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      description: item.description,
    }));
  } catch (err) {
    console.error("Medium error:", err);
    return [];
  }
}