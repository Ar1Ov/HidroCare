import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const DAILY_LIMIT = 5; // tickets/day
const DAILY_COST_CENTS_LIMIT = 10; // $0.10/day hard cap
const MAX_INPUT_CHARS = 800; // keep small to control cost
const MAX_OUTPUT_TOKENS = 250; // biggest cost lever (lower = cheaper)
const MIN_SECONDS_BETWEEN_REQUESTS = 2;

type GateResult = {
  allowed: boolean;
  reason: string | null;
  new_count: number;
  new_cost_cents: number;
};

function roughTokenEstimate(text: string) {
  // ~4 chars/token heuristic (good enough for pre-reservation)
  return Math.ceil((text?.length ?? 0) / 4);
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

export async function POST(req: Request) {
  // Make message available to the catch block for fallback
  let userMessage = "";

  try {
    const supabase = await createClient();

    // Require logged-in user (keeps abuse down)
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr) return Response.json({ error: userErr.message }, { status: 401 });
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    // OpenAI key must exist (server-side only)
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "Missing OPENAI_API_KEY in .env.local" }, { status: 503 });
    }

    // Parse input
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

    // Daily bucketing (UTC) for consistent limits
    const dayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // Reserve worst-case BEFORE calling OpenAI (prevents budget spikes)
    const estInputTokens = roughTokenEstimate(trimmed) + 200; // system buffer
    const estOutputTokens = MAX_OUTPUT_TOKENS;

    // NOTE: cast supabase to any so TypeScript doesn't fail builds until you regenerate DB types
    const { data: gate, error: gateErr } = await (supabase as any)
      .rpc("ai_check_and_increment", {
        p_user_id: user.id,
        p_day: dayStr,
        p_daily_message_limit: DAILY_LIMIT,
        p_daily_cost_cents_limit: DAILY_COST_CENTS_LIMIT,
        p_add_messages: 1,
        p_add_input_tokens: estInputTokens,
        p_add_output_tokens: estOutputTokens,
        p_min_seconds_between_requests: MIN_SECONDS_BETWEEN_REQUESTS,
      })
      .single<GateResult>();

    if (gateErr) {
      return Response.json({ error: gateErr.message }, { status: 500 });
    }
    if (!gate) {
      return Response.json({ error: "Limiter returned no data." }, { status: 500 });
    }

    // If tickets/budget ran out (or rate limited), fall back instead of hard-blocking
    if (!gate.allowed) {
      const reason = gate.reason || "limit";
      const fallbackMessage =
        reason === "rate_limited"
          ? "⚠ You're sending messages too fast. You are currently in Fallback Mode. Please wait a moment and try again."
          : "⚠ You are currently in Fallback Mode. Your daily AI tickets have been used. Come back tomorrow (or upgrade later) for full AI responses.";

      return Response.json({
        reply: freeModeResponse(trimmed),
        fallback: true,
        fallbackMessage,
        reason,
        remainingToday: Math.max(0, DAILY_LIMIT - gate.new_count),
      });
    }

    // Call OpenAI (GPT-5 nano via Responses API)
    const openai = new OpenAI({ apiKey });

    const response = await openai.responses.create({
      model: "gpt-5-nano",
      input: [
        {
          role: "system",
          content: [
            "You are a friendly and supportive hyperhidrosis education assistant.",
            "Give calm, practical guidance and coping strategies.",
            "Do NOT diagnose, and do NOT prescribe medication.",
            "If symptoms are sudden, severe, include chest pain, fainting, fever, weight loss, or occur at night, advise seeing a clinician promptly.",
            "Keep replies concise (under ~8 sentences) unless the user asks for more.",
          ].join(" "),
        },
        { role: "user", content: trimmed },
      ],
      max_output_tokens: MAX_OUTPUT_TOKENS,
    });

    const reply = response.output_text ?? "";

    // Reconcile actual usage if higher than reservation
    const realIn = response.usage?.input_tokens ?? estInputTokens;
    const realOut = response.usage?.output_tokens ?? estOutputTokens;

    const deltaIn = Math.max(0, realIn - estInputTokens);
    const deltaOut = Math.max(0, realOut - estOutputTokens);

    if (deltaIn > 0 || deltaOut > 0) {
      await (supabase as any).rpc("ai_check_and_increment", {
        p_user_id: user.id,
        p_day: dayStr,
        p_daily_message_limit: DAILY_LIMIT,
        p_daily_cost_cents_limit: DAILY_COST_CENTS_LIMIT,
        p_add_messages: 0,
        p_add_input_tokens: deltaIn,
        p_add_output_tokens: deltaOut,
        p_min_seconds_between_request: 0, // harmless if ignored by SQL, but keep param name correct below
      });
    }

    // IMPORTANT: correct param name (must match SQL function arg)
    // Some Supabase clients silently ignore unknown keys, so we do a second safe call if needed.
    // If your SQL expects p_min_seconds_between_requests, keep it as that:
    if (deltaIn > 0 || deltaOut > 0) {
      await (supabase as any).rpc("ai_check_and_increment", {
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

    return Response.json({
      reply,
      remainingToday: Math.max(0, DAILY_LIMIT - gate.new_count),
      fallback: false,
    });
  } catch (err: any) {
    const msg = err?.error?.message || err?.message || "AI unavailable";
    const code = err?.error?.code || err?.code;

    console.error("AI error:", code, msg);

    return Response.json({
      reply: freeModeResponse(userMessage),
      fallback: true,
      fallbackMessage:
        "⚠ You are currently in Fallback Mode. AI is unavailable or your daily AI tickets have been used.",
      reason: code || "ai_error",
    });
  }
}