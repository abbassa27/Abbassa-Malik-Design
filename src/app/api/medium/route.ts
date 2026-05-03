import { XMLParser } from "fast-xml-parser";

export async function GET() {
  try {
    const res = await fetch(
      "https://medium.com/feed/@abbassamalik",
      { cache: "no-store" }
    );

    const xml = await res.text();

    const parser = new XMLParser({
      ignoreAttributes: false,
    });

    const json = parser.parse(xml);

    let items = json?.rss?.channel?.item;

    if (!items) return Response.json([]);

    if (!Array.isArray(items)) {
      items = [items];
    }

    const posts = items.map((item: any) => {
      // 🔥 نأخذ content الكامل
      const content = item["content:encoded"] || "";

      // 🔥 نستخرج الصورة من content
      const image =
        content.match(/<img.*?src="(.*?)"/)?.[1] || null;

      return {
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        description: item.description,
        image,
      };
    });

    return Response.json(posts);
  } catch (err) {
    console.error(err);
    return Response.json([]);
  }
}
