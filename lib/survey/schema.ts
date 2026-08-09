export const AGE_GROUPS = ["13-15", "16-18", "19-24", "25-34", "35+"] as const;

export const YES_NO = ["Yes", "No"] as const;
export const YES_NO_UNSURE = ["Yes", "No", "Not sure"] as const;

export const BODY_AREAS = [
  "Underarms (axillae)",
  "Hands (palms)",
  "Feet (soles)",
  "Face/scalp",
  "Back/chest",
  "Groin",
  "Legs",
  "Other",
] as const;

export const SWEAT_FREQUENCY = [
  "Daily",
  "Several times per week",
  "Occasionally",
  "Rarely",
] as const;

export const TRIGGERS = [
  "Heat",
  "Stress/anxiety",
  "Exercise",
  "Caffeine",
  "Spicy foods",
  "Social situations",
  "No clear trigger",
  "Other",
] as const;

export const EPISODE_DURATIONS = [
  "Less than 5 minutes",
  "5–15 minutes",
  "15–30 minutes",
  "More than 30 minutes",
] as const;

export const WASH_FREQUENCIES = [
  "Less than once daily",
  "Once daily",
  "Twice daily",
  "More than twice daily",
] as const;

export const PRODUCTS = [
  "None",
  "Antibacterial soap",
  "Deodorant",
  "Antiperspirant",
  "Fragrance products",
] as const;

export const ODOR_LEVELS = ["None", "Mild", "Moderate", "Strong"] as const;

export const ODOR_ONSETS = [
  "No noticeable odor",
  "Immediately",
  "After 30–60 minutes",
  "After several hours",
] as const;

export const SKIN_IRRITATION = ["Never", "Rarely", "Sometimes", "Often"] as const;

export const TREATMENTS = [
  "No treatment",
  "Antiperspirants",
  "Prescription topical treatments",
  "Iontophoresis",
  "Oral medications",
  "Botox injections",
  "Other",
] as const;

export const TREATMENT_EFFECTIVENESS = [
  "Not using treatment",
  "Not effective",
  "Somewhat effective",
  "Very effective",
] as const;

export const TREATMENT_ODOR_CHANGE = [
  "Not applicable",
  "Improved",
  "No change",
  "Worse",
] as const;

export const LIFE_AREAS = [
  "School/work",
  "Social interactions",
  "Confidence/self-esteem",
  "Physical comfort",
  "Clothing choices",
  "Other",
] as const;

export type SurveyPayload = {
  consent: boolean;
  ageGroup: string;
  excessiveSweating: string;
  diagnosed: string;
  severityRaw: string;
  severityScore: number | null;
  areas: string[];
  frequency: string;
  triggers: string[];
  episodeDuration: string;
  washFrequency: string;
  products: string[];
  odorLevel: string;
  odorOnset: string;
  skinIrritation: string;
  treatments: string[];
  treatmentEffectiveness: string;
  treatmentOdorChange: string;
  dailyLifeImpactRaw: string;
  dailyLifeImpact: number | null;
  lifeAreas: string[];
  challenge: string;
  futureResearch: string;
};

export type SurveyStats = {
  totalResponses: number;
  answered: Record<string, number>;
  ageGroups: Record<string, number>;
  diagnosed: Record<string, number>;
  frequency: Record<string, number>;
  severity: Record<string, number>;
  dailyLifeImpact: Record<string, number>;
  areas: Record<string, number>;
  triggers: Record<string, number>;
  treatments: Record<string, number>;
  lifeAreas: Record<string, number>;
  futureResearch: Record<string, number>;
};

export function emptySurveyStats(): SurveyStats {
  return {
    totalResponses: 0,
    answered: {},
    ageGroups: {},
    diagnosed: {},
    frequency: {},
    severity: {},
    dailyLifeImpact: {},
    areas: {},
    triggers: {},
    treatments: {},
    lifeAreas: {},
    futureResearch: {},
  };
}

/** Parse values like "7-8", "7,5", "9 (note)" into a number for charts. */
export function parseScore(raw: string): number | null {
  const normalized = raw.trim().replace(",", ".");
  const range = normalized.match(/^(\d+(?:\.\d+)?)\s*[-–]\s*(\d+(?:\.\d+)?)/);
  if (range) {
    const a = Number(range[1]);
    const b = Number(range[2]);
    if (Number.isFinite(a) && Number.isFinite(b)) return (a + b) / 2;
  }
  const single = normalized.match(/(\d+(?:\.\d+)?)/);
  if (!single) return null;
  const n = Number(single[1]);
  return Number.isFinite(n) ? n : null;
}
