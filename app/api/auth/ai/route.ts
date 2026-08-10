import crypto from "crypto";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const DAILY_LIMIT = 500;
const DAILY_COST_CENTS_LIMIT = 50;
const MAX_INPUT_CHARS = 1200;
const MAX_OUTPUT_TOKENS = 700;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MIN_SECONDS_BETWEEN_REQUESTS = 2;

type GateResult = {
  allowed: boolean;
  reason: string | null;
  new_count: number;
  new_cost_cents: number;
};

function roughTokenEstimate(text: string) {
  return Math.ceil((text.length || 0) / 4);
}

function getResponseText(response: any): string {
  if (typeof response?.output_text === "string" && response.output_text.trim()) {
    return response.output_text.trim();
  }
  for (const item of response?.output ?? []) {
    for (const part of item?.content ?? []) {
      if (typeof part?.text === "string" && part.text.trim()) return part.text.trim();
    }
  }
  return "";
}

function completeSentenceReply(text: string): string {
  const cleaned = text.trim().replace(/\s+/g, " ");
  if (!cleaned) return "";
  const complete = cleaned.match(/[^.!?]+[.!?]+(?:[\"')\]]+)?/g) ?? [];
  if (complete.length > 0) return complete.slice(0, 8).join(" ").trim();
  return `${cleaned.replace(/[,:;\-\s]+$/, "")}.`;
}

function fallbackResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("doctor")) {
    return "Consider seeing a clinician if sweating starts suddenly, worsens quickly, happens at night, or significantly affects daily life. Seek urgent care for sweating with chest pain, fainting, severe weakness, or trouble breathing. A clinician can help identify possible causes and treatment options. This is educational information, not medical advice.";
  }
  if (lower.includes("trigger")) {
    return "Common sweating triggers include heat, humidity, stress, anxiety, exercise, caffeine, spicy foods, and some medications. Keeping a brief sweat log can help you identify your own patterns. Sudden or unexplained changes are worth discussing with a clinician. This is educational information, not medical advice.";
  }
  return "Hyperhidrosis is sweating beyond what the body needs for cooling. Helpful options can include clinical-strength antiperspirants, breathable clothing, trigger tracking, iontophoresis, and medical treatment. A clinician can help if symptoms are new, severe, or disruptive. This is educational information, not medical advice.";
}

export async function POST(req: Request) {
  const requestId = crypto.randomBytes(8).toString("hex");
  let fallbackMessage = "";

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return Response.json({ error: "Missing OPENAI_API_KEY" }, { status: 503 });

    const body = await req.json().catch(() => null);
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const requestedConversationId =
      typeof body?.conversationId === "string" ? body.conversationId : null;
    const imagePath = typeof body?.imagePath === "string" ? body.imagePath : null;
    const imageName = typeof body?.imageName === "string" ? body.imageName.slice(0, 200) : null;
    fallbackMessage = message;

    if (!message && !imagePath) {
      return Response.json({ error: "A message or image is required" }, { status: 400 });
    }
    if (message.length > MAX_INPUT_CHARS) {
      return Response.json(
        { error: `Message too long. Maximum ${MAX_INPUT_CHARS} characters.` },
        { status: 413 },
      );
    }

    let conversationId = requestedConversationId;
    if (conversationId) {
      const { data: existing } = await (supabase as any)
        .from("ai_conversations")
        .select("id")
        .eq("id", conversationId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!existing) conversationId = null;
    }

    if (!conversationId) {
      const { data: created, error: createError } = await (supabase as any)
        .from("ai_conversations")
        .insert({
          user_id: user.id,
          title: (message || imageName || "Image question").slice(0, 60),
        })
        .select("id")
        .single();
      if (createError) {
        return Response.json(
          { error: "Chat history is not set up yet. Apply the AI chat history migration." },
          { status: 503 },
        );
      }
      conversationId = created.id;
    }

    let imageDataUrl: string | null = null;
    if (imagePath) {
      if (!imagePath.startsWith(`${user.id}/`)) {
        return Response.json({ error: "Invalid image path" }, { status: 403 });
      }
      const { data: imageBlob, error: imageError } = await supabase.storage
        .from("ai-chat-images")
        .download(imagePath);
      if (imageError || !imageBlob) {
        return Response.json({ error: "Image could not be loaded" }, { status: 400 });
      }
      if (imageBlob.size > MAX_IMAGE_BYTES) {
        return Response.json({ error: "Image must be 5 MB or smaller" }, { status: 413 });
      }
      const bytes = Buffer.from(await imageBlob.arrayBuffer());
      imageDataUrl = `data:${imageBlob.type};base64,${bytes.toString("base64")}`;
    }

    await (supabase as any).from("ai_messages").insert({
      conversation_id: conversationId,
      user_id: user.id,
      role: "user",
      content: message,
      image_path: imagePath,
      image_name: imageName,
    });

    const finish = async (rawReply: string, fallback: boolean, source: string) => {
      const reply = completeSentenceReply(rawReply);
      await (supabase as any).from("ai_messages").insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: "assistant",
        content: reply,
      });
      await (supabase as any)
        .from("ai_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId)
        .eq("user_id", user.id);
      return Response.json({
        reply,
        fallback,
        source,
        request_id: requestId,
        conversationId,
      });
    };

    const day = new Date().toISOString().slice(0, 10);
    const gateResponse = await (supabase as any)
      .rpc("ai_check_and_increment", {
        p_user_id: user.id,
        p_day: day,
        p_daily_message_limit: DAILY_LIMIT,
        p_daily_cost_cents_limit: DAILY_COST_CENTS_LIMIT,
        p_add_messages: 1,
        p_add_input_tokens: roughTokenEstimate(message) + (imagePath ? 1000 : 200),
        p_add_output_tokens: MAX_OUTPUT_TOKENS,
        p_min_seconds_between_requests: MIN_SECONDS_BETWEEN_REQUESTS,
      })
      .single();
    const gate = gateResponse?.data as GateResult | null;
    if (gate && !gate.allowed) return finish(fallbackResponse(message), true, "gate");

    const userContent: any[] = [
      {
        type: "input_text",
        text: message || "Explain any hyperhidrosis-relevant visible details in this image.",
      },
    ];
    if (imageDataUrl) {
      userContent.push({ type: "input_image", image_url: imageDataUrl, detail: "auto" });
    }

    const openai = new OpenAI({ apiKey });
    const input: any[] = [
      {
        role: "developer",
        content:
          "You are a friendly hyperhidrosis education assistant. Give calm, practical guidance without diagnosing. Reply in no more than 8 complete sentences, usually 3 to 6. Never stop mid-sentence. If an image is provided, discuss only relevant visible details and clearly state uncertainty. This is educational support, not medical advice.",
      },
      { role: "user", content: userContent },
    ];

    let response: any = await openai.responses.create({
      model: "gpt-5-nano",
      input,
      reasoning: { effort: "low" },
      text: { verbosity: "low" },
      max_output_tokens: MAX_OUTPUT_TOKENS,
    });
    let reply = getResponseText(response);

    const cutOff =
      response?.status === "incomplete" || (reply.length > 0 && !/[.!?][\"')\]]?$/.test(reply));
    if (cutOff) {
      response = await openai.responses.create({
        model: "gpt-5-nano",
        input: [
          ...input,
          {
            role: "developer",
            content:
              "Rewrite the answer from the beginning in at most 8 short, complete sentences. Finish the final sentence.",
          },
        ],
        reasoning: { effort: "low" },
        text: { verbosity: "low" },
        max_output_tokens: 900,
      });
      reply = getResponseText(response);
    }

    if (!reply) return finish(fallbackResponse(message), true, "ai_empty");
    return finish(reply, false, "ai");
  } catch (error: any) {
    console.error("AI Support error:", error?.message);
    return Response.json({
      reply: fallbackResponse(fallbackMessage),
      fallback: true,
      source: "catch",
      request_id: requestId,
    });
  }
}
