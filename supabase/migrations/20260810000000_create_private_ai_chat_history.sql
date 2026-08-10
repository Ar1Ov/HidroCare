-- Private, per-user AI Support conversations and image attachments.
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'New conversation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL DEFAULT '',
  image_path TEXT,
  image_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ai_conversations_user_updated_idx
  ON public.ai_conversations (user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS ai_messages_conversation_created_idx
  ON public.ai_messages (conversation_id, created_at);

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage only their AI conversations" ON public.ai_conversations;
CREATE POLICY "Users manage only their AI conversations"
  ON public.ai_conversations FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage only their AI messages" ON public.ai_messages;
CREATE POLICY "Users manage only their AI messages"
  ON public.ai_messages FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.ai_conversations c
      WHERE c.id = conversation_id AND c.user_id = auth.uid()
    )
  );

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ai-chat-images',
  'ai-chat-images',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Users upload their own AI images" ON storage.objects;
CREATE POLICY "Users upload their own AI images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'ai-chat-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users read their own AI images" ON storage.objects;
CREATE POLICY "Users read their own AI images"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'ai-chat-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users delete their own AI images" ON storage.objects;
CREATE POLICY "Users delete their own AI images"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'ai-chat-images'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

NOTIFY pgrst, 'reload schema';
