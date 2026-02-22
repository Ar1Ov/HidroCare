import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type AreaId = "palms" | "feet" | "underarms" | "face" | "other";

type ChartPoint = {
  date: string; // YYYY-MM-DD
  palms: number;
  feet: number;
  underarms: number;
  face: number;
  other: number;
};

function safeNumber(x: unknown): number {
  const n = typeof x === "number" ? x : Number(x);
  return Number.isFinite(n) ? n : 0;
}

function emptyPoint(date: string): ChartPoint {
  return { date, palms: 0, feet: 0, underarms: 0, face: 0, other: 0 };
}

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Pull recent notes (adjust limit as needed)
  const { data: notes, error } = await supabase
    .from("notes")
    .select("id, created_at, content")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(365);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const points: ChartPoint[] = [];

  for (const n of notes ?? []) {
    // content is stored as stringified JSON in your app
    let parsed: any = null;
    try {
      parsed = typeof n.content === "string" ? JSON.parse(n.content) : n.content;
    } catch {
      parsed = null;
    }

    // Prefer explicit date from content, else fall back to created_at date
    const createdDate = (n.created_at ?? "").slice(0, 10);
    const date = (typeof parsed?.date === "string" && parsed.date.slice(0, 10)) || createdDate;

    const p = emptyPoint(date);

    const areas = Array.isArray(parsed?.areas) ? parsed.areas : [];
    for (const a of areas) {
      const area = a?.area as AreaId | undefined;
      const severity = safeNumber(a?.severity);

      if (area === "palms") p.palms = severity;
      if (area === "feet") p.feet = severity;
      if (area === "underarms") p.underarms = severity;
      if (area === "face") p.face = severity;
      if (area === "other") p.other = severity;
    }

    // If multiple notes share the same date, keep the last one (or change to average)
    const idx = points.findIndex((x) => x.date === p.date);
    if (idx >= 0) points[idx] = p;
    else points.push(p);
  }

  // Sort by date
  points.sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({ points });
}