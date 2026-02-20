import type { Metadata } from "next";
import { ClickableHHDiagram } from "@/components/about/clickable-hh-diagram";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About Hyperhidrosis | HidroCare",
  description:
    "Learn what hyperhidrosis is, why it happens, and evidence-based treatment options.",
};

export default function AboutHyperhidrosisPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 md:py-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100 sm:text-4xl">
          Understanding Hyperhidrosis
        </h1>
        <p className="text-base text-muted-foreground">
          Educational overview of excessive sweating — types, common areas, and treatment options.
        </p>
      </div>

      <div className="mt-8 space-y-8">
        {/* WHAT IS IT */}
        <Card>
          <CardHeader>
            <CardTitle>What Is Hyperhidrosis?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Hyperhidrosis is a condition characterized by excessive sweating that goes beyond what the body
              needs for temperature regulation.
            </p>
            <p>
              It can affect specific areas such as the palms, underarms, soles, or face — or less commonly,
              larger areas of the body.
            </p>
            <p>
              For many people, sweating can happen even when they are not hot, exercising, or anxious.
            </p>
          </CardContent>
        </Card>

        {/* TYPES */}
        <Card>
          <CardHeader>
            <CardTitle>Types of Hyperhidrosis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">Primary (Focal)</h3>
              <p>
                Usually begins in childhood or adolescence. Often affects hands, feet, underarms, or face.
                Typically appears on both sides (symmetrical) and is not caused by another medical condition.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">Secondary (Generalized)</h3>
              <p>
                Can be linked to an underlying medical condition or medication and may involve larger areas of
                the body. It can begin later in life.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* COMMON AREAS */}
        <Card>
          <CardHeader>
            <CardTitle>Common Areas Affected</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-emerald-700 dark:text-emerald-300">Palmar</strong> – Hands
              </li>
              <li>
                <strong className="text-indigo-700 dark:text-indigo-300">Plantar</strong> – Feet
              </li>
              <li>
                <strong className="text-rose-700 dark:text-rose-300">Axillary</strong> – Underarms
              </li>
              <li>
                <strong className="text-amber-700 dark:text-amber-300">Craniofacial</strong> – Face &amp; scalp
              </li>
            </ul>

            <ClickableHHDiagram />
          </CardContent>
        </Card>

        {/* TREATMENTS */}
        <Card id="treatments">
          <CardHeader>
            <CardTitle>Treatment Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-relaxed text-muted-foreground">
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">1. Clinical-Strength Antiperspirants</h3>
              <p>
                Aluminum chloride–based products are often a first step. Many are applied at night to reduce
                sweat gland activity.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">2. Iontophoresis</h3>
              <p>
                A device that uses mild electrical current through water to reduce sweating in hands or feet.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">3. Prescription Options</h3>
              <p>
                Some topical or oral treatments may reduce sweating, depending on the situation. A clinician
                should guide this choice.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">4. Botulinum Toxin (Botox)</h3>
              <p>
                Temporarily reduces sweat gland stimulation. Commonly used for underarm sweating in many
                settings.
              </p>
            </div>

            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">5. Procedures (Severe Cases)</h3>
              <p>
                In severe cases, procedures may be considered. These are typically last-resort options and
                should be discussed with a specialist.
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Treatment choices depend on the person and body area. This is general education — not medical
              advice.
            </p>
          </CardContent>
        </Card>

        {/* WHEN TO SEE DOCTOR */}
        <Card>
          <CardHeader>
            <CardTitle>When to See a Doctor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <ul className="list-disc space-y-2 pl-5">
              <li>Sudden onset of sweating</li>
              <li>Night sweats with fever or unexplained weight loss</li>
              <li>Chest pain, dizziness, fainting, or severe weakness</li>
              <li>Sweating that significantly impacts daily life</li>
            </ul>

            <p className="text-xs text-muted-foreground">
              This page provides educational information only and is not medical advice. If symptoms are
              sudden or severe, consider seeking medical care.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}