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
  bullets: string[];
};

export function ClickableHHDiagram() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<AreaKey | null>(null);

  const AREAS: Record<AreaKey, AreaInfo> = useMemo(
    () => ({
      palmar: {
        key: "palmar",
        title: "Palmar (Hands)",
        subtitle: "Common signs & practical options",
        colorClass:
          "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100",
        buttonStyle: {
          backgroundColor: "#000000",
          color: "#34d399",
          border: "none",
        },
        bullets: [
          "Sweaty palms can affect writing, devices, handshakes",
          "First steps: antiperspirant at night, absorbent wipes",
          "If persistent: iontophoresis is often used for hands",
        ],
      },
      plantar: {
        key: "plantar",
        title: "Plantar (Feet)",
        subtitle: "Common signs & practical options",
        colorClass:
          "bg-indigo-100 text-indigo-900 dark:bg-indigo-900/30 dark:text-indigo-100",
        buttonStyle: {
          backgroundColor: "#000000",
          color: "#818cf8",
          border: "none",
        },
        bullets: [
          "Breathable shoes/socks can help",
          "Rotate shoes, use moisture-wicking socks",
          "Iontophoresis can also be used for feet",
        ],
      },
      axillary: {
        key: "axillary",
        title: "Axillary (Underarms)",
        subtitle: "Common signs & practical options",
        colorClass:
          "bg-rose-100 text-rose-900 dark:bg-rose-900/30 dark:text-rose-100",
        buttonStyle: {
          backgroundColor: "#000000",
          color: "#fb7185",
          border: "none",
        },
        bullets: [
          "Night application of antiperspirant is common",
          "Loose/breathable layers can reduce discomfort",
          "Some people discuss in-office options with clinicians",
        ],
      },
      craniofacial: {
        key: "craniofacial",
        title: "Craniofacial (Face & Scalp)",
        subtitle: "Common signs & practical options",
        colorClass:
          "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100",
        buttonStyle: {
          backgroundColor: "#000000",
          color: "#fbbf24",
          border: "none",
        },
        bullets: [
          "Triggers can include heat, stress, spicy food",
          "Cooling strategies: fans, cold water, breathable hats",
          "If new/sudden or severe, consider medical evaluation",
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
          Click an area on the diagram to see quick info and common options.
        </p>

        {/* Diagram wrapper MUST have size */}
        <div className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-xl border border-sky-200/60 bg-sky-50/30 dark:border-sky-800/40 dark:bg-slate-800/30">
          <Image
            src="/images/hyperhidrosis-diagram.png"
            alt="Hyperhidrosis diagram"
            width={600}
            height={350}
            className="h-auto w-full select-none"
            priority
          />

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

        {/* Manual buttons with inline styles */}
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
            <div className="space-y-3">
              <div className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${info.colorClass}`}>
                {info.subtitle}
              </div>

              <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                {info.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>

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