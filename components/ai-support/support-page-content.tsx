"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  History,
  ImagePlus,
  Loader2,
  MessageSquare,
  Plus,
  Pencil,
  Send,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

const SUGGESTIONS = [
  "What triggers excessive sweating?",
  "Tips for managing sweat at work",
  "When should I see a doctor?",
  "Lifestyle changes that help",
];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type Conversation = {
  id: string;
  title: string;
  updated_at: string;
};

type ChatMessage = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  image_path?: string | null;
  image_name?: string | null;
  imageUrl?: string | null;
};

function assistantText(data: any, ok: boolean) {
  if (typeof data?.reply === "string" && data.reply.trim()) return data.reply.trim();
  if (typeof data?.error === "string" && data.error.trim()) return data.error.trim();
  return ok ? "I could not generate a response. Please try again." : "Something went wrong. Please try again.";
}

export function SupportPageContent() {
  const supabase = useMemo(() => createClient(), []);
  const db = supabase as any;
  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    const { data, error } = await db
      .from("ai_conversations")
      .select("id,title,updated_at")
      .order("updated_at", { ascending: false })
      .limit(30);
    if (!error) setConversations((data ?? []) as Conversation[]);
    setHistoryLoading(false);
    return (data ?? []) as Conversation[];
  }, [db]);

  const loadMessages = useCallback(
    async (id: string) => {
      setConversationId(id);
      setMessages([]);
      const { data, error } = await db
        .from("ai_messages")
        .select("id,role,content,image_path,image_name")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true });
      if (error) {
        toast.error("Could not load this conversation.");
        return;
      }
      const loaded = await Promise.all(
        ((data ?? []) as ChatMessage[]).map(async (message) => {
          if (!message.image_path) return message;
          const { data: signed } = await supabase.storage
            .from("ai-chat-images")
            .createSignedUrl(message.image_path, 3600);
          return { ...message, imageUrl: signed?.signedUrl ?? null };
        }),
      );
      setMessages(loaded);
    },
    [db, supabase],
  );

  useEffect(() => {
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const list = await loadConversations();
      if (list[0]) await loadMessages(list[0].id);
    })();
  }, [loadConversations, loadMessages, supabase]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  function startNewChat() {
    setConversationId(null);
    setMessages([]);
    setInput("");
    setEditingMessageId(null);
    clearImage();
    textareaRef.current?.focus();
  }

  function clearImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function chooseImage(file?: File) {
    if (!file) return;
    if (!ACCEPTED_IMAGES.includes(file.type)) {
      toast.error("Choose a JPG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("Image must be 5 MB or smaller.");
      return;
    }
    clearImage();
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function beginEdit(message: ChatMessage) {
    if (!message.id || message.role !== "user") return;
    setEditingMessageId(message.id);
    setInput(message.content);
    clearImage();
    textareaRef.current?.focus();
  }

  async function deleteHistory(targetId?: string) {
    const deletingAll = !targetId;
    const confirmed = window.confirm(
      deletingAll
        ? "Delete all of your AI chat history and attached images? This cannot be undone."
        : "Delete this conversation and its attached images? This cannot be undone.",
    );
    if (!confirmed) return;

    setDeletingId(targetId ?? "all");
    try {
      const response = await fetch("/api/auth/ai/history", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(targetId ? { conversationId: targetId } : { all: true }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Could not delete chat history");

      if (deletingAll || conversationId === targetId) startNewChat();
      const remaining = await loadConversations();
      if (!deletingAll && conversationId === targetId && remaining[0]) {
        await loadMessages(remaining[0].id);
      }
      toast.success(deletingAll ? "All AI history deleted" : "Conversation deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete chat history");
    } finally {
      setDeletingId(null);
    }
  }

  async function sendMessage(text: string) {
    const message = text.trim();
    if ((!message && !image) || isLoading || !userId) return;

    const pendingPreview = imagePreview;
    const pendingName = image?.name ?? null;
    setMessages((current) => {
      if (editingMessageId) {
        const editIndex = current.findIndex((item) => item.id === editingMessageId);
        if (editIndex >= 0) {
          return [
            ...current.slice(0, editIndex),
            { ...current[editIndex], content: message },
            { role: "assistant", content: "Thinking…" },
          ];
        }
      }
      return [
        ...current,
        { role: "user", content: message, image_name: pendingName, imageUrl: pendingPreview },
        { role: "assistant", content: "Thinking…" },
      ];
    });
    setInput("");
    setIsLoading(true);

    try {
      let imagePath: string | null = null;
      if (image) {
        const safeName = image.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        imagePath = `${userId}/${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from("ai-chat-images")
          .upload(imagePath, image, { contentType: image.type, upsert: false });
        if (uploadError) throw new Error(uploadError.message);
      }

      const response = await fetch("/api/auth/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          conversationId,
          imagePath,
          imageName: pendingName,
          editMessageId: editingMessageId,
        }),
      });
      const data = await response.json().catch(() => ({}));
      const reply = assistantText(data, response.ok);
      setMessages((current) => {
        const next = [...current];
        next[next.length - 1] = { role: "assistant", content: reply };
        return next;
      });
      if (!response.ok) throw new Error(reply);
      const activeConversationId = data.conversationId ?? conversationId;
      setConversationId(activeConversationId);
      setEditingMessageId(null);
      clearImage();
      await loadConversations();
      if (activeConversationId) await loadMessages(activeConversationId);
    } catch (error) {
      const text = error instanceof Error ? error.message : "Network error. Please try again.";
      setMessages((current) => {
        const next = [...current];
        next[next.length - 1] = { role: "assistant", content: text };
        return next;
      });
      toast.error(text);
      if (conversationId) await loadMessages(conversationId);
    } finally {
      setIsLoading(false);
    }
  }

  const latestUserMessageId = [...messages].reverse().find((message) => message.role === "user")?.id;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 py-6 md:py-10">
      <div className="text-center">
        <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-800 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-200">
          <Sparkles className="h-4 w-4" /> Educational AI support
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-teal-950 dark:text-teal-50 sm:text-4xl">
          Ask, learn, and feel supported
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
          Ask about hyperhidrosis or attach an image for general educational context. This does not replace medical advice or diagnosis.
        </p>
      </div>

      <div className="grid min-h-[620px] overflow-hidden rounded-2xl border border-teal-200/70 bg-white/90 shadow-xl dark:border-teal-800/50 dark:bg-slate-900/90 md:grid-cols-[250px_1fr]">
        <aside className="border-b border-teal-200/60 bg-teal-50/70 p-4 dark:border-teal-800/40 dark:bg-slate-950/60 md:border-r md:border-b-0">
          <Button onClick={startNewChat} className="w-full gap-2 bg-teal-600 hover:bg-teal-700">
            <Plus className="h-4 w-4" /> New chat
          </Button>
          <div className="mt-5 flex items-center justify-between gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-2"><History className="h-4 w-4" /> Your history</span>
            {conversations.length > 0 ? (
              <button type="button" onClick={() => void deleteHistory()} disabled={Boolean(deletingId)} className="normal-case tracking-normal text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300">
                Clear all
              </button>
            ) : null}
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1 md:max-h-[500px] md:flex-col md:overflow-y-auto">
            {historyLoading ? (
              <Loader2 className="m-3 h-4 w-4 animate-spin text-teal-600" />
            ) : conversations.length === 0 ? (
              <p className="p-2 text-sm text-muted-foreground">No saved conversations yet.</p>
            ) : (
              conversations.map((conversation) => (
                <div key={conversation.id} className={`group flex min-w-48 items-center rounded-lg transition md:min-w-0 ${conversationId === conversation.id ? "bg-teal-600 text-white" : "hover:bg-teal-100 dark:hover:bg-teal-900/40"}`}>
                  <button type="button" onClick={() => void loadMessages(conversation.id)} className="min-w-0 flex-1 px-3 py-2 text-left text-sm">
                    <span className={`block truncate ${conversationId === conversation.id ? "font-semibold" : ""}`}>{conversation.title}</span>
                    <span className={`mt-0.5 block text-xs ${conversationId === conversation.id ? "text-teal-50" : "text-muted-foreground"}`}>{new Date(conversation.updated_at).toLocaleDateString()}</span>
                  </button>
                  <button type="button" onClick={() => void deleteHistory(conversation.id)} disabled={Boolean(deletingId)} className={`mr-1 rounded-md p-2 opacity-70 transition hover:opacity-100 disabled:opacity-30 ${conversationId === conversation.id ? "hover:bg-teal-700" : "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"}`} aria-label={`Delete ${conversation.title}`}>
                    {deletingId === conversation.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        <section className="flex min-w-0 flex-col">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
              <div className="rounded-2xl bg-teal-100 p-4 text-teal-700 dark:bg-teal-900/50 dark:text-teal-200">
                <Bot className="h-8 w-8" />
              </div>
              <h2 className="mt-4 text-xl font-semibold">How can I help today?</h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">Choose a prompt or ask your own question to get started.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      setInput(suggestion);
                      textareaRef.current?.focus();
                    }}
                    className="rounded-full border border-teal-300 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-800 transition hover:bg-teal-100 dark:border-teal-700 dark:bg-teal-950/50 dark:text-teal-200 dark:hover:bg-teal-900/60"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
              {messages.map((message, index) => (
                <div key={message.id ?? index} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.role === "assistant" ? (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-200"><Bot className="h-4 w-4" /></div>
                  ) : null}
                  <div className="group/message relative max-w-[82%]">
                  <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${message.role === "user" ? "rounded-br-md bg-teal-600 text-white" : "rounded-bl-md border bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"}`}>
                    {message.imageUrl ? <img src={message.imageUrl} alt={message.image_name ?? "Uploaded image"} className="mb-3 max-h-64 rounded-lg object-contain" /> : null}
                    {message.content ? <p className="whitespace-pre-wrap">{message.content}</p> : null}
                  </div>
                  {message.role === "user" && message.id === latestUserMessageId && !isLoading ? (
                    <button type="button" onClick={() => beginEdit(message)} className="absolute -bottom-8 right-0 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground opacity-0 transition hover:bg-muted hover:text-foreground group-hover/message:opacity-100 focus:opacity-100" aria-label="Edit most recent message">
                      <Pencil className="h-3 w-3" /> Edit
                    </button>
                  ) : null}
                  </div>
                  {message.role === "user" ? (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-100"><UserRound className="h-4 w-4" /></div>
                  ) : null}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          <div className="border-t border-teal-200/60 bg-white/80 p-4 dark:border-teal-800/40 dark:bg-slate-900/80">
            {editingMessageId ? (
              <div className="mb-2 flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                <span>Editing your most recent message; sending will replace the previous reply.</span>
                <button type="button" onClick={() => { setEditingMessageId(null); setInput(""); }} className="rounded p-1 hover:bg-amber-100 dark:hover:bg-amber-900/50" aria-label="Cancel editing"><X className="h-4 w-4" /></button>
              </div>
            ) : null}
            {imagePreview ? (
              <div className="mb-3 inline-flex items-start gap-2 rounded-xl border border-teal-200 bg-teal-50 p-2 dark:border-teal-800 dark:bg-teal-950/40">
                <img src={imagePreview} alt="Selected upload" className="h-20 w-20 rounded-lg object-cover" />
                <button type="button" onClick={clearImage} className="rounded-full p-1 text-muted-foreground hover:bg-white hover:text-foreground dark:hover:bg-slate-800" aria-label="Remove image"><X className="h-4 w-4" /></button>
              </div>
            ) : null}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void sendMessage(input);
              }}
              className="flex items-end gap-2 rounded-2xl border border-teal-300 bg-background p-2 shadow-sm focus-within:ring-2 focus-within:ring-teal-500/30 dark:border-teal-700"
            >
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => chooseImage(event.target.files?.[0])} />
              <Button type="button" size="icon" variant="ghost" className="shrink-0 rounded-xl text-teal-700 dark:text-teal-300" onClick={() => fileInputRef.current?.click()} disabled={isLoading} aria-label="Attach image"><ImagePlus className="h-5 w-5" /></Button>
              <Textarea ref={textareaRef} value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about hyperhidrosis…" maxLength={1200} disabled={isLoading} className="max-h-36 min-h-11 resize-none border-0 bg-transparent px-1 py-3 shadow-none focus-visible:ring-0" onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(input); } }} />
              <Button type="submit" size="icon" className="shrink-0 rounded-xl bg-teal-600 hover:bg-teal-700" disabled={isLoading || (!input.trim() && !image)} aria-label="Send message">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </form>
            <p className="mt-2 text-center text-xs text-muted-foreground">Images are private to your account. AI can make mistakes; seek a clinician for diagnosis or urgent concerns.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
