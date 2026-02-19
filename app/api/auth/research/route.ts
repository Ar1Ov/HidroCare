import { NextResponse } from "next/server";

function first<T>(arr: T[] | undefined, fallback: T) {
  return Array.isArray(arr) && arr.length ? arr[0] : fallback;
}

export async function GET() {
  const query = encodeURIComponent("hyperhidrosis");
  const url =
    `https://api.crossref.org/works?` +
    `query.title=${query}&rows=12&sort=published&order=desc`;

  const res = await fetch(url, {
    next: { revalidate: 3600 }, // cache 1 hour
    headers: {
      "User-Agent": "HidroCare/1.0 (school project; mailto:example@example.com)",
    },
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: `Crossref fetch failed: ${res.status}` },
      { status: 500 },
    );
  }

  const data = await res.json();
  const items = data?.message?.items ?? [];

  const normalized = items
    .map((it: any) => {
      const title = first<string>(it.title, "Untitled");
      const doi = it.DOI as string | undefined;

      const published =
        it.created?.["date-time"] ||
        it.published?.["date-time"] ||
        it.published?.["date-parts"]?.[0]?.join?.("-") ||
        null;

      const authors = (it.author ?? [])
        .slice(0, 4)
        .map((a: any) => [a.given, a.family].filter(Boolean).join(" "))
        .filter(Boolean);

      return {
        title,
        doi: doi ?? null,
        url: (it.URL as string) ?? (doi ? `https://doi.org/${doi}` : null),
        journal: first<string>(it["container-title"], ""),
        pubDate: published ? new Date(published).toISOString() : null,
        authors,
      };
    })
    // Optional: keep things tightly relevant
    .filter((it: any) => it.title.toLowerCase().includes("hyperhidrosis"));

  return NextResponse.json({ items: normalized.slice(0, 12) });
}
