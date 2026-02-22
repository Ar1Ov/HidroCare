"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

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

export function DailyLogForm() {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    timeOfDay: "",
    notes: "",
  });

  const [areaData, setAreaData] = useState(
    AREAS.map((area) => ({
      area: area.id,
      severity: 0,
      triggers: [] as string[],
      duration: "",
    }))
  );

  const [stressData, setStressData] = useState({
    anxiety: 0,
    socialImpact: 0,
    workImpact: 0,
    confidenceImpact: 0,
  });

  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [episodes, setEpisodes] = useState("");
  const [episodeTiming, setEpisodeTiming] = useState("");
  const [episodeType, setEpisodeType] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const noteContent = {
      date: formData.date,
      timeOfDay: formData.timeOfDay,
      areas: areaData,
      stress: stressData,
      triggers: selectedTriggers,
      episodes,
      episodeTiming,
      episodeType,
      notes: formData.notes,
    };

    const { error } = await supabase.from("notes").insert({
      content: noteContent,
      title: `Log Entry - ${formData.date}`,
    });

    if (error) {
      console.error("Error saving log:", error);
      alert("Error saving log entry. Please try again.");
    } else {
      alert("Log entry saved successfully!");
    }

    setIsLoading(false);
  };

  const updateAreaData = (index: number, field: string, value: any) => {
    const newData = [...areaData];
    newData[index] = { ...newData[index], [field]: value };
    setAreaData(newData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle>📅 Select Date</CardTitle>
          <CardDescription>
            Choose the date for this log entry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="date">Date:</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-auto"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Daily Sweat Log */}
      <Card>
        <CardHeader>
          <CardTitle>1️⃣ Daily Sweat Log</CardTitle>
          <CardDescription>
            Rate each area for sweat severity on {formData.date} and note triggers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-2 text-center text-xs font-medium">
              <div>Body Area</div>
              <div>Severity (0-10)</div>
              <div>Main Triggers</div>
              <div>Duration (min)</div>
              <div>Preview</div>
            </div>
            {AREAS.map((area, index) => (
              <div
                key={area.id}
                className="grid grid-cols-1 gap-4 rounded-lg border p-4 sm:grid-cols-5 sm:items-center"
              >
                <div className="font-medium">
                  {area.emoji} {area.label}
                </div>
                <div>
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={areaData[index].severity}
                    onChange={(e) =>
                      updateAreaData(index, "severity", parseInt(e.target.value) || 0)
                    }
                    className="w-20"
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {TRIGGERS.map((trigger) => (
                    <label
                      key={trigger}
                      className="cursor-pointer rounded bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800"
                    >
                      <input
                        type="checkbox"
                        checked={areaData[index].triggers.includes(trigger)}
                        onChange={(e) => {
                          const newTriggers = e.target.checked
                            ? [...areaData[index].triggers, trigger]
                            : areaData[index].triggers.filter(
                                (t) => t !== trigger
                              );
                          updateAreaData(index, "triggers", newTriggers);
                        }}
                        className="mr-1"
                      />
                      {trigger}
                    </label>
                  ))}
                </div>
                <div>
                  <Input
                    placeholder="Minutes"
                    value={areaData[index].duration}
                    onChange={(e) =>
                      updateAreaData(index, "duration", e.target.value)
                    }
                    className="w-24"
                  />
                </div>
                <div
                  className={`text-center font-bold ${
                    areaData[index].severity >= 8
                      ? "text-red-500"
                      : areaData[index].severity >= 5
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  {areaData[index].severity}/10
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stress & Emotional Impact */}
      <Card>
        <CardHeader>
          <CardTitle>2️⃣ Stress & Emotional Impact</CardTitle>
          <CardDescription>
            Rate each statement on a 0-5 scale (0 = not at all, 5 = extremely)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "anxiety", label: "I felt anxious or stressed because of my sweating" },
            { key: "socialImpact", label: "Sweating affected my social interactions today" },
            { key: "workImpact", label: "Sweating affected my work or school performance today" },
            { key: "confidenceImpact", label: "Sweating affected my confidence or self-esteem today" },
          ].map((item) => (
            <div key={item.key} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Label className="w-full sm:w-3/4">{item.label}</Label>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() =>
                      setStressData({ ...stressData, [item.key]: num })
                    }
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
        </CardContent>
      </Card>

      {/* Trigger Questionnaire */}
      <Card>
        <CardHeader>
          <CardTitle>3️⃣ Trigger Questionnaire</CardTitle>
          <CardDescription>Check all that applied on {formData.date}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {TRIGGERS.map((trigger) => (
              <label
                key={trigger}
                className="flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800"
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
                />
                <span>{trigger}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Frequency & Patterns */}
      <Card>
        <CardHeader>
          <CardTitle>4️⃣ Frequency & Patterns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <Label className="w-full sm:w-64">How many excessive sweating episodes?</Label>
            <Input
              type="number"
              className="w-24"
              value={episodes}
              onChange={(e) => setEpisodes(e.target.value)}
              placeholder="0"
            />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <Label className="w-full sm:w-64">Mostly occurred:</Label>
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
            <Label className="w-full sm:w-64">Were episodes:</Label>
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
        </CardContent>
      </Card>

      {/* Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle>5️⃣ Additional Notes / Observations</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full rounded-lg border p-3 text-sm"
            rows={4}
            placeholder="Any other observations for this date..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading} size="lg">
          {isLoading ? "Saving..." : `Save Log Entry for ${formData.date}`}
        </Button>
      </div>
    </form>
  );
}