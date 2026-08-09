"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AGE_GROUPS,
  BODY_AREAS,
  EPISODE_DURATIONS,
  LIFE_AREAS,
  ODOR_LEVELS,
  ODOR_ONSETS,
  PRODUCTS,
  SKIN_IRRITATION,
  SWEAT_FREQUENCY,
  TREATMENT_EFFECTIVENESS,
  TREATMENT_ODOR_CHANGE,
  TREATMENTS,
  TRIGGERS,
  WASH_FREQUENCIES,
  YES_NO,
  YES_NO_UNSURE,
  type SurveyPayload,
} from "@/lib/survey/schema";
import { cn } from "@/lib/utils";

type FormState = {
  consent: boolean;
  ageGroup: string;
  excessiveSweating: string;
  diagnosed: string;
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
  dailyLifeImpact: number | null;
  lifeAreas: string[];
  challenge: string;
  futureResearch: string;
};

const initialForm: FormState = {
  consent: false,
  ageGroup: "",
  excessiveSweating: "",
  diagnosed: "",
  severityScore: null,
  areas: [],
  frequency: "",
  triggers: [],
  episodeDuration: "",
  washFrequency: "",
  products: [],
  odorLevel: "",
  odorOnset: "",
  skinIrritation: "",
  treatments: [],
  treatmentEffectiveness: "",
  treatmentOdorChange: "",
  dailyLifeImpact: null,
  lifeAreas: [],
  challenge: "",
  futureResearch: "",
};

function toggleInList(list: string[], value: string) {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}

function ChoiceGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-foreground">
        {label} <span className="font-normal text-muted-foreground">(optional)</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition-colors",
              value === opt
                ? "border-teal-600 bg-teal-600 text-white dark:border-teal-400 dark:bg-teal-500"
                : "border-border bg-background hover:bg-muted",
            )}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function MultiChoiceGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-foreground">
        {label} <span className="font-normal text-muted-foreground">(optional)</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm transition-colors",
                selected
                  ? "border-teal-600 bg-teal-600 text-white dark:border-teal-400 dark:bg-teal-500"
                  : "border-border bg-background hover:bg-muted",
              )}
              onClick={() => onChange(toggleInList(value, opt))}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function ScoreSlider({
  label,
  value,
  onChange,
  minLabel,
  maxLabel,
}: {
  label: string;
  value: number | null;
  onChange: (n: number | null) => void;
  minLabel: string;
  maxLabel: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label>
          {label} <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-sm font-semibold tabular-nums text-teal-900 dark:bg-teal-950/60 dark:text-teal-100">
          {value ?? "Not answered"}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value ?? 5}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-teal-600"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
      {value !== null ? (
        <button
          type="button"
          className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
          onClick={() => onChange(null)}
        >
          Clear answer
        </button>
      ) : null}
    </div>
  );
}

export function SurveyFormDialog({ onSubmitted }: { onSubmitted?: () => void }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const steps = useMemo(
    () => ["Consent & basics", "Patterns", "Skin & treatment", "Impact"],
    [],
  );

  function reset() {
    setForm(initialForm);
    setStep(0);
  }

  function validateStep(current: number): string | null {
    if (current === 0 && !form.consent) return "Please consent to continue.";
    return null;
  }

  async function submit() {
    const err = validateStep(3);
    if (err) {
      toast.error(err);
      return;
    }

    const payload: SurveyPayload = {
      consent: true,
      ageGroup: form.ageGroup,
      excessiveSweating: form.excessiveSweating,
      diagnosed: form.diagnosed,
      severityRaw: form.severityScore === null ? "" : String(form.severityScore),
      severityScore: form.severityScore,
      areas: form.areas,
      frequency: form.frequency,
      triggers: form.triggers,
      episodeDuration: form.episodeDuration,
      washFrequency: form.washFrequency,
      products: form.products,
      odorLevel: form.odorLevel,
      odorOnset: form.odorOnset,
      skinIrritation: form.skinIrritation,
      treatments: form.treatments,
      treatmentEffectiveness: form.treatmentEffectiveness,
      treatmentOdorChange: form.treatmentOdorChange,
      dailyLifeImpactRaw: form.dailyLifeImpact === null ? "" : String(form.dailyLifeImpact),
      dailyLifeImpact: form.dailyLifeImpact,
      lifeAreas: form.lifeAreas,
      challenge: form.challenge,
      futureResearch: form.futureResearch,
    };

    try {
      setSubmitting(true);
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Failed to submit survey");
      toast.success("Thank you — your response was recorded.");
      setOpen(false);
      reset();
      onSubmitted?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit survey");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2 bg-teal-600 px-8 py-6 text-base hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600">
          Fill the survey
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Hyperhidrosis research survey</DialogTitle>
          <DialogDescription>
            Anonymous · Step {step + 1} of {steps.length}: {steps[step]}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="rounded-lg border border-teal-200 bg-teal-50 p-3 text-sm text-teal-950 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-100">
            All survey questions are optional. If any question makes you feel uncomfortable, you
            are free to skip it. Consent is required before submitting a response.
          </div>
          {step === 0 ? (
            <>
              <label className="flex items-start gap-3 rounded-lg border p-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-1 accent-teal-600"
                  checked={form.consent}
                  onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
                />
                <span>
                  I consent to participate in this anonymous survey for research purposes.
                </span>
              </label>
              <ChoiceGroup
                label="What is your age group?"
                options={AGE_GROUPS}
                value={form.ageGroup}
                onChange={(ageGroup) => setForm((f) => ({ ...f, ageGroup }))}
              />
              <ChoiceGroup
                label="Do you experience excessive sweating beyond what you consider normal?"
                options={YES_NO}
                value={form.excessiveSweating}
                onChange={(excessiveSweating) => setForm((f) => ({ ...f, excessiveSweating }))}
              />
              <ChoiceGroup
                label="Have you been diagnosed with hyperhidrosis?"
                options={YES_NO_UNSURE}
                value={form.diagnosed}
                onChange={(diagnosed) => setForm((f) => ({ ...f, diagnosed }))}
              />
              <ScoreSlider
                label="How severe is your sweating on average?"
                value={form.severityScore}
                onChange={(severityScore) => setForm((f) => ({ ...f, severityScore }))}
                minLabel="0 — None"
                maxLabel="10 — Extremely severe"
              />
              <MultiChoiceGroup
                label="Which areas are affected? (Select all that apply)"
                options={BODY_AREAS}
                value={form.areas}
                onChange={(areas) => setForm((f) => ({ ...f, areas }))}
              />
            </>
          ) : null}

          {step === 1 ? (
            <>
              <ChoiceGroup
                label="How often do you experience excessive sweating?"
                options={SWEAT_FREQUENCY}
                value={form.frequency}
                onChange={(frequency) => setForm((f) => ({ ...f, frequency }))}
              />
              <MultiChoiceGroup
                label="What triggers your sweating? (Select all that apply)"
                options={TRIGGERS}
                value={form.triggers}
                onChange={(triggers) => setForm((f) => ({ ...f, triggers }))}
              />
              <ChoiceGroup
                label="How long does a typical episode last?"
                options={EPISODE_DURATIONS}
                value={form.episodeDuration}
                onChange={(episodeDuration) => setForm((f) => ({ ...f, episodeDuration }))}
              />
              <ChoiceGroup
                label="How often do you wash / shower affected areas?"
                options={WASH_FREQUENCIES}
                value={form.washFrequency}
                onChange={(washFrequency) => setForm((f) => ({ ...f, washFrequency }))}
              />
              <MultiChoiceGroup
                label="Which products do you use? (Select all that apply)"
                options={PRODUCTS}
                value={form.products}
                onChange={(products) => setForm((f) => ({ ...f, products }))}
              />
              <ChoiceGroup
                label="How would you describe any odor?"
                options={ODOR_LEVELS}
                value={form.odorLevel}
                onChange={(odorLevel) => setForm((f) => ({ ...f, odorLevel }))}
              />
            </>
          ) : null}

          {step === 2 ? (
            <>
              <ChoiceGroup
                label="How soon after sweating begins do you notice odor?"
                options={ODOR_ONSETS}
                value={form.odorOnset}
                onChange={(odorOnset) => setForm((f) => ({ ...f, odorOnset }))}
              />
              <ChoiceGroup
                label="How often do you experience skin irritation, rashes, or infections in sweating areas?"
                options={SKIN_IRRITATION}
                value={form.skinIrritation}
                onChange={(skinIrritation) => setForm((f) => ({ ...f, skinIrritation }))}
              />
              <MultiChoiceGroup
                label="Are you currently using any treatments?"
                options={TREATMENTS}
                value={form.treatments}
                onChange={(treatments) => setForm((f) => ({ ...f, treatments }))}
              />
              <ChoiceGroup
                label="How effective are your current treatments?"
                options={TREATMENT_EFFECTIVENESS}
                value={form.treatmentEffectiveness}
                onChange={(treatmentEffectiveness) =>
                  setForm((f) => ({ ...f, treatmentEffectiveness }))
                }
              />
              <ChoiceGroup
                label="Have you noticed changes in odor or skin irritation after treatment?"
                options={TREATMENT_ODOR_CHANGE}
                value={form.treatmentOdorChange}
                onChange={(treatmentOdorChange) =>
                  setForm((f) => ({ ...f, treatmentOdorChange }))
                }
              />
            </>
          ) : null}

          {step === 3 ? (
            <>
              <ScoreSlider
                label="How much does sweating affect your daily life?"
                value={form.dailyLifeImpact}
                onChange={(dailyLifeImpact) => setForm((f) => ({ ...f, dailyLifeImpact }))}
                minLabel="0 — Not at all"
                maxLabel="10 — Extremely"
              />
              <MultiChoiceGroup
                label="Which areas of your life are most affected?"
                options={LIFE_AREAS}
                value={form.lifeAreas}
                onChange={(lifeAreas) => setForm((f) => ({ ...f, lifeAreas }))}
              />
              <div className="space-y-2">
                <Label htmlFor="challenge">
                  What is the most challenging part of dealing with excessive sweating?
                  <span className="font-normal text-muted-foreground"> (optional)</span>
                </Label>
                <Textarea
                  id="challenge"
                  value={form.challenge}
                  onChange={(e) => setForm((f) => ({ ...f, challenge: e.target.value }))}
                  placeholder="Optional"
                  rows={4}
                />
              </div>
              <ChoiceGroup
                label="Would you be willing to participate in future research (e.g., skin swab study)?"
                options={YES_NO}
                value={form.futureResearch}
                onChange={(futureResearch) => setForm((f) => ({ ...f, futureResearch }))}
              />
            </>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={step === 0 || submitting}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button
              type="button"
              onClick={() => {
                const err = validateStep(step);
                if (err) {
                  toast.error(err);
                  return;
                }
                setStep((s) => s + 1);
              }}
            >
              Next
            </Button>
          ) : (
            <Button type="button" disabled={submitting} onClick={submit}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Submit response
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
