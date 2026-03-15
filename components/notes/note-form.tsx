"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useAutoSave } from "@/lib/hooks/use-auto-save";
import { SaveStatusIndicator } from "./save-status-indicator";
import { DeleteNoteButton } from "./delete-note-button";
import { NotesHelpDialog } from "./notes-help-dialog";
import type { Tables } from "@/types/supabase";

interface NoteFormProps {
  note?: Tables<"notes">;
  mode: "create" | "edit";
}

type AreaEntry = {
	area: string;
	severity: number;
	triggers: string[]; // ✅ important
	duration: string;
  };

  type FormData = {
	date: string;       // YYYY-MM-DD
	time: string;       // HH:mm for precise logging
	timeOfDay: string;  // e.g. "morning" | "afternoon" | "evening" | "night"
	notes: string; 
  };

const AREAS = [
  { id: "palms", label: "Palms", emoji: "🖐️" },
  { id: "feet", label: "Feet", emoji: "🦶" },
  { id: "underarms", label: "Underarms", emoji: "💪" },
  { id: "face", label: "Face", emoji: "😊" },
  { id: "other", label: "Other", emoji: "📝" },
];

const TRIGGERS = [
  "Stress",
  "Heat",
  "Exercise",
  "Caffeine",
  "Medication",
  "Hormonal",
];

export function NoteForm({ note, mode }: NoteFormProps) {
  const router = useRouter();
  const supabase = createClient();

  // Parse existing content or use defaults
  let existingContent: Record<string, unknown> = {};
  try {
    const raw = note?.content;
    existingContent = typeof raw === "string" ? JSON.parse(raw) : (raw || {});
  } catch {
    existingContent = {};
  }
  const [title, setTitle] = useState(
    note?.title || `Log Entry - ${new Date().toISOString().split("T")[0]}`
  );
  // Replace the date state handling to store as string directly

  const existing = existingContent;
  const now = new Date();
  const defaultTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const [formData, setFormData] = useState<FormData>({
	date: typeof existing.date === "string" ? existing.date.slice(0, 10) : now.toISOString().slice(0, 10),
	time: typeof existing.time === "string" ? existing.time : defaultTime,
	timeOfDay: (existing.timeOfDay as string) ?? "morning",
	notes: (existing.notes as string) ?? "",
  });

  const [areaData, setAreaData] = useState<AreaEntry[]>(
	Array.isArray(existingContent?.areas)
	  ? (existingContent.areas as AreaEntry[])
	  : AREAS.map((area) => ({
		  area: area.id,
		  severity: 0,
		  triggers: [] as string[],
		  duration: "",
		}))
  );

  const [stressData, setStressData] = useState(
    (existingContent?.stress as Record<string, number>) || {
      anxiety: 0,
      socialImpact: 0,
      workImpact: 0,
      confidenceImpact: 0,
    }
  );

  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(
    (existingContent?.triggers as string[]) || []
  );
  const [episodes, setEpisodes] = useState((existingContent?.episodes as string) || "");
  const [episodeTiming, setEpisodeTiming] = useState(
    (existingContent?.episodeTiming as string) || ""
  );
  const [episodeType, setEpisodeType] = useState(
    (existingContent?.episodeType as string) || ""
  );

  // Build content object for saving
  const buildContent = () => ({
    date: formData.date,
    time: formData.time,
    timeOfDay: formData.timeOfDay,
    areas: areaData,
    stress: stressData,
    triggers: selectedTriggers,
    episodes,
    episodeTiming,
    episodeType,
    notes: formData.notes,
  });

  const content = buildContent();

  const handleNoteCreated = useCallback(
    (newNoteId: string) => {
      router.push(`/notes/${newNoteId}?edit=true`);
    },
    [router]
  );

  const { status, error, triggerSave } = useAutoSave({
    supabase,
    noteId: note?.id,
    title,
    content: JSON.stringify(content),
    debounceMs: 500,
    onNoteCreated: handleNoteCreated,
  });

  const updateAreaData = (index: number, field: string, value: any) => {
    const newData = [...areaData];
    newData[index] = { ...newData[index], [field]: value };
    setAreaData(newData);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <NotesHelpDialog />
          <div className="flex items-center gap-2">
            <SaveStatusIndicator status={status} error={error} onRetry={triggerSave} />
            {mode === "edit" && note && (
              <DeleteNoteButton noteId={note.id} noteTitle={note.title} />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Title */}
          <Input
            id="title"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={triggerSave}
            autoComplete="off"
            className="border-0 p-0 text-lg font-semibold focus-visible:ring-0 focus-visible:ring-offset-0"
          />

          {/* Date & Time Selection */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label htmlFor="date" className="text-sm font-medium">
                📅 Date:
              </label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                onBlur={triggerSave}
                className="w-auto"
              />
            </div>
            <div className="flex items-center gap-2">
              <label htmlFor="time" className="text-sm font-medium">
                🕐 Time:
              </label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                onBlur={triggerSave}
                className="w-auto"
              />
            </div>
          </div>

          {/* 1️⃣ Daily Sweat Log */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-4 text-lg font-semibold">1️⃣ Daily Sweat Log</h3>
            <div className="space-y-4">
              {AREAS.map((area, index) => (
                <div
                  key={area.id}
                  className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="font-medium">
                    {area.emoji} {area.label}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Severity:</span>
                    <Input
                      type="number"
                      min="0"
                      max="10"
                      value={areaData[index].severity}
                      onChange={(e) =>
                        updateAreaData(index, "severity", parseInt(e.target.value) || 0)
                      }
                      onBlur={triggerSave}
                      className="w-16"
                    />
                    <span
                      className={`text-sm font-bold ${
                        areaData[index].severity >= 8
                          ? "text-red-500"
                          : areaData[index].severity >= 5
                          ? "text-yellow-500"
                          : "text-green-500"
                      }`}
                    >
                      /10
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2️⃣ Stress & Emotional Impact */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-4 text-lg font-semibold">
              2️⃣ Stress & Emotional Impact
            </h3>
            <div className="space-y-3">
              {[
                { key: "anxiety", label: "I felt anxious or stressed because of my sweating" },
                { key: "socialImpact", label: "Sweating affected my social interactions" },
                { key: "workImpact", label: "Sweating affected my work/school performance" },
                { key: "confidenceImpact", label: "Sweating affected my confidence or self-esteem" },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-sm">{item.label}</span>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() =>
                          setStressData({ ...stressData, [item.key]: num })
                        }
                        onBlur={triggerSave}
                        className={`h-8 w-8 rounded-full border-2 text-sm ${
                          stressData[item.key as keyof typeof stressData] === num
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-slate-300 hover:border-primary"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3️⃣ Trigger Questionnaire */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-4 text-lg font-semibold">3️⃣ Trigger Questionnaire</h3>
            <div className="flex flex-wrap gap-3">
              {TRIGGERS.map((trigger) => (
                <label
                  key={trigger}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <input
                    type="checkbox"
                    checked={selectedTriggers.includes(trigger)}
                    onChange={(e) => {
                      setSelectedTriggers(
                        e.target.checked
                          ? [...selectedTriggers, trigger]
                          : selectedTriggers.filter((t) => t !== trigger)
                      );
                    }}
                    onBlur={triggerSave}
                  />
                  <span>{trigger}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 4️⃣ Frequency & Patterns */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-4 text-lg font-semibold">4️⃣ Frequency & Patterns</h3>
            <div className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <span className="text-sm sm:w-48">
                  How many excessive sweating episodes?
                </span>
                <Input
                  type="number"
                  className="w-24"
                  value={episodes}
                  onChange={(e) => setEpisodes(e.target.value)}
                  onBlur={triggerSave}
                  placeholder="0"
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <span className="text-sm sm:w-48">Mostly occurred:</span>
                <div className="flex flex-wrap gap-2">
                  {["Morning", "Afternoon", "Evening", "Night"].map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setEpisodeTiming(time)}
                      className={`rounded-lg border px-3 py-1 text-sm ${
                        episodeTiming === time
                          ? "border-primary bg-primary text-primary-foreground"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <span className="text-sm sm:w-48">Were episodes:</span>
                <div className="flex flex-wrap gap-2">
                  {["Sudden onset", "Gradual", "Continuous"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setEpisodeType(type)}
                      className={`rounded-lg border px-3 py-1 text-sm ${
                        episodeType === type
                          ? "border-primary bg-primary text-primary-foreground"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 5️⃣ Additional Notes */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-4 text-lg font-semibold">5️⃣ Additional Notes</h3>
            <Textarea
              placeholder="Any other observations..."
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              onBlur={triggerSave}
            />
          </div>

          {/* Auto-save indicator */}
          <p className="text-xs text-muted-foreground">
            💾 Your log is automatically saved as you type
          </p>

          {/* Submit / Back to Dashboard */}
          <div className="pt-4">
            <Button
              type="button"
              onClick={async () => {
                await triggerSave();
                router.push("/dashboard");
              }}
              className="w-full sm:w-auto"
            >
              Submit form
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}