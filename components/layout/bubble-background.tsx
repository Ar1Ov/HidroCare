const SHAPES = [
  { className: "left-[-7rem] top-[7rem] h-72 w-72 bg-teal-200/35 dark:bg-teal-500/10", radius: "60% 40% 52% 48% / 45% 58% 42% 55%", delay: "0s" },
  { className: "right-[-5rem] top-[18rem] h-64 w-64 bg-sky-200/35 dark:bg-sky-500/10", radius: "42% 58% 35% 65% / 62% 38% 62% 38%", delay: "-3s" },
  { className: "bottom-[-8rem] left-[18%] h-80 w-96 bg-amber-100/45 dark:bg-amber-400/5", radius: "65% 35% 58% 42% / 40% 55% 45% 60%", delay: "-5s" },
  { className: "bottom-[8%] right-[8%] h-56 w-56 bg-violet-100/40 dark:bg-violet-500/8", radius: "48% 52% 68% 32% / 62% 42% 58% 38%", delay: "-7s" },
] as const;

export function BubbleBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(150deg,#fffdf7_0%,#f4fffc_45%,#f3fbff_100%)] dark:bg-[linear-gradient(150deg,#0d1728_0%,#102538_52%,#102b32_100%)]">
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        {SHAPES.map((shape, index) => (
          <div key={index} className={`soft-drift absolute blur-[2px] ${shape.className}`} style={{ borderRadius: shape.radius, animation: "soft-drift 14s ease-in-out infinite", animationDelay: shape.delay }} />
        ))}
        <div className="absolute left-[8%] top-[62%] h-12 w-9 rotate-12 rounded-[70%_30%_65%_35%/75%_45%_55%_25%] bg-cyan-300/35 dark:bg-cyan-400/12" />
        <div className="absolute right-[20%] top-[10%] h-16 w-12 -rotate-12 rounded-[65%_35%_60%_40%/75%_45%_55%_25%] bg-teal-300/30 dark:bg-teal-400/10" />
      </div>
      <div className="relative z-10 flex min-h-screen flex-col">{children}</div>
    </div>
  );
}
