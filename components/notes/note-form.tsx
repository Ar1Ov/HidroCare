"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useAutoSave } from "@/lib/hooks/use-auto-save";
import { SaveStatusIndicator } from "./save-status-indicator";
import { DeleteNoteButton } from "./delete-note-button";
import { Tables } from "@/lib/supabase/database.types";

interface NoteFormProps {
  note?: Tables<"notes">;
  mode: "create" | "edit";
}

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
  const existingContent = note?.content || {};
  const [title, setTitle] = useState(
    note?.title || `Log Entry - ${new Date().toISOString().split("T")[0]}`
  );
  // Replace the date state handling to store as string directly
  const [formData, setFormData] = useState({
	date: (existingContent as any)?.date || new Date().toISOString().split("T")[0],
	// ... rest
  });
  
  // When building content, keep date as string (not new Date)
  const buildContent = () => ({
	date: formData.date, // Keep as "YYYY-MM-DD" string, don't convert to Date
	// ... rest
  });

  const [areaData, setAreaData] = useState(
    (existingContent as any)?.areas ||
      AREAS.map((area) => ({
        area: area.id,
        severity: 0,
        triggers: [] as string[],
        duration: "",
      }))
  );

  const [stressData, setStressData] = useState(
    (existingContent as any)?.stress || {
      anxiety: 0,
      socialImpact: 0,
      workImpact: 0,
      confidenceImpact: 0,
    }
  );

  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(
    (existingContent as any)?.triggers || []
  );
  const [episodes, setEpisodes] = useState((existingContent as any)?.episodes || "");
  const [episodeTiming, setEpisodeTiming] = useState(
    (existingContent as any)?.episodeTiming || ""
  );
  const [episodeType, setEpisodeType] = useState(
    (existingContent as any)?.episodeType || ""
  );

  // Build content object for saving
  const buildContent = () => ({
    date: formData.date,
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
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Dashboard
          </Link>
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

          {/* Date Selection */}
          <div className="flex items-center gap-4">
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

          {/* 1️⃣ Daily Sweat Log */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-4 text-lg font-semibold">1️⃣ Daily Sweat Log</h3>
            <div className="space-y-4">
              {AREAS.map((area, index) => (
                <div
                  key={area.id}
                  className="grid grid-cols-1 gap-3 rounded-lg border p-3 sm:grid-cols-4"
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
                  <div className="flex flex-wrap gap-1">
                    {TRIGGERS.map((trigger) => (
                      <label
                        key={trigger}
                        className="cursor-pointer rounded bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800"
                      >
                        <input
                          type="checkbox"
                          checked={areaData[index].triggers.includes(trigger)}
                          onChange={(e) => {
                            const newTriggers = e.target.checked
                              ? [...areaData[index].triggers, trigger]
                              : areaData[index].triggers.filter((t) => t !== trigger);
                            updateAreaData(index, "triggers", newTriggers);
                          }}
                          onBlur={triggerSave}
                          className="mr-1"
                        />
                        {trigger}
                      </label>
                    ))}
                  </div>
                  <div>
                    <Input
                      placeholder="Duration (min)"
                      value={areaData[index].duration}
                      onChange={(e) => updateAreaData(index, "duration", e.target.value)}
                      onBlur={triggerSave}
                      className="text-xs"
                    />
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
        </div>
      </CardContent>
    </Card>
  );
}