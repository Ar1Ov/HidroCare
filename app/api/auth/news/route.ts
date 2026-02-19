import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

function stripHtml(input: string) {
  return input.replace(/<[^>]*>/g, "").trim();
}

export async function GET() {
  const query = encodeURIComponent("hyperhidrosis OR excessive sweating");
  const url = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;

  const res = await fetch(url, {
    // Cache on server for 1 hour (prevents rate-limit + speeds up)
    next: { revalidate: 3600 },
    headers: {
      "User-Agent": "HidroCare/1.0 (school project)",
    },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `News fetch failed: ${res.status}` },
      { status: 500 },
    );
  }

  const xml = await res.text();

  const parser = new XMLParser({
    ignoreAttributes: false,
  });

  const parsed = parser.parse(xml);
  const items = parsed?.rss?.channel?.item ?? [];

  const normalized = (Array.isArray(items) ? items : [items])
    .slice(0, 12)
    .map((it: any) => ({
      title: it.title as string,
      link: it.link as string,
      source: it.source?.["#text"] ?? it.source ?? "Google News",
      pubDate: it.pubDate ? new Date(it.pubDate).toISOString() : null,
      snippet: it.description ? stripHtml(String(it.description)) : "",
    }));

  return NextResponse.json({ items: normalized });
}
