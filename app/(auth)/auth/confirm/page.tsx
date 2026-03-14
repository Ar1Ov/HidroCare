"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { EmailOtpType } from "@supabase/supabase-js";

/**
 * Auth confirm page - handles the link users click from Supabase emails
 * (password reset, email confirmation, etc.).
 *
 * Supabase sends tokens in the URL hash (#access_token=...) which the server
 * NEVER receives. This client page reads the hash, establishes the session,
 * then redirects to the target page.
 */
function AuthConfirmContent() {
	const searchParams = useSearchParams();
	const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

	useEffect(() => {
		const next = searchParams.get("next");
		const safeNext =
			next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

		async function handleAuth() {
			const supabase = createClient();

			// 1. Hash flow: Supabase puts tokens in #access_token=... (password reset, etc.)
			//    The server never sees these - we must handle them here.
			const hash = typeof window !== "undefined" ? window.location.hash : "";
			if (hash) {
				const params = new URLSearchParams(hash.slice(1)); // remove leading #
				const access_token = params.get("access_token");
				const refresh_token = params.get("refresh_token");

				if (access_token && refresh_token) {
					const { error } = await supabase.auth.setSession({
						access_token,
						refresh_token,
					});
					if (!error) {
						// Clear hash from URL and redirect
						window.history.replaceState(null, "", window.location.pathname + window.location.search);
						window.location.href = safeNext;
						return;
					}
				}
			}

			// 2. Code flow (PKCE): ?code=... in query string
			const code = searchParams.get("code");
			if (code) {
				const { error } = await supabase.auth.exchangeCodeForSession(code);
				if (!error) {
					window.location.href = safeNext;
					return;
				}
			}

			// 3. OTP flow: ?token_hash=...&type=... in query string
			const token_hash = searchParams.get("token_hash");
			const type = searchParams.get("type");
			if (token_hash && type) {
				const { error } = await supabase.auth.verifyOtp({
					token_hash,
					type: type as EmailOtpType,
				});
				if (!error) {
					window.location.href = safeNext;
					return;
				}
			}

			// No valid auth data or all exchanges failed
			window.location.href = `/login?error=confirmation_failed`;
		}

		handleAuth();
	}, [searchParams]);

	return (
		<div className="flex min-h-[200px] items-center justify-center">
			{status === "loading" && (
				<p className="text-muted-foreground">Confirming your email…</p>
			)}
		</div>
	);
}

export default function AuthConfirmPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-[200px] items-center justify-center">
					<p className="text-muted-foreground">Confirming your email…</p>
				</div>
			}
		>
			<AuthConfirmContent />
		</Suspense>
	);
}
