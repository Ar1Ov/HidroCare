"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) return setError(error.message);

    setDone(true);
    // Optional: force sign-out so they log in fresh with new password
    await supabase.auth.signOut();
    router.push("/sign-in");
  }

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="text-2xl font-semibold">Set new password</h1>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input
          className="w-full rounded border p-2"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
        />
        <input
          className="w-full rounded border p-2"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          type="password"
          required
        />
        <button className="w-full rounded bg-black p-2 text-white">
          Update password
        </button>
      </form>

      {done && <p className="mt-4 text-sm">Password updated. Please sign in again.</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
    </div>
  );
}