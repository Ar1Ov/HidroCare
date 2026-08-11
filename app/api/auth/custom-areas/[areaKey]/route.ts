import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(_request: Request, { params }: { params: Promise<{ areaKey: string }> }) {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const areaKey = decodeURIComponent((await params).areaKey).trim().toLowerCase();
  if (!/^custom:[a-z0-9][a-z0-9 '-]{0,39}$/.test(areaKey)) {
    return NextResponse.json({ error: "Invalid custom body area." }, { status: 400 });
  }

  const { data: notes, error: notesError } = await supabase.from("notes").select("id, content").eq("user_id", user.id);
  if (notesError) return NextResponse.json({ error: notesError.message }, { status: 500 });

  for (const note of notes ?? []) {
    try {
      const parsed = typeof note.content === "string" ? JSON.parse(note.content) : note.content;
      if (!parsed || !Array.isArray(parsed.areas)) continue;
      const filteredAreas = parsed.areas.filter((entry: { area?: unknown }) => entry?.area !== areaKey);
      if (filteredAreas.length === parsed.areas.length) continue;
      const { error: updateError } = await supabase.from("notes").update({ content: JSON.stringify({ ...parsed, areas: filteredAreas }) }).eq("id", note.id).eq("user_id", user.id);
      if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
    } catch {
      // Leave malformed legacy content unchanged.
    }
  }

  const db = supabase as any;
  const { error: deleteError } = await db.from("user_custom_areas").delete().eq("user_id", user.id).eq("area_key", areaKey);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 });
  return NextResponse.json({ removed: true });
}
