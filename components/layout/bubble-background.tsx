/**
 * Bubble-like background for HidroCare (hyperhidrosis/water theme).
 * Used globally across all pages.
 */
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

const SMALL_BUBBLES = [
  [20, "12%", "80%"],
  [35, "28%", "20%"],
  [45, "62%", "65%"],
  [30, "78%", "40%"],
  [25, "45%", "88%"],
  [40, "92%", "55%"],
] as const;

export function BubbleBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-50/80 via-blue-50/60 to-cyan-50/80 dark:from-slate-950 dark:via-slate-900/95 dark:to-sky-950/80">
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
        {SMALL_BUBBLES.map(([size, left, top], i) => (
          <div
            key={`small-${i}`}
            className="absolute rounded-full bg-cyan-200/30 dark:bg-cyan-500/10"
            style={{ width: size, height: size, left, top }}
          />
        ))}
      </div>
      <div className="relative z-10 min-h-screen flex flex-col">{children}</div>
    </div>
  );
}
