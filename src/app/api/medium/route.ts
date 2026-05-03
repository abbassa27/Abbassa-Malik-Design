import { XMLParser } from "fast-xml-parser";

export async function GET() {
  try {
    const res = await fetch(
      "https://medium.com/feed/@abbassamalik",
      {
        cache: "no-store",
      }
    );

    const xml = await res.text();

    const parser = new XMLParser();
    const json = parser.parse(xml);

    let items = json?.rss?.channel?.item;

    if (!items) return Response.json([]);

    if (!Array.isArray(items)) {
      items = [items];
    }

    return Response.json(items);
  } catch (err) {
    console.error(err);
    return Response.json([]);
  }
}
