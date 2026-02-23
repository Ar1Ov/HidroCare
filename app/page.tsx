import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight } from "lucide-react";

export default function HomePage() {
	return (
		<div className="flex min-h-screen flex-col">
			<header className="border-b border-sky-200/50 bg-white/60 backdrop-blur-md dark:border-sky-800/30 dark:bg-slate-900/60">
				<div className="container flex h-14 items-center justify-between">
					<div className="flex items-center gap-2 font-bold text-sky-800 dark:text-sky-200">
						<FileText className="h-5 w-5" />
						<span>HidroCare</span>
					</div>
					<nav className="flex items-center gap-2">
						<Link href="/login">
							<Button variant="ghost">Log in</Button>
						</Link>
						<Link href="/signup">
							<Button>Sign up</Button>
						</Link>
					</nav>
				</div>
			</header>

			<main className="relative flex-1 flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">

  {/* Background Glow */}
  <div className="absolute inset-0 -z-10">
    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-3xl" />
  </div>

  <div className="container flex flex-col items-center text-center gap-10 py-24">

    {/* Optional Badge */}
    <div className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur text-sm text-blue-200 border border-white/10">
      Trusted by people managing hyperhidrosis daily
    </div>

    <div className="space-y-6 max-w-3xl">
      <h1 className="text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl leading-tight">
        <span className="italic text-slate-300">Your Log.</span>
        <br />
        Take control of your{" "}
        <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          Hyperhidrosis
        </span>
      </h1>

      <p className="text-xl text-slate-300 max-w-xl mx-auto">
        Track symptoms, assess severity, and receive intelligent insights —
        all in one personalized support platform.
      </p>
    </div>

    <div className="flex flex-col sm:flex-row gap-4 pt-4">
      <Link href="/signup">
        <Button size="lg" className="gap-2 px-8 py-6 text-base shadow-lg shadow-blue-900/30">
          Get started
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>

      <Link href="/login">
        <Button
          size="lg"
          variant="outline"
          className="px-8 py-6 text-base border-white/20 text-white hover:bg-white/10"
        >
          I have an account
        </Button>
      </Link>
    </div>

  </div>
</main>
		</div>
	);
}
