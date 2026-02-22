"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AreaKey = "palmar" | "plantar" | "axillary" | "craniofacial";

type AreaInfo = {
  key: AreaKey;
  title: string;
  subtitle: string;
  colorClass: string;
  buttonStyle: React.CSSProperties;
  commonSigns: string[];
  practicalOptions: string[];
};

export function ClickableHHDiagram() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<AreaKey | null>(null);

  const AREAS: Record<AreaKey, AreaInfo> = useMemo(
    () => ({
      palmar: {
        key: "palmar",
        title: "🖐️ Palmar (Hands)",
        subtitle: "Common signs & practical options",
        colorClass:
          "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100",
        buttonStyle: {
          backgroundColor: "#000000",
          color: "#34d399",
          border: "none",
        },
        commonSigns: [
          "Noticeably sweaty palms even at rest or in cool environments",
          "Difficulty with writing, holding paper, using phones/laptops, or firm handshakes",
          "Moisture marks on paper or touchscreens",
        ],
        practicalOptions: [
          "First steps: clinical-strength antiperspirant applied at night; absorbent wipes during the day",
          "Temporary control: wearing breathable gloves can reduce visible moisture during tasks",
          "If persistent: iontophoresis is commonly used for hands (several sessions weekly, then maintenance)",
        ],
      },
      plantar: {
        key: "plantar",
        title: "🦶 Plantar (Feet)",
        subtitle: "Common signs & practical options",
        colorClass:
          "bg-indigo-100 text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-100",
        buttonStyle: {
          backgroundColor: "#000000",
          color: "#818cf8",
          border: "none",
        },
        commonSigns: [
          "Damp socks shortly after putting them on",
          "Slippery sensation in shoes; wet footprints",
          "Increased odor due to moisture buildup",
        ],
        practicalOptions: [
          "First steps: foot-specific antiperspirant at night; moisture-wicking socks",
          "Daily management: rotate shoes; use absorbent foot powders",
          "If persistent: iontophoresis can also be used for feet",
        ],
      },
      axillary: {
        key: "axillary",
        title: "💪 Axillary (Underarms)",
        subtitle: "Common signs & practical options",
        colorClass:
          "bg-rose-100 text-rose-900 dark:bg-rose-900/30 dark:text-rose-100",
        buttonStyle: {
          backgroundColor: "#000000",
          color: "#fb7185",
          border: "none",
        },
        commonSigns: [
          "Visible sweat stains unrelated to heat or activity",
          "Soaking through shirts quickly",
          "Social anxiety related to clothing choices",
        ],
        practicalOptions: [
          "First steps: clinical-strength antiperspirant applied nightly",
          "Clothing strategies: breathable fabrics; sweat shields",
          "If persistent: in-office treatments such as botulinum toxin injections may reduce sweating for months",
        ],
      },
      craniofacial: {
        key: "craniofacial",
        title: "😊 Craniofacial (Face/Scalp)",
        subtitle: "Common signs & practical options",
        colorClass:
          "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100",
        buttonStyle: {
          backgroundColor: "#000000",
          color: "#fbbf24",
          border: "none",
        },
        commonSigns: [
          "Beads of sweat on forehead, upper lip, or scalp",
          "Dripping sweat during mild stress or conversation",
          "Makeup or hairstyle disruption",
        ],
        practicalOptions: [
          "First steps: lightweight topical antiperspirant (carefully applied to hairline/forehead at night)",
          "Daytime control: blotting papers, headbands, cooling strategies",
          "If persistent: prescription topical agents or medical consultation for tailored treatment",
        ],
      },
    }),
    [],
  );

  const info = active ? AREAS[active] : null;

  function openArea(key: AreaKey) {
    setActive(key);
    setOpen(true);
  }

  return (
    <div className="mt-4">
      <div className="rounded-xl border border-sky-200/60 bg-white/60 p-3 dark:border-sky-800/40 dark:bg-slate-900/40">
        <p className="mb-3 text-xs text-muted-foreground">
          Click below to see quick info and common options.
        </p>

        {/* Diagram wrapper */}
        <div className="flex justify-center">
          <div className="relative mx-auto w-auto max-w-2xl overflow-hidden rounded-xl border border-sky-200/60 bg-sky-50/30 dark:border-sky-800/40 dark:bg-slate-800/30">
            <Image
              src="/images/hyperhidrosis-diagram.png"
              alt="Hyperhidrosis diagram"
              width={300}
              height={175}
              className="h-auto w-auto select-none"
              priority
            />
        </div>


          {/* Clickable hotspots */}
          <button
            type="button"
            aria-label="Palmar (hands)"
            onClick={() => openArea("palmar")}
            className="absolute left-[18%] top-[58%] h-[16%] w-[14%] rounded-lg ring-2 ring-transparent hover:ring-emerald-400 focus:outline-none focus:ring-emerald-400"
          />
          <button
            type="button"
            aria-label="Plantar (feet)"
            onClick={() => openArea("plantar")}
            className="absolute left-[44%] top-[78%] h-[16%] w-[12%] rounded-lg ring-2 ring-transparent hover:ring-indigo-400 focus:outline-none focus:ring-indigo-400"
          />
          <button
            type="button"
            aria-label="Axillary (underarms)"
            onClick={() => openArea("axillary")}
            className="absolute left-[30%] top-[34%] h-[18%] w-[16%] rounded-lg ring-2 ring-transparent hover:ring-rose-400 focus:outline-none focus:ring-rose-400"
          />
          <button
            type="button"
            aria-label="Craniofacial (face and scalp)"
            onClick={() => openArea("craniofacial")}
            className="absolute left-[50%] top-[10%] h-[18%] w-[16%] rounded-lg ring-2 ring-transparent hover:ring-amber-400 focus:outline-none focus:ring-amber-400"
          />
        </div>

        {/* Manual buttons */}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => openArea("palmar")}
            style={AREAS.palmar.buttonStyle}
            className="h-8 rounded-md px-3 text-xs font-medium transition-colors hover:opacity-80"
          >
            Palmar
          </button>
          <button
            onClick={() => openArea("plantar")}
            style={AREAS.plantar.buttonStyle}
            className="h-8 rounded-md px-3 text-xs font-medium transition-colors hover:opacity-80"
          >
            Plantar
          </button>
          <button
            onClick={() => openArea("axillary")}
            style={AREAS.axillary.buttonStyle}
            className="h-8 rounded-md px-3 text-xs font-medium transition-colors hover:opacity-80"
          >
            Axillary
          </button>
          <button
            onClick={() => openArea("craniofacial")}
            style={AREAS.craniofacial.buttonStyle}
            className="h-8 rounded-md px-3 text-xs font-medium transition-colors hover:opacity-80"
          >
            Craniofacial
          </button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{info?.title ?? "Details"}</DialogTitle>
          </DialogHeader>

          {info ? (
            <div className="space-y-4">
              <div className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${info.colorClass}`}>
                {info.subtitle}
              </div>

              {/* Common Signs Section */}
              <div>
                <h4 className="mb-2 text-sm font-semibold">Common signs</h4>
                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  {info.commonSigns.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Practical Options Section */}
              <div>
                <h4 className="mb-2 text-sm font-semibold">Practical options</h4>
                <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                  {info.practicalOptions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <p className="text-xs text-muted-foreground">
                Educational info only — not medical advice.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select an area to see details.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}