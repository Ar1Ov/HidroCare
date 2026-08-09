import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { emptySurveyStats, type SurveyStats } from "@/lib/survey/schema";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_survey_stats");

  if (error) {
    console.error("survey stats failed:", error);
    return NextResponse.json(
      {
        error:
          error.message.includes("get_survey_stats") || error.code === "PGRST202"
            ? "Survey stats are not set up yet. Run the survey_responses migration in Supabase."
            : error.message,
        stats: emptySurveyStats(),
      },
      { status: 500 },
    );
  }

  const stats = (data ?? emptySurveyStats()) as SurveyStats;
  return NextResponse.json({
    stats: {
      ...emptySurveyStats(),
      ...stats,
      totalResponses: Number(stats.totalResponses ?? 0),
    },
    updatedAt: new Date().toISOString(),
  });
}
