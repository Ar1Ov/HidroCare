import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

const DAILY_LIMIT = 10;         // <-- change if you want
const MAX_INPUT_CHARS = 800;    // <-- keep small to control cost
const MAX_OUTPUT_TOKENS = 300;  // <-- biggest cost lever

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
  try {
    const supabase = await createClient();

    // Require logged-in user (keeps abuse down)
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr) {
      return Response.json({ error: userErr.message }, { status: 401 });
    }
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // OpenAI key must exist (server-side only)
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Missing OPENAI_API_KEY in .env.local" },
        { status: 503 },
      );
    }

    // Parse input
    const body = await req.json().catch(() => null);
    const message = body?.message;

    if (!message || typeof message !== "string") {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const trimmed = message.trim();
    if (!trimmed) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }
    if (trimmed.length > MAX_INPUT_CHARS) {
      return Response.json(
        { error: `Message too long. Max ${MAX_INPUT_CHARS} characters.` },
        { status: 413 },
      );
    }

    // Daily limit
    const today = new Date();
    const day = today.toISOString().slice(0, 10); // YYYY-MM-DD

    const { data: usageRow, error: usageReadErr } = await supabase
      .from("ai_usage_daily")
      .select("count")
      .eq("user_id", user.id)
      .eq("day", day)
      .maybeSingle();

    if (usageReadErr) {
      return Response.json({ error: usageReadErr.message }, { status: 500 });
    }

    const currentCount = usageRow?.count ?? 0;
    if (currentCount >= DAILY_LIMIT) {
      return Response.json(
        { error: `Daily limit reached (${DAILY_LIMIT}/day). Try again tomorrow.` },
        { status: 429 },
      );
    }

    // Increment usage BEFORE calling OpenAI (prevents spamming)
    const { error: upsertErr } = await supabase
      .from("ai_usage_daily")
      .upsert(
        { user_id: user.id, day, count: currentCount + 1 },
        { onConflict: "user_id,day" },
      );

    if (upsertErr) {
      return Response.json({ error: upsertErr.message }, { status: 500 });
    }

    // Call OpenAI (GPT-5 nano)
    const openai = new OpenAI({ apiKey });

    const response = await openai.chat.completions.create({
      model: "gpt-5-nano", // <-- GPT-5 nano model id :contentReference[oaicite:1]{index=1}
      temperature: 0.4,
      max_tokens: MAX_OUTPUT_TOKENS,
      messages: [
        {
          role: "system",
          content:
            [
              "You are a friendly and supportive hyperhidrosis education assistant.",
              "Give calm, practical guidance and coping strategies.",
              "Do NOT diagnose, and do NOT prescribe medication.",
              "If symptoms are sudden, severe, include chest pain, fainting, fever, weight loss, or occur at night, advise seeing a clinician promptly.",
              `Keep replies concise (under ~8 sentences) unless the user asks for more.`,
            ].join(" "),
        },
        { role: "user", content: trimmed },
      ],
    });

    return Response.json({
      reply: response.choices[0]?.message?.content ?? "",
      remainingToday: Math.max(0, DAILY_LIMIT - (currentCount + 1)),
    });
  } catch (err: any) {
    const msg =
      err?.error?.message ||
      err?.message ||
      "AI unavailable";
  
    const code =
      err?.error?.code ||
      err?.code;
  
    console.error("AI error:", msg);
  
    // If OpenAI quota error OR any failure → use fallback
    if (
      code === "insufficient_quota" ||
      msg.toLowerCase().includes("quota") ||
      msg.toLowerCase().includes("missing credentials")
    ) {
      return Response.json({
        reply: freeModeResponse("fallback"),
        fallback: true,
      });
    }
  
    return Response.json({
      reply: freeModeResponse("general"),
      fallback: true,
    });
  }
}
