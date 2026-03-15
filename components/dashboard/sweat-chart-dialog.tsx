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

type RangeKey = "24h" | "7d" | "30d" | "90d" | "180d" | "365d" | "all";

const RANGE_OPTIONS: { value: RangeKey; label: string }[] = [
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "Past week" },
  { value: "30d", label: "Past month" },
  { value: "90d", label: "Past 3 months" },
  { value: "180d", label: "Past 6 months" },
  { value: "365d", label: "Past year" },
  { value: "all", label: "All time" },
];

function formatDateLabel(date: string, is24h: boolean) {
  if (is24h && date.includes(" ")) {
    const [, time] = date.split(" ");
    return time?.slice(0, 5) ?? date; // HH:mm
  }
  const [y, m, d] = date.split(/[- ]/).map(Number);
  if (!m || !d) return date;
  return `${m}/${d}`;
}

export function SweatChartDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState<ChartPoint[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [range, setRange] = useState<RangeKey>("30d");

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);

      try {
        const url = range === "all" ? "/api/auth/stats" : `/api/auth/stats?range=${range}`;
        const res = await fetch(url, { cache: "no-store" });
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
  }, [open, range]);

  const chartData = useMemo(() => points, [points]);
  const is24h = range === "24h";

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
          <div className="flex flex-wrap gap-1.5 pt-2">
            {RANGE_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                size="sm"
                variant={range === opt.value ? "default" : "outline"}
                className="h-8 text-xs"
                onClick={() => setRange(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
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
                <XAxis dataKey="date" tickFormatter={(v) => formatDateLabel(v, is24h)} />
                <YAxis domain={[0, 10]} />
                <Tooltip labelFormatter={(v) => (is24h ? `Time: ${v}` : `Date: ${v}`)} />
                <Legend />

                <Line
  type="monotone"
  dataKey="palms"
  name="Hands"
  dot={false}
  stroke="#059669"
  strokeWidth={3}
/>

<Line
  type="monotone"
  dataKey="feet"
  name="Feet"
  dot={false}
  stroke="#4F46E5"
  strokeWidth={3}
/>

<Line
  type="monotone"
  dataKey="underarms"
  name="Underarms"
  dot={false}
  stroke="#E11D48"
  strokeWidth={3}
/>

<Line
  type="monotone"
  dataKey="face"
  name="Face / Scalp"
  dot={false}
  stroke="#D97706"
  strokeWidth={3}
/>

<Line
  type="monotone"
  dataKey="other"
  name="Other"
  dot={false}
  stroke="#6B7280"
  strokeWidth={3}
/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}