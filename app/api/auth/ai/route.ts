import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import crypto from "crypto";

const DAILY_LIMIT = 500; // tickets/day
const DAILY_COST_CENTS_LIMIT = 50; // $0.50/day hard cap
const MAX_INPUT_CHARS = 800;
const MAX_OUTPUT_TOKENS = 150;
const MIN_SECONDS_BETWEEN_REQUESTS = 2;

type GateResult = {
  allowed: boolean;
  reason: string | null;
  new_count: number;
  new_cost_cents: number;
};

function roughTokenEstimate(text: string) {
  return Math.ceil((text?.length ?? 0) / 4);
}

function hashPrompt(message: string, model: string) {
  const normalized = message.trim().toLowerCase().replace(/[^\w\s]/g, "");
  return crypto.createHash("sha256").update(`${model}|${normalized}`).digest("hex");
}

function freeModeResponse(message: string): string {
  const lower = (message || "").toLowerCase();

  if (lower.includes("trigger") || lower.includes("cause")) {
    return `
Common triggers for excessive sweating include:

• Stress and anxiety
• Heat and humidity
• Spicy foods
• Caffeine
• Tight or synthetic clothing

If sweating occurs without clear triggers or starts suddenly, consider speaking with a clinician.
`.trim();
  }

  if (lower.includes("doctor") || lower.includes("see a doctor")) {
    return `
You should consider seeing a doctor if:

• Sweating is sudden or worsening
• It happens at night with fever or weight loss
• You feel chest pain, fainting, or weakness
• It significantly affects daily life

A healthcare professional can help rule out underlying causes.
`.trim();
  }

  if (lower.includes("work") || lower.includes("manage")) {
    return `
Helpful strategies for managing sweat at work:

• Wear breathable fabrics
• Use clinical-strength antiperspirant at night
• Keep wipes or extra clothing available
• Practice calming breathing techniques

Small environmental adjustments can make a big difference.
`.trim();
  }

  if (lower.includes("lifestyle")) {
    return `
Lifestyle changes that can help reduce sweating:

• Dress for airflow (breathable fabrics, layers): reduces heat buildup that triggers sweat.
• Limit common food/drink triggers (caffeine, spicy foods): these can stimulate sweat glands.
• Stress downshift routines (slow breathing, short walks, grounding): lowers “fight-or-flight” signals that worsen sweating.

If symptoms are severe or new/sudden, consider speaking with a clinician.
`.trim();
  }

  return `
Hyperhidrosis is a condition involving excessive sweating beyond normal temperature regulation.

Management options include:
• Prescription-strength antiperspirants
• Iontophoresis
• Stress management
• Medical consultation if symptoms are severe

This information is educational, not medical advice.
`.trim();
}

function isPresetQuestion(message: string): boolean {
  const lower = (message || "").toLowerCase();

  // Your 4 quick buttons (and close variants)
  const presetPhrases = [
    "what triggers excessive sweating",
    "tips for managing sweat at work",
    "when should i see a doctor",
    "lifestyle changes that help",
  ];
  if (presetPhrases.some((p) => lower.includes(p))) return true;

  // Also treat these keywords as preset-worthy (so it “works first”)
  if (lower.includes("trigger") || lower.includes("cause")) return true;
  if (lower.includes("doctor") || lower.includes("see a doctor")) return true;
  if (lower.includes("work") || lower.includes("manage")) return true;
  if (lower.includes("lifestyle")) return true;

  return false;
}

/**
 * Robust across different OpenAI SDK response shapes.
 * (Avoids touching typed fields like ResponseOutputItem.content)
 */
function getResponseText(r: any): string {
  const ot = r?.output_text;
  if (typeof ot === "string" && ot.trim()) return ot.trim();

  const out = r?.output;
  const parts: string[] = [];

  if (Array.isArray(out)) {
    for (const block of out) {
      const content = (block as any)?.content;
      if (!Array.isArray(content)) continue;

      for (const c of content) {
        // 1) { type: "output_text", text: "..." }
        if (typeof c?.text === "string" && c.text.trim()) parts.push(c.text.trim());

        // 2) { text: { value: "..." } }
        const v = c?.text?.value;
        if (typeof v === "string" && v.trim()) parts.push(v.trim());

        // 3) { value: "..." }
        const val = c?.value;
        if (typeof val === "string" && val.trim()) parts.push(val.trim());
      }
    }
  }

  const joined = parts.join("\n").trim();
  if (joined) return joined;

  const msg = r?.message?.content;
  if (typeof msg === "string" && msg.trim()) return msg.trim();

  return "";
}

export async function POST(req: Request) {
  let userMessage = "";

  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr) return Response.json({ error: userErr.message }, { status: 401 });
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Missing OPENAI_API_KEY in environment" }, { status: 503 });
    }

    const body = await req.json().catch(() => null);
    const message = body?.message;

    if (!message || typeof message !== "string") {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const trimmed = message.trim();
    userMessage = trimmed;

    if (!trimmed) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    if (trimmed.length > MAX_INPUT_CHARS) {
      return Response.json(
        { error: `Message too long. Max ${MAX_INPUT_CHARS} characters.` },
        { status: 413 }
      );
    }

    // ✅ 0) PING FIRST (so you can test quickly even if presets match)
    if (trimmed === "__ping__") {
      const openai = new OpenAI({ apiKey });
      const r: any = await openai.responses.create({
        model: "gpt-5-nano",
        input: "Reply with exactly: OK",
        max_output_tokens: 64,
      });

      const reply = getResponseText(r) || "OK";
      return Response.json({ reply, fallback: false, source: "ai_ping" });
    }

    // ✅ 1) PRESETS FIRST (no limiter, no OpenAI)
    if (isPresetQuestion(trimmed)) {
      return Response.json({
        reply: freeModeResponse(trimmed),
        fallback: false,
        source: "preset",
      });
    }

    // ✅ 2) LIMITER ONLY FOR NON-PRESET QUESTIONS
    const dayStr = new Date().toISOString().slice(0, 10); // UTC YYYY-MM-DD
    const estInputTokens = roughTokenEstimate(trimmed) + 200;
    const estOutputTokens = Math.max(64, MAX_OUTPUT_TOKENS);

    const rpc = (supabase as any).rpc.bind(supabase as any);

    const gateResp = await rpc("ai_check_and_increment", {
      p_user_id: user.id,
      p_day: dayStr,
      p_daily_message_limit: DAILY_LIMIT,
      p_daily_cost_cents_limit: DAILY_COST_CENTS_LIMIT,
      p_add_messages: 1,
      p_add_input_tokens: estInputTokens,
      p_add_output_tokens: estOutputTokens,
      p_min_seconds_between_requests: MIN_SECONDS_BETWEEN_REQUESTS,
    }).single();

    const gateErr = gateResp?.error as { message?: string } | null;
    if (gateErr) {
      return Response.json({ error: gateErr.message || "Limiter error" }, { status: 500 });
    }

    const gate = (gateResp?.data ?? null) as GateResult | null;
    if (!gate) {
      return Response.json({ error: "Limiter returned no data." }, { status: 500 });
    }

    if (!gate.allowed) {
      const reason = gate.reason || "limit";
      return Response.json({
        reply: freeModeResponse(trimmed),
        fallback: true,
        source: "gate",
        fallbackMessage:
          reason === "rate_limited"
            ? "⚠ You're sending messages too fast. Please wait a moment and try again."
            : "⚠ Daily AI limit reached. Try again tomorrow.",
        reason,
        remainingToday: 0,
      });
    }

    // ✅ 3) CACHE (best effort)
    const model = "gpt-5-nano";
    const promptHash = hashPrompt(trimmed, model);

    const { data: cached, error: cacheErr } = await (supabase as any)
      .from("ai_response_cache")
      .select("response_text")
      .eq("prompt_hash", promptHash)
      .maybeSingle();

    if (!cacheErr && cached?.response_text) {
      return Response.json({
        reply: cached.response_text,
        fallback: false,
        source: "cache",
        cached: true,
        remainingToday: Math.max(0, DAILY_LIMIT - gate.new_count),
      });
    }

    // ✅ 4) OPENAI CALL
    const openai = new OpenAI({ apiKey });

    const prompt = [
      "You are a friendly and supportive hyperhidrosis education assistant.",
      "Give calm, practical guidance and coping strategies.",
      "Do NOT diagnose, and do NOT prescribe medication.",
      "If symptoms are sudden, severe, include chest pain, fainting, fever, weight loss, or occur at night, advise seeing a clinician promptly.",
      "Keep replies concise (under ~8 sentences) unless the user asks for more.",
      "",
      `User: ${trimmed}`,
    ].join("\n");

    const response: any = await openai.responses.create({
      model,
      input: prompt,
      max_output_tokens: estOutputTokens,
    });

    const reply = getResponseText(response);

    // ✅ If parsing fails, DON'T show the scary empty-content message; fall back to preset-style text
    if (!reply) {
      return Response.json({
        reply: freeModeResponse(trimmed),
        fallback: true,
        source: "ai_empty",
        cached: false,
        fallbackMessage:
          "⚠ AI response was empty. Showing a standard help answer instead.",
        reason: "empty_ai",
      });
    }

    // ✅ 5) Reconcile usage (best effort)
    const realIn = response?.usage?.input_tokens ?? estInputTokens;
    const realOut = response?.usage?.output_tokens ?? estOutputTokens;

    const deltaIn = Math.max(0, realIn - estInputTokens);
    const deltaOut = Math.max(0, realOut - estOutputTokens);

    if (deltaIn > 0 || deltaOut > 0) {
      await rpc("ai_check_and_increment", {
        p_user_id: user.id,
        p_day: dayStr,
        p_daily_message_limit: DAILY_LIMIT,
        p_daily_cost_cents_limit: DAILY_COST_CENTS_LIMIT,
        p_add_messages: 0,
        p_add_input_tokens: deltaIn,
        p_add_output_tokens: deltaOut,
        p_min_seconds_between_requests: 0,
      });
    }

    // ✅ 6) Cache write (best effort)
    try {
      await (supabase as any).from("ai_response_cache").insert({
        prompt_hash: promptHash,
        model,
        response_text: reply,
        input_tokens: realIn,
        output_tokens: realOut,
      });
    } catch {
      // ignore
    }

    return Response.json({
      reply,
      fallback: false,
      source: "ai",
      cached: false,
      remainingToday: Math.max(0, DAILY_LIMIT - gate.new_count),
    });
  } catch (err: any) {
    const msg = err?.error?.message || err?.message || "AI unavailable";
    const code = err?.error?.code || err?.code;

    console.error("AI error:", code, msg);

    return Response.json({
      reply: freeModeResponse(userMessage),
      fallback: true,
      source: "catch",
      fallbackMessage: "⚠ AI is unavailable right now.",
      reason: code || "ai_error",
    });
  }
}