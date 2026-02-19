import { createClient } from "@/lib/supabase/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Missing OPENAI_API_KEY in .env.local" },
        { status: 503 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a friendly and supportive hyperhidrosis education assistant. Provide calm, practical guidance. Never diagnose or prescribe. Encourage seeing a doctor for severe or sudden symptoms.",
        },
        { role: "user", content: message },
      ],
    });

    return Response.json({
      reply: response.choices[0]?.message?.content ?? "",
    });
  } catch (error) {
    console.error("AI route error:", error);
    return Response.json({ error: "AI request failed" }, { status: 500 });
  }
}