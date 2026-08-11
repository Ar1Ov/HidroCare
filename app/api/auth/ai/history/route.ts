import { createClient } from "@/lib/supabase/server";

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const conversationId =
    typeof body?.conversationId === "string" ? body.conversationId : null;
  const clearAll = body?.all === true;
  const db = supabase as any;

  if (!conversationId && !clearAll) {
    return Response.json({ error: "Choose a conversation to delete" }, { status: 400 });
  }

  let query = db.from("ai_conversations").select("id").eq("user_id", user.id);
  if (!clearAll) query = query.eq("id", conversationId);
  const { data: owned, error: conversationError } = await query;
  if (conversationError) return Response.json({ error: conversationError.message }, { status: 500 });

  const ids = (owned ?? []).map((row: { id: string }) => row.id);
  if (ids.length === 0) return Response.json({ deleted: 0 });

  const { data: messages } = await db
    .from("ai_messages")
    .select("image_path")
    .in("conversation_id", ids)
    .not("image_path", "is", null);
  const imagePaths = Array.from(
    new Set(
      (messages ?? [])
        .map((message: { image_path: string | null }) => message.image_path)
        .filter((path: string | null): path is string => Boolean(path)),
    ),
  ) as string[];

  if (imagePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from("ai-chat-images")
      .remove(imagePaths);
    if (storageError) {
      return Response.json({ error: "Could not delete attached images" }, { status: 500 });
    }
  }

  const { error: deleteError } = await db
    .from("ai_conversations")
    .delete()
    .eq("user_id", user.id)
    .in("id", ids);
  if (deleteError) return Response.json({ error: deleteError.message }, { status: 500 });

  return Response.json({ deleted: ids.length });
}
