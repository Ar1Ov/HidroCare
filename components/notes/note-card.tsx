"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tables } from "@/lib/supabase/database.types";

interface NoteCardProps {
  note: Tables<"notes">;
}

const AREAS = [
  { id: "palms", label: "Palms", emoji: "🖐️" },
  { id: "feet", label: "Feet", emoji: "🦶" },
  { id: "underarms", label: "Underarms", emoji: "💪" },
  { id: "face", label: "Face", emoji: "😊" },
  { id: "other", label: "Other", emoji: "📝" },
];

export function NoteCard({ note }: NoteCardProps) {
  // Parse the content JSON
  const content = typeof note.content === "string" 
    ? JSON.parse(note.content) 
    : note.content;

  const logDate = content?.date 
    ? new Date(content.date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : new Date(note.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

  // Get severity for each area
  const getSeverityColor = (severity: number) => {
    if (severity >= 8) return "bg-red-500";
    if (severity >= 5) return "bg-yellow-500";
    if (severity > 0) return "bg-green-500";
    return "bg-slate-300";
  };

  const getSeverityTextColor = (severity: number) => {
    if (severity >= 8) return "text-red-600 dark:text-red-400";
    if (severity >= 5) return "text-yellow-600 dark:text-yellow-400";
    if (severity > 0) return "text-green-600 dark:text-green-400";
    return "text-slate-400";
  };

  // Calculate average severity
  const areas = content?.areas || [];
  const avgSeverity = areas.length > 0
    ? Math.round(areas.reduce((sum: number, a: any) => sum + (a.severity || 0), 0) / areas.length)
    : 0;

  // Get top triggers
  const allTriggers = areas.flatMap((a: any) => a.triggers || []);
  const uniqueTriggers = [...new Set(allTriggers)];
  const topTriggers = uniqueTriggers.slice(0, 3);

  // Get stress score
  const stress = content?.stress || {};
  const stressScore = Math.round(
    ((stress.anxiety || 0) + 
    (stress.socialImpact || 0) + 
    (stress.workImpact || 0) + 
    (stress.confidenceImpact || 0)) / 4
  );

  return (
    <Link href={`/notes/${note.id}`}>
      <Card className="h-full transition-colors cursor-pointer hover:bg-muted/50">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg line-clamp-1">
                📅 {logDate}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                {content?.timeOfDay || "All day"}
              </p>
            </div>
            {/* Overall severity badge */}
            <div className={`px-3 py-1 rounded-full text-white text-sm font-bold ${getSeverityColor(avgSeverity)}`}>
              {avgSeverity}/10
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Severity bars for each area */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Sweat Severity
            </p>
            <div className="grid grid-cols-5 gap-1">
              {AREAS.map((area) => {
                const areaData = areas.find((a: any) => a.area === area.id) || {};
                const severity = areaData.severity || 0;
                return (
                  <div key={area.id} className="text-center">
                    <div 
                      className={`h-12 rounded-md flex items-end justify-center pb-1 ${getSeverityColor(severity)}`}
                      style={{ opacity: severity > 0 ? 0.8 : 0.3 }}
                    >
                      <span className="text-xs font-bold text-white">{severity}</span>
                    </div>
                    <span className="text-xs">{area.emoji}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Triggers */}
          {topTriggers.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Main Triggers
              </p>
              <div className="flex flex-wrap gap-1">
                {topTriggers.map((trigger: string) => (
                  <span 
                    key={trigger} 
                    className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs"
                  >
                    {trigger}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stress & Emotional Impact */}
          {stressScore > 0 && (
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                Emotional impact:
              </p>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`h-2 w-4 rounded-sm ${
                      level <= stressScore ? "bg-rose-400" : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                {stressScore}/5
              </span>
            </div>
          )}

          {/* Episodes count */}
          {content?.episodes && (
            <div className="text-xs text-muted-foreground">
              📊 {content.episodes} episode{content.episodes !== "1" ? "s" : ""} 
              {content.episodeTiming && ` • ${content.episodeTiming}`}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}