import { createClient } from "@/lib/supabase/server";
import { NoteList } from "@/components/notes/note-list";
import { SweatChartDialog } from "@/components/dashboard/sweat-chart-dialog";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Get user info
  const { data: { user } } = await supabase.auth.getUser();
  const userName = user?.user_metadata?.full_name || "User";

  // Get notes in chronological order (oldest first)
  const { data: notes } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <div className="container mx-auto space-y-8 rounded-xl bg-slate-100 px-4 py-6 dark:bg-slate-900 sm:px-6 sm:py-8 [&_button]:shadow-none [&_button]:hover:shadow-none">
      {/* Welcome Message */}
      <div className="rounded-xl border border-teal-200 bg-teal-50 p-6 text-teal-950 dark:border-teal-700 dark:bg-teal-900 dark:text-teal-50">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-teal-700 dark:text-teal-200">Your personal tracker</p>
        <h1 className="text-2xl font-bold">Welcome back, {userName}</h1>
        <p className="mt-2 text-sm leading-relaxed text-teal-800 dark:text-teal-100">
          Track your hyperhidrosis symptoms and monitor your progress over time.
        </p>
		<div className="mt-4">
          <SweatChartDialog />
        </div>
      </div>

      {/* Notes in Chronological Order */}
      <div>
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Your Log History</h2>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium tabular-nums text-slate-600 dark:bg-slate-800 dark:text-slate-300">{notes?.length ?? 0} {(notes?.length ?? 0) === 1 ? "entry" : "entries"}</span>
        </div>
        <NoteList notes={notes ?? []} />
      </div>
    </div>
  );
}