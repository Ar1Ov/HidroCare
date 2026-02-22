import { createClient } from "@/lib/supabase/server";
import { NoteList } from "@/components/notes/note-list";
import { DailyLogForm } from "@/components/dashboard/daily-log-form";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: user } = await supabase.auth.getUser();
  const { data: notes } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  const userName = user.user?.user_metadata?.full_name || "User";

  return (
    <div className="container mx-auto space-y-8 py-8">
      {/* Welcome Message */}
      <div className="rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {userName}! 👋</h1>
        <p className="mt-2 opacity-90">
          Track your hyperhidrosis symptoms and monitor your progress over time.
        </p>
      </div>

      {/* Daily Log Form */}
      <DailyLogForm />

      {/* Existing Notes */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Your Log History</h2>
        <NoteList notes={notes ?? []} />
      </div>
    </div>
  );
}