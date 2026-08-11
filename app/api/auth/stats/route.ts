import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type ChartPoint = {
  date: string; // YYYY-MM-DD or "YYYY-MM-DD HH:mm" for 24h
  palms: number;
  feet: number;
  underarms: number;
  face: number;
  [key: string]: string | number;
};

const RANGE_MS: Record<string, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
  "90d": 90 * 24 * 60 * 60 * 1000,
  "180d": 180 * 24 * 60 * 60 * 1000,
  "365d": 365 * 24 * 60 * 60 * 1000,
};

function safeNumber(x: unknown): number {
  const n = typeof x === "number" ? x : Number(x);
  return Number.isFinite(n) ? n : 0;
}

function emptyPoint(date: string): ChartPoint {
  return { date, palms: 0, feet: 0, underarms: 0, face: 0 };
}

/** Parse note date+time or created_at into a timestamp for filtering */
function getNoteTimestamp(note: { content: unknown; created_at: string | null }, parsed: Record<string, unknown> | null): number {
  const dateStr = typeof parsed?.date === "string" ? parsed.date.slice(0, 10) : null;
  const timeStr = typeof parsed?.time === "string" ? parsed.time : null;
  const fallback = (note.created_at ?? "").slice(0, 19).replace("T", " ");

  let iso: string;
  if (dateStr && timeStr) {
    iso = `${dateStr}T${timeStr}:00`;
  } else if (dateStr) {
    iso = `${dateStr}T12:00:00`;
  } else {
    iso = fallback.replace(" ", "T") || new Date().toISOString();
  }
  return new Date(iso).getTime();
}

export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "all";
  const now = Date.now();
  const rangeStart = range === "all" ? 0 : now - (RANGE_MS[range] ?? RANGE_MS["365d"]);

  // Pull notes (fetch enough for all-time; filter in memory)
  const { data: notes, error } = await supabase
    .from("notes")
    .select("id, created_at, content")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(500);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const points: ChartPoint[] = [];
  const customAreaLabels = new Map<string, string>();
  const customAreaColors = new Map<string, number>();
  const useTime = range === "24h";

  for (const n of notes ?? []) {
    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = typeof n.content === "string" ? JSON.parse(n.content) : n.content;
    } catch {
      parsed = null;
    }

    const ts = getNoteTimestamp(n, parsed);
    if (range !== "all" && ts < rangeStart) continue;

    const createdDate = (n.created_at ?? "").slice(0, 10);
    const dateStr = typeof parsed?.date === "string" ? parsed.date.slice(0, 10) : createdDate;
    const timeStr = typeof parsed?.time === "string" ? parsed.time : "12:00";
    const pointKey = useTime ? `${dateStr} ${timeStr}` : dateStr;

    const p = emptyPoint(pointKey);

    const areas = Array.isArray(parsed?.areas) ? parsed.areas : [];
    for (const a of areas) {
      const area = (a as { area?: string })?.area;
      const severity = safeNumber((a as { severity?: unknown })?.severity);

      if (area === "palms") p.palms = severity;
      if (area === "feet") p.feet = severity;
      if (area === "underarms") p.underarms = severity;
      if (area === "face") p.face = severity;
      if (typeof area === "string" && area.startsWith("custom:")) {
        const rawLabel = (a as { label?: unknown }).label;
        const label = typeof rawLabel === "string" && rawLabel.trim()
          ? rawLabel.trim()
          : area.slice("custom:".length);
        const key = `custom_${area.slice("custom:".length).replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "").toLowerCase()}`;
        if (key !== "custom_") {
          p[key] = severity;
          customAreaLabels.set(key, label);
          const rawColor = (a as { colorIndex?: unknown }).colorIndex;
          if (typeof rawColor === "number" && rawColor >= 0 && rawColor <= 4) customAreaColors.set(key, rawColor);
        }
      }
    }

    const idx = points.findIndex((x) => x.date === p.date);
    if (idx >= 0) points[idx] = p;
    else points.push(p);
  }

  points.sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({
    points,
    customAreas: Array.from(customAreaLabels, ([key, label], index) => ({ key, label, colorIndex: customAreaColors.get(key) ?? index % 5 })),
  });
}
