import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET /auth/confirm
 *
 * This route handles the email confirmation link that Supabase sends.
 * When users click the link in their email, they're redirected here.
 *
 * The URL contains a token_hash and type that we exchange for a session.
 */
export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url);

	const code = searchParams.get("code");
	const token_hash = searchParams.get("token_hash");
	const type = searchParams.get("type");
	const next = searchParams.get("next");

	// Validate next - only allow internal paths (prevent open redirect)
	const safeNext =
		next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

	let success = false;

	if (code) {
		const supabase = await createClient();
		const { error } = await supabase.auth.exchangeCodeForSession(code);
		success = !error;
	} else if (token_hash && type) {
		const supabase = await createClient();
		const { error } = await supabase.auth.verifyOtp({
			token_hash,
			type: type as EmailOtpType,
		});
		success = !error;
	}

	if (success) {
		return NextResponse.redirect(`${origin}${safeNext}`);
	}

	return NextResponse.redirect(`${origin}/login?error=confirmation_failed`);
}
