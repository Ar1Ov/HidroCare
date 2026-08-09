import type { Metadata } from "next";
import { SurveyPageContent } from "@/components/survey/survey-page-content";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Survey | HidroCare",
  description:
    "Anonymous hyperhidrosis research survey with live charts of aggregated responses.",
};

export default async function SurveyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <SurveyPageContent isAuthenticated={Boolean(user)} />;
}
