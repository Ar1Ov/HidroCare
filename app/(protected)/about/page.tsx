import type { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About Hyperhidrosis | HidroCare",
  description:
    "Learn what hyperhidrosis is, why it happens, and evidence-based treatment options.",
};

export default function AboutHyperhidrosisPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 md:py-12">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100 sm:text-4xl">
          Understanding Hyperhidrosis
        </h1>
      </div>

      <div className="mt-8 space-y-8">

        {/* WHAT IS IT */}
        <Card>
          <CardHeader>
            <CardTitle>What Is Hyperhidrosis?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Hyperhidrosis is a condition characterized by excessive sweating that
              goes beyond what the body needs for temperature regulation.
            </p>
            <p>
              It can affect specific areas such as the palms, underarms, soles,
              or face — or less commonly, the entire body.
            </p>
            <p>
              For many people, sweating occurs even when they are not hot,
              exercising, or anxious.
            </p>
          </CardContent>
        </Card>

        {/* TYPES */}
        <Card>
          <CardHeader>
            <CardTitle>Types of Hyperhidrosis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground">Primary (Focal)</h3>
              <p>
                Usually begins in childhood or adolescence.
                Often affects hands, feet, underarms, or face.
                Typically symmetrical and not caused by another medical condition.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground">Secondary (Generalized)</h3>
              <p>
                Caused by an underlying medical condition or medication.
                May involve large areas of the body.
                Can begin later in life.
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
                <strong className="text-emerald-700 dark:text-emerald-300">
                  Palmar
                </strong>{" "}
                Hands
              </li>
              <li>
                <strong className="text-indigo-700 dark:text-indigo-300">
                  Plantar
                </strong>{" "}
                Feet
              </li>
              <li>
                <strong className="text-rose-700 dark:text-rose-300">
                  Axillary
                </strong>{" "}
                Underarms
              </li>
              <li>
                <strong className="text-amber-700 dark:text-amber-300">
                  Craniofacial
                </strong>{" "}
                Face & scalp
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* TREATMENTS */}
        <Card>
          <CardHeader>
            <CardTitle>Treatment Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-sm leading-relaxed text-muted-foreground">

            <div>
              <h3 className="font-semibold text-foreground">
                1. Clinical-Strength Antiperspirants
              </h3>
              <p>
                Aluminum chloride–based products are often first-line treatment.
                Applied at night to reduce sweat gland activity.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground">
                2. Iontophoresis
              </h3>
              <p>
                A medical device that uses mild electrical current through water
                to reduce sweating in hands or feet.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground">
                3. Prescription Medications
              </h3>
              <p>
                Oral or topical medications may reduce sweating in certain cases.
                A healthcare provider should guide this decision.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground">
                4. Botulinum Toxin (Botox)
              </h3>
              <p>
                Temporarily blocks the nerves that stimulate sweat glands.
                Commonly used for underarm sweating.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground">
                5. Surgical Options
              </h3>
              <p>
                In severe cases, procedures like endoscopic thoracic sympathectomy
                may be considered. This is typically a last-resort treatment.
              </p>
            </div>
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
              <li>Night sweats with fever or weight loss</li>
              <li>Chest pain, dizziness, or fainting</li>
              <li>Sweating that significantly impacts daily life</li>
            </ul>
            <p className="text-xs text-muted-foreground">
              This page provides educational information only and is not medical advice.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}