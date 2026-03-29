import type { Metadata } from "next";
import { AboutSlideshow } from "@/components/about/about-slideshow";

export const metadata: Metadata = {
  title: "About Hyperhidrosis | HidroCare",
  description:
    "Learn what hyperhidrosis is, why it happens, and evidence-based treatment options.",
};

export default function AboutHyperhidrosisPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10 md:py-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-teal-900 dark:text-teal-100 sm:text-4xl">
          Understanding Hyperhidrosis
        </h1>
        <p className="text-base text-muted-foreground">
          Educational overview of excessive sweating — types, common areas, and treatment options.
        </p>
      </div>

      <AboutSlideshow />
    </div>
  );
}
