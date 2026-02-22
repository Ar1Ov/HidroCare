"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type ChartPoint = {
  date: string;
  palms: number;
  feet: number;
  underarms: number;
  face: number;
  other: number;
};

function formatDateLabel(date: string) {
  // YYYY-MM-DD -> M/D
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return date;
  return `${m}/${d}`;
}

export function SweatChartDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState<ChartPoint[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);

      try {
        const res = await fetch("/api/auth/stats/", { cache: "no-store" });
        const json = await res.json();

        if (!res.ok) throw new Error(json?.error || "Failed to load stats");

        if (!cancelled) setPoints(Array.isArray(json.points) ? json.points : []);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Failed to load stats");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const chartData = useMemo(() => {
    // If you want last 30 entries only:
    // return points.slice(Math.max(0, points.length - 30));
    return points;
  }, [points]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          View Progress Chart
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Sweat Severity Over Time</DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="text-sm text-muted-foreground">Loading chart…</div>
        )}

        {!loading && err && (
          <div className="text-sm text-red-500">{err}</div>
        )}

        {!loading && !err && chartData.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No log data yet. Create a note with severity values to see the chart.
          </div>
        )}

        {!loading && !err && chartData.length > 0 && (
          <div className="h-[420px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDateLabel} />
                <YAxis domain={[0, 10]} />
                <Tooltip labelFormatter={(v) => `Date: ${v}`} />
                <Legend />

                <Line type="monotone" dataKey="palms" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="feet" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="underarms" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="face" dot={false} strokeWidth={2} />
                <Line type="monotone" dataKey="other" dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}