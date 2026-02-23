"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const COOLDOWN_MS = 60_000; // 60s

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);

  // Optional: persist cooldown across refresh
  useEffect(() => {
    const raw = localStorage.getItem("fp_cooldown_until");
    if (raw) setCooldownUntil(Number(raw) || 0);
  }, []);
  useEffect(() => {
    localStorage.setItem("fp_cooldown_until", String(cooldownUntil));
  }, [cooldownUntil]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);
    setSent(false);

    const now = Date.now();
    if (isLoading) return;
    if (now < cooldownUntil) {
      setError("Please wait a bit before requesting another reset email.");
      return;
    }

    setIsLoading(true);
    setCooldownUntil(now + COOLDOWN_MS);

    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/update-password`
          : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

      if (error) {
        // If Supabase is rate limiting, show a friendly message and don't retry
        if ((error as any).status === 429) {
          throw new Error("Email rate limit exceeded. Please wait a few minutes and try again.");
        }
        throw error;
      }

      setSent(true);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  const now = Date.now();
  const secondsLeft = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-semibold">Reset password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We’ll email you a link to set a new password.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input
          className="w-full rounded border p-2"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          disabled={isLoading}
        />
        <button
          type="submit"
          className="w-full rounded bg-black p-2 text-white disabled:opacity-60"
          disabled={isLoading || secondsLeft > 0}
        >
          {isLoading
            ? "Sending..."
            : secondsLeft > 0
            ? `Wait ${secondsLeft}s`
            : "Send reset email"}
        </button>
      </form>

      {sent && <p className="mt-4 text-sm">Check your email for the reset link.</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}