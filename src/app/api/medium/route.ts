export async function GET() {
  try {
    const res = await fetch(
      "https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/@abbassamalik",
      {
        cache: "no-store", // ✅ يمنع الكاش
      }
    );

    const data = await res.json();

    return Response.json(data.items || []);
  } catch (err) {
    console.error(err);
    return Response.json([]);
  }
}
