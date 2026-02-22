import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

// Validation schema for signup
const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

/**
 * POST /api/auth/signup
 *
 * Creates a new user account and sends a confirmation email.
 * Redirects the user back to your app after email verification.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Parse + validate
    const body = await request.json().catch(() => null);
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Determine public origin safely:
    // 1) NEXT_PUBLIC_SITE_URL (you set this in Vercel)
    // 2) VERCEL_URL (auto on Vercel)
    // 3) request origin (local dev fallback)
    const reqUrl = new URL(request.url);
    const origin =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : reqUrl.origin);

    // IMPORTANT: Make sure this path matches your actual confirm route:
    // - app/(auth)/callback/route.ts  => "/callback"
    // - app/auth/callback/route.ts    => "/auth/callback"
    const emailRedirectTo = `${origin}/callback`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo },
    });

    if (error) {
      // Common throttling message: email rate limit exceeded
      const msg = error.message?.toLowerCase?.() ?? "";

      if (msg.includes("rate") || msg.includes("limit")) {
        return NextResponse.json(
          {
            error:
              "Too many confirmation emails were requested. Please wait a bit and try again, or use ‘Resend confirmation’.",
          },
          { status: 429 }
        );
      }

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Note: If email confirmation is enabled, user may be null until confirmed
    return NextResponse.json(
      {
        message: "Check your email to confirm your HidroCare account.",
        user: data.user,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}