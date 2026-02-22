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
  const content = typeof note.content === "string" 
    ? JSON.parse(note.content) 
    : note.content;

  // FIX: Parse date as local date without timezone conversion
  const getDisplayDate = (dateString: string) => {
    if (!dateString) return "Unknown date";
    
    // Split the date string and create date in local timezone
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const logDate = content?.date 
    ? getDisplayDate(content.date)
    : new Date(note.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

  const areas = content?.areas || [];
  const stress = content?.stress || {};

  // Calculate average severity
  const avgSeverity = areas.length > 0
    ? Math.round(areas.reduce((sum: number, a: any) => sum + (a.severity || 0), 0) / areas.length)
    : 0;

  // Get all triggers
  const allTriggers: string[] = areas.flatMap((a: any) =>
	Array.isArray(a?.triggers) ? a.triggers.filter((x: any) => typeof x === "string") : []
  );
  
  const uniqueTriggers = Array.from(new Set(allTriggers));

  // Get stress score
  const stressScore = Math.round(
    ((stress.anxiety || 0) + 
    (stress.socialImpact || 0) + 
    (stress.workImpact || 0) + 
    (stress.confidenceImpact || 0)) / 4
  );

  // Get severity background class
  const getSeverityBgClass = (severity: number): string => {
    if (severity >= 8) return "bg-red-500";
    if (severity >= 5) return "bg-yellow-500";
    if (severity > 0) return "bg-green-500";
    return "bg-slate-300";
  };

  // Get severity text color class
  const getSeverityTextClass = (severity: number): string => {
    if (severity >= 8) return "text-red-600 dark:text-red-400";
    if (severity >= 5) return "text-yellow-600 dark:text-yellow-400";
    if (severity > 0) return "text-green-600 dark:text-green-400";
    return "text-slate-400";
  };

  return (
    <Link href={`/notes/${note.id}`}>
      <Card className="h-full transition-colors cursor-pointer hover:bg-muted/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">📅</span>
              <CardTitle className="text-lg">{logDate}</CardTitle>
            </div>
            <div className={`px-3 py-1 rounded-full text-white text-sm font-bold ${getSeverityBgClass(avgSeverity)}`}>
              {avgSeverity}/10
            </div>
          </div>
          {content?.timeOfDay && (
            <p className="text-xs text-muted-foreground">{content.timeOfDay}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Severity bars for each area */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Sweat Severity
            </p>
            <div className="flex gap-2">
              {AREAS.map((area) => {
                const areaData = areas.find((a: any) => a.area === area.id) || {};
                const severity = areaData.severity || 0;
                const height = Math.max(severity * 4, 8);
                
                return (
                  <div key={area.id} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className={`w-full rounded-t ${getSeverityBgClass(severity)}`}
                      style={{ height: `${height}px`, minHeight: "8px" }}
                    />
                    <span className="text-lg">{area.emoji}</span>
                    <span className={`text-xs font-bold ${getSeverityTextClass(severity)}`}>
                      {severity}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Triggers */}
          {uniqueTriggers.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Main Triggers
              </p>
              <div className="flex flex-wrap gap-1">
                {uniqueTriggers.map((trigger: string) => (
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

          {/* Emotional Impact */}
          {stressScore > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Emotional Impact
              </p>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`h-3 w-6 rounded-sm ${
                        level <= stressScore ? "bg-rose-400" : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {stressScore}/5
                </span>
              </div>
            </div>
          )}

          {/* Episodes info */}
          {content?.episodes && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Episodes:</span> {content.episodes}
              {content.episodeTiming && ` • ${content.episodeTiming}`}
              {content.episodeType && ` • ${content.episodeType}`}
            </div>
          )}

          {/* Additional Notes */}
          {content?.notes && (
            <div className="pt-2 border-t">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Notes
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {content.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}