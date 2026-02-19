"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, ExternalLink, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type NewsItem = {
  title: string;
  link: string;
  source: string;
  pubDate: string | null;
  snippet: string;
};

type ResearchItem = {
  title: string;
  doi: string | null;
  url: string | null;
  journal: string;
  pubDate: string | null;
  authors: string[];
};

function formatDate(iso: string | null) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export function LatestNewsContent() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [research, setResearch] = useState<ResearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadAll(isRefresh = false) {
    try {
      setError(null);
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [newsRes, researchRes] = await Promise.all([
        fetch("/api/news", { cache: "no-store" }),
        fetch("/api/research", { cache: "no-store" }),
      ]);

      const newsJson = await newsRes.json().catch(() => ({}));
      const researchJson = await researchRes.json().catch(() => ({}));

      if (!newsRes.ok) throw new Error(newsJson?.error || "Failed to load news");
      if (!researchRes.ok) throw new Error(researchJson?.error || "Failed to load research");

      setNews(Array.isArray(newsJson.items) ? newsJson.items : []);
      setResearch(Array.isArray(researchJson.items) ? researchJson.items : []);

      if (isRefresh) toast.success("Updated!");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load updates";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadAll(false);
  }, []);

  const hasContent = useMemo(() => news.length > 0 || research.length > 0, [news, research]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 md:py-12">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100 sm:text-4xl">
            Latest News & Science
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Continuously updating headlines and newly published research related to hyperhidrosis.
            (Free sources: Google News RSS + Crossref.)
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="gap-2"
          onClick={() => loadAll(true)}
          disabled={loading || refreshing}
        >
          {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading updates...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-300/40 bg-red-50/40 p-4 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-950/20 dark:text-red-200">
          {error}
        </div>
      ) : !hasContent ? (
        <div className="rounded-xl border p-4 text-sm text-muted-foreground">
          No updates found yet. Try refreshing in a minute.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* NEWS */}
          <Card className="border-sky-200/60 bg-white/80 shadow-lg shadow-sky-100/40 backdrop-blur-sm dark:border-sky-800/40 dark:bg-slate-900/80 dark:shadow-sky-950/30">
            <CardHeader>
              <CardTitle className="text-sky-900 dark:text-sky-100">In the News</CardTitle>
              <CardDescription>Headlines pulled from Google News search (RSS).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {news.length === 0 ? (
                <p className="text-sm text-muted-foreground">No news items found.</p>
              ) : (
                <ul className="space-y-3">
                  {news.map((it) => (
                    <li key={it.link} className="rounded-xl border border-sky-200/60 p-4 dark:border-sky-800/40">
                      <a
                        href={it.link}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-start justify-between gap-3 font-medium text-sky-900 hover:underline dark:text-sky-100"
                      >
                        <span>{it.title}</span>
                        <ExternalLink className="mt-1 h-4 w-4 shrink-0 opacity-70" />
                      </a>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {it.source}
                        {it.pubDate ? ` • ${formatDate(it.pubDate)}` : ""}
                      </div>
                      {it.snippet ? (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{it.snippet}</p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* RESEARCH */}
          <Card className="border-sky-200/60 bg-white/80 shadow-lg shadow-sky-100/40 backdrop-blur-sm dark:border-sky-800/40 dark:bg-slate-900/80 dark:shadow-sky-950/30">
            <CardHeader>
              <CardTitle className="text-sky-900 dark:text-sky-100">Latest Research</CardTitle>
              <CardDescription>New publication metadata from Crossref.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {research.length === 0 ? (
                <p className="text-sm text-muted-foreground">No research items found.</p>
              ) : (
                <ul className="space-y-3">
                  {research.map((it) => (
                    <li
                      key={it.doi ?? it.url ?? it.title}
                      className="rounded-xl border border-sky-200/60 p-4 dark:border-sky-800/40"
                    >
                      <a
                        href={it.url ?? "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-start justify-between gap-3 font-medium text-sky-900 hover:underline dark:text-sky-100"
                      >
                        <span>{it.title}</span>
                        <ExternalLink className="mt-1 h-4 w-4 shrink-0 opacity-70" />
                      </a>

                      <div className="mt-1 text-xs text-muted-foreground">
                        {it.journal ? it.journal : "Research"}
                        {it.pubDate ? ` • ${formatDate(it.pubDate)}` : ""}
                        {it.doi ? ` • DOI: ${it.doi}` : ""}
                      </div>

                      {it.authors?.length ? (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {it.authors.join(", ")}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
