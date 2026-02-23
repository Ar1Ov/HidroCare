import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";
import crypto from "crypto";

export const runtime = "nodejs";

const DAILY_LIMIT = 500;
const DAILY_COST_CENTS_LIMIT = 50;
const MAX_INPUT_CHARS = 800;
const MAX_OUTPUT_TOKENS = 256;
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

/* ===========================
   PRESET HANDLING
=========================== */

function isPresetQuestion(message: string): boolean {
  const lower = message.toLowerCase();

  const presetPhrases = [
    "what triggers excessive sweating",
    "tips for managing sweat at work",
    "when should i see a doctor",
    "lifestyle changes that help",
  ];

  return presetPhrases.some((p) => lower.includes(p));
}

function freeModeResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("trigger")) {
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

  if (lower.includes("doctor")) {
    return `
You should consider seeing a doctor if:

• Sweating is sudden or worsening  
• It happens at night with fever or weight loss  
• You feel chest pain, fainting, or weakness  
• It significantly affects daily life  

A healthcare professional can help rule out underlying causes.
`.trim();
  }

  if (lower.includes("work")) {
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

• Dress for airflow (breathable fabrics, layers)  
• Limit caffeine and spicy foods  
• Practice stress-downshift routines  

If symptoms are severe or new/sudden, consider speaking with a clinician.
`.trim();
  }

  return `
Hyperhidrosis is excessive sweating beyond normal temperature regulation.

Options include:
• Prescription-strength antiperspirants  
• Iontophoresis  
• Stress management  
• Medical consultation if symptoms are severe  

Educational info only — not medical advice.
`.trim();
}

/* ===========================
   RESPONSE TEXT EXTRACTION
=========================== */

function getResponseText(r: any): string {
  if (typeof r?.output_text === "string" && r.output_text.trim()) {
    return r.output_text.trim();
  }

  if (Array.isArray(r?.output)) {
    for (const item of r.output) {
      if (!Array.isArray(item?.content)) continue;

      for (const part of item.content) {
        if (part?.type === "output_text" && typeof part.text === "string") {
          if (part.text.trim()) return part.text.trim();
        }
        if (typeof part?.text === "string" && part.text.trim()) {
          return part.text.trim();
        }
        if (typeof part?.value === "string" && part.value.trim()) {
          return part.value.trim();
        }
      }
    }
  }

  return "";
}

/* ===========================
   MAIN ROUTE
=========================== */

export async function POST(req: Request) {
  let userMessage = "";
  const request_id = crypto.randomBytes(8).toString("hex");

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
      return Response.json({ error: "Missing OPENAI_API_KEY" }, { status: 503 });
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

    /* ===========================
       PING TEST
    =========================== */

    if (trimmed === "__ping__") {
      const openai = new OpenAI({ apiKey });
      const r: any = await openai.responses.create({
        model: "gpt-5-nano",
        input: [{ role: "user", content: "Reply with exactly: OK" }],
        reasoning: { effort: "low" },
        text: { verbosity: "low" },
        max_output_tokens: 16,
      });

      const reply = getResponseText(r) || "OK";

      return Response.json({
        reply,
        fallback: false,
        source: "ai_ping",
        request_id,
      });
    }

    /* ===========================
       PRESET SHORT-CIRCUIT
    =========================== */

    if (isPresetQuestion(trimmed)) {
      return Response.json({
        reply: freeModeResponse(trimmed),
        fallback: false,
        source: "preset",
        request_id,
      });
    }

    /* ===========================
       LIMITER
    =========================== */

    const dayStr = new Date().toISOString().slice(0, 10);
    const estInputTokens = roughTokenEstimate(trimmed) + 200;
    const estOutputTokens = MAX_OUTPUT_TOKENS;

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

    const gate = gateResp?.data as GateResult;

    if (!gate?.allowed) {
      return Response.json({
        reply: freeModeResponse(trimmed),
        fallback: true,
        source: "gate",
        request_id,
      });
    }

    /* ===========================
       OPENAI CALL
    =========================== */

    const openai = new OpenAI({ apiKey });

    const baseParams = {
      model: "gpt-5-nano",
      input: [
        {
          role: "system",
          content:
            "You are a friendly and supportive hyperhidrosis education assistant. " +
            "Give calm, practical guidance. Do NOT diagnose. Keep replies under 6 sentences.",
        },
        { role: "user" as const, content: trimmed },
      ],
      reasoning: { effort: "low" as const },
      text: { verbosity: "low" as const },
      max_output_tokens: MAX_OUTPUT_TOKENS,
    };

    let response: any = await openai.responses.create(baseParams);

    // Retry if reasoning consumed full token budget
    if (
      !(getResponseText(response) || "").trim() &&
      response?.status === "incomplete" &&
      response?.incomplete_details?.reason === "max_output_tokens"
    ) {
      response = await openai.responses.create({
        ...baseParams,
        max_output_tokens: 400,
        input: [
          { role: "system", content: "Answer briefly in plain text." },
          { role: "user", content: trimmed },
        ],
      });
    }

    const reply = (getResponseText(response) || "").trim();

    if (!reply) {
      return Response.json({
        reply: freeModeResponse(trimmed),
        fallback: true,
        source: "ai_empty",
        request_id,
      });
    }

    return Response.json({
      reply,
      fallback: false,
      source: "ai",
      request_id,
    });

  } catch (err: any) {
    console.error("AI error:", err?.message);

    return Response.json({
      reply: freeModeResponse(userMessage),
      fallback: true,
      source: "catch",
    });
  }
}