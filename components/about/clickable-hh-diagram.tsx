"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type AreaKey = "palmar" | "plantar" | "axillary" | "craniofacial";

type Hotspot = {
  key: AreaKey;
  label: string;
  left: string;
  top: string;
  width: string;
  height: string;
};

type AreaInfo = {
  title: string;
  subtitle: string;
  commonTriggers: string[];
  helpfulTreatments: string[];
  tips: string[];
  badge: string;
};

const HOTSPOTS: Hotspot[] = [
  // Adjust these to match your Canva image
  { key: "craniofacial", label: "Face & scalp", left: "38%", top: "10%", width: "24%", height: "14%" },
  { key: "axillary", label: "Underarms", left: "30%", top: "32%", width: "40%", height: "18%" },
  { key: "palmar", label: "Hands", left: "18%", top: "50%", width: "26%", height: "22%" },
  { key: "plantar", label: "Feet", left: "40%", top: "76%", width: "28%", height: "18%" },
];

export function ClickableHHDiagram() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<AreaKey | null>(null);

  const AREA_INFO: Record<AreaKey, AreaInfo> = useMemo(
    () => ({
      palmar: {
        title: "Palmar Hyperhidrosis (Hands)",
        subtitle: "Excessive sweating of the palms, often starting in childhood/teens.",
        badge: "Hands",
        commonTriggers: ["Stress/anxiety", "Heat", "Social situations", "Certain fabrics/grips"],
        helpfulTreatments: [
          "Clinical-strength antiperspirant (night application)",
          "Iontophoresis (hands respond well for many people)",
          "Botulinum toxin (in some cases)",
          "Discuss prescription options with a clinician if severe",
        ],
        tips: [
          "Carry a small towel/wipes for quick resets",
          "Use grip-friendly materials (rubberized pens, phone case)",
          "Practice quick breathing reset for stress-triggered sweating",
        ],
      },
      plantar: {
        title: "Plantar Hyperhidrosis (Feet)",
        subtitle: "Excessive sweating of the soles; can cause slipping and odor/skin irritation.",
        badge: "Feet",
        commonTriggers: ["Heat/humidity", "Closed shoes", "Stress", "Long wear time"],
        helpfulTreatments: [
          "Clinical-strength antiperspirant (night application)",
          "Iontophoresis (often effective for feet too)",
          "Moisture-wicking socks + breathable shoes",
          "Talk to a clinician if you get frequent skin infections",
        ],
        tips: [
          "Rotate shoes to let them dry fully",
          "Use moisture-wicking socks (change midday if needed)",
          "Foot powder can help reduce moisture/friction",
        ],
      },
      axillary: {
        title: "Axillary Hyperhidrosis (Underarms)",
        subtitle: "Excessive underarm sweating; common impact is clothing stains and discomfort.",
        badge: "Underarms",
        commonTriggers: ["Heat", "Stress", "Caffeine/spicy foods (sometimes)", "Tight/synthetic clothing"],
        helpfulTreatments: [
          "Clinical-strength antiperspirant (night application)",
          "Botulinum toxin (often used for underarms)",
          "Prescription topical options (clinician-guided)",
          "Breathable fabrics + undershirts/sweat pads",
        ],
        tips: [
          "Apply antiperspirant to dry skin at night",
          "Wear breathable layers to reduce visible sweat",
          "Keep a spare shirt for long days",
        ],
      },
      craniofacial: {
        title: "Craniofacial Hyperhidrosis (Face & Scalp)",
        subtitle: "Excessive sweating around the forehead/scalp; often worsens with heat or stress.",
        badge: "Face & scalp",
        commonTriggers: ["Heat", "Stress/anxiety", "Exercise", "Hot drinks/foods"],
        helpfulTreatments: [
          "Cooling strategies (fan, cool cloth, shade)",
          "Clinician-guided topical/oral options (varies by person)",
          "Identify and reduce triggers when possible",
        ],
        tips: [
          "Carry a small face towel or blotting cloth",
          "Use breathable headwear and avoid heavy hair products",
          "Plan for cooling breaks in hot environments",
        ],
      },
    }),
    [],
  );

  function openArea(key: AreaKey) {
    setActive(key);
    setOpen(true);
  }

  const info = active ? AREA_INFO[active] : null;

  return (
    <div className="mt-6">
      <div className="relative w-full overflow-hidden rounded-2xl border border-sky-200/60 bg-white/40 shadow-md dark:border-sky-800/40 dark:bg-slate-900/20">
        {/* Make sure this aspect ratio matches your Canva image */}
        <div className="relative aspect-[3/2] w-full">
          <Image
            src="/images/hyperhidrosis-diagram.png"
            alt="Diagram showing common areas affected by hyperhidrosis"
            fill
            className="object-contain"
            priority
          />

          {HOTSPOTS.map((h) => (
            <button
              key={h.key}
              type="button"
              aria-label={`Learn about ${h.label}`}
              title={`Learn about ${h.label}`}
              onClick={() => openArea(h.key)}
              className="
                absolute rounded-xl
                outline-none
                ring-offset-background
                focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2
                hover:bg-sky-500/10
              "
              style={{
                left: h.left,
                top: h.top,
                width: h.width,
                height: h.height,
              }}
            />
          ))}
        </div>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        Click an area on the diagram to see quick info and common options.
      </p>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          {info ? (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <DialogTitle className="text-sky-900 dark:text-sky-100">
                      {info.title}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">{info.subtitle}</p>
                  </div>
                  <Badge variant="secondary" className="mt-1">
                    {info.badge}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-5">
                <div>
                  <p className="text-sm font-semibold text-foreground">Common triggers</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {info.commonTriggers.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground">Options that may help</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {info.helpfulTreatments.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground">Quick tips</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {info.tips.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Close
                  </Button>

                  {/* Optional: scroll to your Treatment Options section if you add an id="treatments" */}
                  <Button
                    type="button"
                    className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
                    onClick={() => {
                      setOpen(false);
                      const el = document.getElementById("treatments");
                      el?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    See treatment overview
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  Educational info only — not medical advice. If symptoms are sudden, severe,
                  or affecting your daily life, consider speaking with a clinician.
                </p>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}