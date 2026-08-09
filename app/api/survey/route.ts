import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseScore, type SurveyPayload } from "@/lib/survey/schema";

function asString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
}

export async function POST(request: Request) {
  let body: Partial<SurveyPayload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.consent !== true) {
    return NextResponse.json(
      { error: "Consent is required to submit this survey." },
      { status: 400 },
    );
  }

  const areas = asStringArray(body.areas);
  const triggers = asStringArray(body.triggers);
  const products = asStringArray(body.products);
  const treatments = asStringArray(body.treatments);
  const lifeAreas = asStringArray(body.lifeAreas);

  const severityRaw = asString(body.severityRaw);
  const dailyLifeImpactRaw = asString(body.dailyLifeImpactRaw);
  const severityScore =
    typeof body.severityScore === "number" && Number.isFinite(body.severityScore)
      ? body.severityScore
      : parseScore(severityRaw);
  const dailyLifeImpact =
    typeof body.dailyLifeImpact === "number" && Number.isFinite(body.dailyLifeImpact)
      ? body.dailyLifeImpact
      : parseScore(dailyLifeImpactRaw);

  const payload: SurveyPayload = {
    consent: true,
    ageGroup: asString(body.ageGroup),
    excessiveSweating: asString(body.excessiveSweating),
    diagnosed: asString(body.diagnosed),
    severityRaw,
    severityScore,
    areas,
    frequency: asString(body.frequency),
    triggers,
    episodeDuration: asString(body.episodeDuration),
    washFrequency: asString(body.washFrequency),
    products,
    odorLevel: asString(body.odorLevel),
    odorOnset: asString(body.odorOnset),
    skinIrritation: asString(body.skinIrritation),
    treatments,
    treatmentEffectiveness: asString(body.treatmentEffectiveness),
    treatmentOdorChange: asString(body.treatmentOdorChange),
    dailyLifeImpactRaw,
    dailyLifeImpact,
    lifeAreas,
    challenge: typeof body.challenge === "string" ? body.challenge.trim() : "",
    futureResearch: asString(body.futureResearch),
  };

  const supabase = await createClient();
  const { error } = await supabase.from("survey_responses").insert({
    consent: payload.consent,
    age_group: payload.ageGroup,
    excessive_sweating: payload.excessiveSweating,
    diagnosed: payload.diagnosed,
    severity_raw: payload.severityRaw,
    severity_score: payload.severityScore,
    areas: payload.areas,
    frequency: payload.frequency,
    triggers: payload.triggers,
    episode_duration: payload.episodeDuration,
    wash_frequency: payload.washFrequency,
    products: payload.products,
    odor_level: payload.odorLevel,
    odor_onset: payload.odorOnset,
    skin_irritation: payload.skinIrritation,
    treatments: payload.treatments,
    treatment_effectiveness: payload.treatmentEffectiveness,
    treatment_odor_change: payload.treatmentOdorChange,
    daily_life_impact_raw: payload.dailyLifeImpactRaw,
    daily_life_impact: payload.dailyLifeImpact,
    life_areas: payload.lifeAreas,
    challenge: payload.challenge || null,
    future_research: payload.futureResearch,
    answers: payload,
  });

  if (error) {
    console.error("survey insert failed:", error);
    return NextResponse.json(
      {
        error:
          error.message.includes("survey_responses") || error.code === "42P01"
            ? "Survey table is not set up yet. Run the survey_responses migration in Supabase."
            : error.message,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
