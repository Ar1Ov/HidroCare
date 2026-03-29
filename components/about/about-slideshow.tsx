"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ClickableHHDiagram } from "@/components/about/clickable-hh-diagram";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const SLIDE_COUNT = 9;

const TREATMENTS_INDEX = 6;

const REFERENCES: {
  authors: string;
  year: number;
  title: string;
  journal: string;
  cite: string;
  doi: string;
}[] = [
  {
    authors: "Doolittle, J., Walker, P., Mills, T., & Thurston, J.",
    year: 2016,
    title: "Hyperhidrosis: an update on prevalence and severity in the United States",
    journal: "Archives of Dermatological Research",
    cite: "308(10), 743–749",
    doi: "10.1007/s00403-016-1697-9",
  },
  {
    authors: "Hamm, H.",
    year: 2014,
    title: "Impact of Hyperhidrosis on Quality of Life and its Assessment",
    journal: "Dermatologic Clinics",
    cite: "32(4), 467–476",
    doi: "10.1016/j.det.2014.06.004",
  },
  {
    authors: "Moraites, E., Vaughn, O. A., & Hill, S.",
    year: 2014,
    title: "Incidence and Prevalence of Hyperhidrosis",
    journal: "Dermatologic Clinics",
    cite: "32(4), 457–465",
    doi: "10.1016/j.det.2014.06.006",
  },
  {
    authors: "Nawrocki, S., & Cha, J.",
    year: 2019,
    title:
      "The etiology, diagnosis, and management of hyperhidrosis: A comprehensive review: Etiology and clinical work-up",
    journal: "Journal of the American Academy of Dermatology",
    cite: "81(3), 657–666",
    doi: "10.1016/j.jaad.2018.12.071",
  },
  {
    authors: "Parashar, K., Adlam, T., & Potts, G.",
    year: 2023,
    title: "The Impact of Hyperhidrosis on Quality of Life: A Review of the Literature",
    journal: "American Journal of Clinical Dermatology",
    cite: "24",
    doi: "10.1007/s40257-022-00743-7",
  },
  {
    authors: "Strutton, D. R., Kowalski, J. W., Glaser, D. A., & Stang, P. E.",
    year: 2004,
    title:
      "US prevalence of hyperhidrosis and impact on individuals with axillary hyperhidrosis: results from a national survey",
    journal: "Journal of the American Academy of Dermatology",
    cite: "51(2), 241–248",
    doi: "10.1016/j.jaad.2003.12.040",
  },
];

function SlideShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <CardContent
      className={cn(
        "flex flex-1 flex-col gap-5 px-5 pb-6 pt-0 text-[15px] leading-relaxed text-muted-foreground sm:px-6 sm:pb-8",
        className,
      )}
    >
      {children}
    </CardContent>
  );
}

function Lead({ children }: { children: React.ReactNode }) {
  return <p className="text-base font-medium leading-snug text-foreground">{children}</p>;
}

function StatBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-teal-800/15 bg-gradient-to-br from-teal-50/90 to-transparent p-4 dark:border-teal-200/10 dark:from-teal-950/40">
      <p className="text-xs font-semibold uppercase tracking-wide text-teal-800 dark:text-teal-200">
        {title}
      </p>
      <div className="mt-2 space-y-2 text-sm text-muted-foreground">{children}</div>
    </div>
  );
}

export function AboutSlideshow() {
  const [index, setIndex] = useState(0);
  const pointerStartX = useRef<number | null>(null);

  const goTo = useCallback((next: number) => {
    setIndex(Math.max(0, Math.min(SLIDE_COUNT - 1, next)));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const applyHash = () => {
      if (window.location.hash === "#treatments") {
        setIndex(TREATMENTS_INDEX);
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo(index - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goTo(index + 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        goTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goTo(SLIDE_COUNT - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, goTo]);

  const onPointerDown = (e: React.PointerEvent) => {
    pointerStartX.current = e.clientX;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const start = pointerStartX.current;
    pointerStartX.current = null;
    if (start == null) return;
    const dx = e.clientX - start;
    const threshold = 48;
    if (dx > threshold) goTo(index - 1);
    else if (dx < -threshold) goTo(index + 1);
  };

  const slides = [
    {
      title: "What Is Hyperhidrosis?",
      kicker: "Basics",
      panelId: "about-slide-0",
      content: (
        <SlideShell>
          <Lead>
            Hyperhidrosis is a medical condition where a person sweats more than the body needs for cooling
            itself.
          </Lead>
          <p>
            It is not just &ldquo;sweating a lot&rdquo; from heat or exercise — the sweating goes beyond what
            is needed for temperature regulation.
          </p>
          <p>
            It can affect the hands, feet, underarms, face, or multiple areas at once. In some people it is
            localized, and in others it can be more generalized.
          </p>
        </SlideShell>
      ),
    },
    {
      title: "Two Main Types",
      kicker: "Classification",
      panelId: "about-slide-1",
      content: (
        <SlideShell>
          <p className="text-foreground">There are two main types:</p>
          <div className="space-y-4 border-l-2 border-teal-600/50 pl-4 dark:border-teal-400/40">
            <div>
              <h3 className="font-semibold text-foreground">Primary focal hyperhidrosis</h3>
              <p className="mt-1">
                Happens without another clear medical cause, usually in specific body areas. It often begins
                in childhood or adolescence and may run in families.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Secondary hyperhidrosis</h3>
              <p className="mt-1">
                Linked to another medical condition or to medications — often more generalized. The section{" "}
                <strong className="text-foreground">Types of Hyperhidrosis</strong> covers causes, clues, and
                work-up in depth.
              </p>
            </div>
          </div>
        </SlideShell>
      ),
    },
    {
      title: "How Common Is It?",
      kicker: "Epidemiology",
      panelId: "about-slide-2",
      content: (
        <SlideShell>
          <StatBlock title="United States">
            <p>
              Commonly cited estimates put prevalence at about <strong className="text-foreground">4.8%</strong>
              , or roughly <strong className="text-foreground">15.3 million</strong> people. The American
              Academy of Dermatology has also cited an estimate of about{" "}
              <strong className="text-foreground">15.8 million</strong> people in the U.S.
            </p>
            <p className="text-xs">
              Some older studies reported lower U.S. estimates, around{" "}
              <strong className="text-foreground">2.8%</strong>, which is one reason you may see different
              numbers depending on the source and year.
            </p>
          </StatBlock>
          <p>
            Worldwide, the exact rate is less certain and varies by study and method, but research shows it
            is common and likely underreported.
          </p>
        </SlideShell>
      ),
    },
    {
      title: "Primary Hyperhidrosis: Patterns & Impact",
      kicker: "Quality of life",
      panelId: "about-slide-3",
      content: (
        <SlideShell>
          <ul className="list-none space-y-3">
            <li className="flex gap-3">
              <span
                className="mt-1.5 size-1.5 shrink-0 rounded-full bg-teal-600 dark:bg-teal-400"
                aria-hidden
              />
              <span>
                Primary hyperhidrosis often starts in <strong className="text-foreground">childhood or adolescence</strong>
                , which is part of why it matters for teens.
              </span>
            </li>
            <li className="flex gap-3">
              <span
                className="mt-1.5 size-1.5 shrink-0 rounded-full bg-teal-600 dark:bg-teal-400"
                aria-hidden
              />
              <span>It often runs in families.</span>
            </li>
            <li className="flex gap-3">
              <span
                className="mt-1.5 size-1.5 shrink-0 rounded-full bg-teal-600 dark:bg-teal-400"
                aria-hidden
              />
              <span>
                Sweating from primary hyperhidrosis usually happens during <strong className="text-foreground">waking hours</strong> and often gets better or stops during sleep.
              </span>
            </li>
          </ul>
          <div className="rounded-lg border border-border/80 bg-muted/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground">Daily impact</p>
            <p className="mt-2 text-sm">
              It can have a large quality-of-life impact, including embarrassment, stress, social anxiety, and
              interference with school, work, writing, handshakes, clothing choices, and everyday activities.
            </p>
          </div>
          <p className="text-sm">
            Many people do not seek treatment, often because they do not realize it is a real medical
            condition or think nothing can be done.
          </p>
        </SlideShell>
      ),
    },
    {
      title: "Secondary Hyperhidrosis",
      kicker: "Quality of life",
      panelId: "about-slide-4",
      content: (
        <SlideShell className="gap-4">
          <p>
            Secondary hyperhidrosis is excessive sweating that happens because of another medical condition or
            as a side effect of a medication, rather than as a primary condition on its own.
          </p>
          <p>
            It is more often generalized, meaning it affects larger areas of the body, though it can sometimes
            be focal.
          </p>
          <p>
            Unlike primary hyperhidrosis, secondary hyperhidrosis is often linked to an identifiable trigger or
            underlying cause.
          </p>
          <div className="rounded-lg border border-border/80 bg-muted/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground">Possible causes</p>
            <p className="mt-2 text-sm">
              Endocrine or metabolic disorders, infections, neurologic conditions, malignancies, and medication
              side effects. Common medication-related causes can include drugs that affect the nervous system,
              hormones, or body temperature regulation.
            </p>
          </div>
          <div className="rounded-lg border border-teal-800/15 bg-teal-50/50 p-4 dark:border-teal-200/10 dark:bg-teal-950/35">
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-900 dark:text-teal-100">
              When it may be more concerning
            </p>
            <p className="mt-2 text-sm">
              Secondary hyperhidrosis may warrant closer attention when sweating starts suddenly, becomes much
              worse than usual, or happens with night sweats.
            </p>
          </div>
          <p className="text-sm">
            A key part of diagnosis is ruling out secondary causes first, because treatment may need to focus on
            the underlying condition, not just the sweating itself. In general, managing the underlying cause
            can improve the sweating, although symptom-targeted treatments may still be used.
          </p>
        </SlideShell>
      ),
    },
    {
      title: "Common Areas Affected",
      kicker: "Interactive map",
      panelId: "about-slide-5",
      content: (
        <SlideShell className="gap-4">
          <p>
            Tap a region on the figure to learn more about common signs and practical options for that area.
          </p>
          <div className="rounded-lg border border-dashed border-teal-800/20 bg-muted/20 p-3 dark:border-teal-200/15">
            <ClickableHHDiagram />
          </div>
        </SlideShell>
      ),
    },
    {
      title: "Treatment Options",
      kicker: "Care pathways",
      panelId: "about-slide-6",
      anchorId: "treatments",
      content: (
        <SlideShell className="gap-6">
          <Lead>Treatments do exist — the right approach depends on severity, body area, and your clinician.</Lead>
          <p className="text-sm">
            Options include clinical-strength antiperspirants, prescription topical or oral treatments,
            iontophoresis, botulinum toxin injections, and in some cases device-based or surgical approaches.
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Clinical-strength antiperspirants</h3>
              <p className="text-sm">
                Aluminum chloride–based products are often a first step; many are applied at night to reduce
                sweat gland activity.
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Prescription treatments</h3>
              <p className="text-sm">
                Topical or oral medications may help in some situations and should be chosen with a
                clinician.
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Iontophoresis</h3>
              <p className="text-sm">
                A device uses mild electrical current through water to reduce sweating, often for hands or
                feet.
              </p>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Botulinum toxin</h3>
              <p className="text-sm">
                Temporarily reduces sweat gland stimulation; commonly used for underarms in many settings.
              </p>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <h3 className="text-sm font-semibold text-foreground">Devices or surgery (selected cases)</h3>
              <p className="text-sm">
                For severe cases, other device or surgical options may be considered after discussion with a
                specialist.
              </p>
            </div>
          </div>
          <p className="border-t border-border/60 pt-4 text-xs text-muted-foreground">
            This is general education, not medical advice. Choices should be made with a qualified health care
            provider.
          </p>
        </SlideShell>
      ),
    },
    {
      title: "When to See a Doctor",
      kicker: "Red flags",
      panelId: "about-slide-7",
      content: (
        <SlideShell className="gap-4">
          <p className="text-sm">Seek medical evaluation promptly if you notice:</p>
          <ul className="space-y-2.5 text-sm">
            {[
              "Sudden onset of sweating",
              "Night sweats with fever or unexplained weight loss",
              "Chest pain, dizziness, fainting, or severe weakness",
              "Sweating that significantly affects daily life",
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <span className="text-teal-600 dark:text-teal-400" aria-hidden>
                  →
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            Educational information only — not a substitute for professional diagnosis or treatment. If
            symptoms are sudden or severe, consider urgent or emergency care as appropriate.
          </p>
        </SlideShell>
      ),
    },
    {
      title: "References",
      kicker: "Sources",
      panelId: "about-slide-8",
      content: (
        <SlideShell className="max-h-[min(70vh,32rem)] gap-4 overflow-y-auto pr-1 sm:max-h-none sm:overflow-visible">
          <p className="text-xs text-muted-foreground">
            Selected peer-reviewed sources used in preparing this overview. Links open the publisher DOI page.
          </p>
          <ol className="list-decimal space-y-5 pl-5 text-sm marker:font-semibold marker:text-teal-800 dark:marker:text-teal-200">
            {REFERENCES.map((ref) => (
              <li key={ref.doi} className="pl-1">
                <p className="text-muted-foreground">
                  {ref.authors} ({ref.year}). {ref.title}. <em className="text-foreground/90">{ref.journal}</em>
                  , {ref.cite}.{" "}
                  <a
                    href={`https://doi.org/${ref.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all font-medium text-teal-700 underline-offset-2 hover:underline dark:text-teal-300"
                  >
                    https://doi.org/{ref.doi}
                  </a>
                </p>
              </li>
            ))}
          </ol>
        </SlideShell>
      ),
    },
  ];

  const current = slides[index];

  return (
    <div className="mt-8">
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="About hyperhidrosis sections"
        className="relative touch-pan-y"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          pointerStartX.current = null;
        }}
      >
        <div className="flex min-h-[min(72vh,38rem)] flex-col">
          <Card
            id={current.anchorId}
            className="flex flex-1 flex-col overflow-hidden rounded-2xl border-2 border-teal-900/12 bg-card shadow-lg ring-1 ring-black/5 dark:border-teal-100/12 dark:ring-white/5"
          >
            <div className="h-1 bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-600 opacity-90 dark:from-teal-500 dark:via-teal-400 dark:to-cyan-500" />
            <CardHeader className="space-y-1.5 pb-3 pt-5 sm:px-7 sm:pt-6">
              <div className="flex flex-row flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  {current.kicker ? (
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-700/90 dark:text-teal-300/90">
                      {current.kicker}
                    </p>
                  ) : null}
                  <CardTitle className="text-xl font-semibold tracking-tight text-teal-950 dark:text-teal-50 sm:text-2xl">
                    {current.title}
                  </CardTitle>
                </div>
                <p
                  className="rounded-full border border-teal-800/15 bg-teal-50/80 px-2.5 py-1 text-xs font-semibold tabular-nums text-teal-900 dark:border-teal-200/20 dark:bg-teal-950/50 dark:text-teal-100"
                  aria-live="polite"
                >
                  {index + 1} / {SLIDE_COUNT}
                </p>
              </div>
            </CardHeader>
            <div
              key={current.panelId}
              id={current.panelId}
              role="tabpanel"
              aria-label={current.title}
              className="animate-in fade-in slide-in-from-right-2 flex flex-1 flex-col duration-300"
            >
              {current.content}
            </div>
          </Card>
        </div>

        <div className="mt-7 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex w-full items-center justify-center gap-2 sm:w-auto sm:justify-start">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-10 shrink-0 rounded-full border-teal-900/25 shadow-sm dark:border-teal-100/25"
              aria-label="Previous section"
              disabled={index === 0}
              onClick={() => goTo(index - 1)}
            >
              <ChevronLeft className="size-5" />
            </Button>
            <div className="flex max-w-[min(100%,20rem)] flex-wrap items-center justify-center gap-2 px-1 sm:gap-1.5">
              {slides.map((slide, i) => (
                <button
                  key={slide.panelId}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-controls={slide.panelId}
                  tabIndex={i === index ? 0 : -1}
                  className={cn(
                    "size-2 rounded-full transition-all",
                    i === index
                      ? "scale-125 bg-teal-600 shadow-sm dark:bg-teal-400"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50",
                  )}
                  onClick={() => goTo(i)}
                  aria-label={`Go to: ${slide.title}`}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-10 shrink-0 rounded-full border-teal-900/25 shadow-sm dark:border-teal-100/25"
              aria-label="Next section"
              disabled={index === SLIDE_COUNT - 1}
              onClick={() => goTo(index + 1)}
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>
          <p className="max-w-xs text-center text-xs text-muted-foreground sm:max-w-sm sm:text-right">
            Arrow keys · swipe · dots
          </p>
        </div>
      </div>
    </div>
  );
}
