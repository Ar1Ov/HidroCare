"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BarChart3, ClipboardList, EyeOff, HeartHandshake, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { SurveyCharts } from "@/components/survey/survey-charts";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/layout/site-footer";
import { emptySurveyStats, type SurveyStats } from "@/lib/survey/schema";

const POLL_MS = 10_000;

const SurveyFormDialog = dynamic(
  () => import("@/components/survey/survey-form-dialog").then((mod) => mod.SurveyFormDialog),
  { ssr: false },
);

export function SurveyPageContent({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  const [stats, setStats] = useState<SurveyStats>(emptySurveyStats());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async (mode: "initial" | "poll" | "manual" = "poll") => {
    try {
      if (mode === "manual") setRefreshing(true);
      if (mode === "initial") setLoading(true);
      setError(null);

      const res = await fetch("/api/survey/stats", { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.error || "Failed to load survey stats");
      }
      setStats(json.stats ?? emptySurveyStats());
      setUpdatedAt(json.updatedAt ?? new Date().toISOString());
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load survey stats";
      setError(msg);
      if (mode === "manual") toast.error(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStats("initial");
    const id = window.setInterval(() => loadStats("poll"), POLL_MS);
    return () => window.clearInterval(id);
  }, [loadStats]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-teal-200/40 bg-white/80 backdrop-blur-md dark:border-teal-800/30 dark:bg-slate-900/80">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-teal-800 dark:text-teal-200">
            <Image src="/hidrocare-logo.png" alt="" width={28} height={28} className="h-7 w-7 rounded-md object-contain" priority />
            <span>HidroCare</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm">
                Home
              </Button>
            </Link>
            <Link href={isAuthenticated ? "/dashboard" : "/login"}>
              <Button variant="outline" size="sm">
                {isAuthenticated ? "Dashboard" : "Log in"}
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 space-y-10 bg-gradient-to-b from-teal-50/70 via-white to-white px-4 py-10 dark:from-teal-950/30 dark:via-slate-950 dark:to-slate-950 md:py-14">
        <section className="container mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/70 bg-teal-50/80 px-3 py-1 text-sm text-teal-800 dark:border-teal-700/40 dark:bg-teal-950/50 dark:text-teal-200">
            <ClipboardList className="h-4 w-4" />
            Help shape hyperhidrosis research
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-teal-950 dark:text-teal-50 sm:text-4xl">
              Participate in our research survey
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              Share an anonymous response to help map patterns in excessive sweating — then explore
              live charts that update as more people participate.
            </p>
          </div>
          <div className="grid w-full gap-3 text-left sm:grid-cols-3">
            {[
              { icon: EyeOff, title: "Anonymous", text: "No name or email is collected." },
              { icon: HeartHandshake, title: "Your choice", text: "Every question can be skipped." },
              { icon: BarChart3, title: "See the impact", text: "View live, aggregated results." },
            ].map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-xl border border-teal-200/70 bg-white/80 p-4 shadow-sm dark:border-teal-800/50 dark:bg-slate-900/80"
              >
                <Icon className="mb-2 h-5 w-5 text-teal-600 dark:text-teal-400" />
                <p className="font-semibold text-teal-950 dark:text-teal-50">{title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <SurveyFormDialog onSubmitted={() => loadStats("manual")} />
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              disabled={loading || refreshing}
              onClick={() => loadStats("manual")}
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh charts
            </Button>
          </div>
          {updatedAt ? (
            <p className="text-xs text-muted-foreground">
              Last updated {new Date(updatedAt).toLocaleString()} · auto-refreshes every 10s
            </p>
          ) : null}
        </section>

        <section className="container mx-auto max-w-6xl">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading live results…
            </div>
          ) : error ? (
            <div className="rounded-xl border border-amber-300/50 bg-amber-50/50 p-4 text-sm text-amber-900 dark:border-amber-800/40 dark:bg-amber-950/20 dark:text-amber-100">
              <p className="font-medium">Charts could not load yet</p>
              <p className="mt-1 opacity-90">{error}</p>
              <p className="mt-2 text-xs opacity-80">
                Apply the <code>survey_responses</code> migration in your Supabase project, then refresh.
              </p>
            </div>
          ) : (
            <SurveyCharts stats={stats} />
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
