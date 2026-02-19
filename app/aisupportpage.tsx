"use client";

import { MessageCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const BUBBLES = [
  { size: 120, left: "5%", top: "10%", delay: "0s", dx: 8, dy: -12 },
  { size: 80, left: "15%", top: "60%", delay: "1.2s", dx: -6, dy: 10 },
  { size: 160, left: "25%", top: "35%", delay: "0.4s", dx: 12, dy: -8 },
  { size: 60, left: "40%", top: "75%", delay: "2s", dx: -10, dy: 6 },
  { size: 100, left: "55%", top: "15%", delay: "0.8s", dx: 6, dy: 14 },
  { size: 140, left: "70%", top: "50%", delay: "1.6s", dx: -14, dy: -10 },
  { size: 90, left: "85%", top: "25%", delay: "0.2s", dx: 10, dy: 8 },
  { size: 70, left: "90%", top: "70%", delay: "1.4s", dx: -8, dy: -6 },
  { size: 110, left: "35%", top: "5%", delay: "2.2s", dx: -12, dy: 10 },
  { size: 50, left: "75%", top: "85%", delay: "0.6s", dx: 6, dy: -8 },
  { size: 130, left: "50%", top: "45%", delay: "1s", dx: -10, dy: 12 },
  { size: 95, left: "8%", top: "40%", delay: "1.8s", dx: 14, dy: 6 },
];

const SUGGESTIONS = [
  "What triggers excessive sweating?",
  "Tips for managing sweat at work",
  "When should I see a doctor?",
  "Lifestyle changes that help",
];

export default function SupportPage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-sky-50/80 via-blue-50/60 to-cyan-50/80 dark:from-slate-950 dark:via-slate-900/95 dark:to-sky-950/80">
      {/* Bubble layer */}
      <div className="pointer-events-none fixed inset-0 z-0">
        {BUBBLES.map((b, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-sky-200/40 dark:bg-sky-400/15 animate-[bubble-float_8s_ease-in-out_infinite]"
            style={{
              width: b.size,
              height: b.size,
              left: b.left,
              top: b.top,
              animationDelay: b.delay,
              "--bubble-dx": `${b.dx}px`,
              "--bubble-dy": `${b.dy}px`,
            } as React.CSSProperties}
          />
        ))}
        {/* Extra smaller bubbles for density */}
        {[
          [20, "12%", "80%"],
          [35, "28%", "20%"],
          [45, "62%", "65%"],
          [30, "78%", "40%"],
          [25, "45%", "88%"],
          [40, "92%", "55%"],
        ].map(([size, left, top], i) => (
          <div
            key={`small-${i}`}
            className="absolute rounded-full bg-cyan-200/30 dark:bg-cyan-500/10"
            style={{
              width: size,
              height: size,
              left,
              top,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="border-b border-sky-200/50 dark:border-sky-800/30 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md">
          <div className="container flex h-14 max-w-3xl items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold text-sky-800 dark:text-sky-200"
            >
              <MessageCircle className="h-5 w-5" />
              <span>HidroCare</span>
            </Link>
            <div className="flex items-center gap-2 rounded-full bg-sky-100/80 dark:bg-sky-900/40 px-3 py-1.5 text-sm font-medium text-sky-700 dark:text-sky-300">
              <Sparkles className="h-4 w-4" />
              AI Support
            </div>
          </div>
        </header>

        <main className="container flex flex-1 flex-col items-center py-8 md:py-12">
          <div className="w-full max-w-2xl space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100 sm:text-4xl">
                AI Support
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto text-base">
                Ask questions, understand triggers, and explore options. This is
                educational support — not medical advice.
              </p>
            </div>

            <Card className="border-sky-200/60 dark:border-sky-800/40 bg-white/80 dark:bg-slate-900/80 shadow-lg shadow-sky-100/50 dark:shadow-sky-950/30 backdrop-blur-sm overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-sky-900 dark:text-sky-100">
                  Quick questions
                </CardTitle>
                <CardDescription>
                  Tap a suggestion to get started, or type your own.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      className="rounded-full border border-sky-200 dark:border-sky-700/50 bg-sky-50/80 dark:bg-sky-900/30 px-4 py-2 text-sm text-sky-800 dark:text-sky-200 transition-colors hover:bg-sky-100 dark:hover:bg-sky-800/40 hover:border-sky-300 dark:hover:border-sky-600"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                <div className="rounded-xl border border-sky-200/60 dark:border-sky-800/40 bg-sky-50/50 dark:bg-slate-800/50 p-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Coming next: chat UI, safe guidance, and saved summaries.
                  </p>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Ask anything about hyperhidrosis..."
                      className="min-h-[88px] resize-none border-sky-200 dark:border-sky-700/50 bg-white dark:bg-slate-900/50"
                      disabled
                    />
                    <Button
                      size="icon"
                      className="h-[88px] w-12 shrink-0 rounded-xl bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
                      disabled
                    >
                      <MessageCircle className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
