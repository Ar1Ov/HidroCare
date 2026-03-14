import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, Droplets } from "lucide-react";

export default function HomePage() {
	return (
		<div className="flex min-h-screen flex-col">
			<header className="sticky top-0 z-50 border-b border-teal-200/40 bg-white/80 backdrop-blur-md dark:border-teal-800/30 dark:bg-slate-900/80">
				<div className="container flex h-14 items-center justify-between">
					<div className="flex items-center gap-2 font-bold text-teal-800 dark:text-teal-200">
						<FileText className="h-5 w-5" />
						<span>HidroCare</span>
					</div>
					<nav className="flex items-center gap-1 sm:gap-2" aria-label="Main navigation">
						<a
							href="#about-hyperhidrosis"
							className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-100 hover:text-teal-900 dark:text-teal-300 dark:hover:bg-teal-900/50 dark:hover:text-teal-100"
						>
							About
						</a>
						<Link href="/login">
							<Button variant="ghost">Log in</Button>
						</Link>
						<Link href="/signup">
							<Button>Sign up</Button>
						</Link>
					</nav>
				</div>
			</header>

			<main className="flex-1">

				{/* Hero */}
				<section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/40 px-4 py-20 text-slate-800 dark:from-slate-950 dark:via-teal-950/30 dark:to-slate-900 dark:text-slate-100">
					<div className="absolute inset-0 -z-10">
						<div className="absolute top-1/4 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-teal-300/20 blur-3xl dark:bg-teal-500/10" />
						<div className="absolute bottom-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-cyan-200/15 blur-3xl dark:bg-cyan-500/5" />
					</div>

					<div className="container flex flex-col items-center text-center gap-8 sm:gap-10">
						<div className="rounded-full border border-teal-200/60 bg-white/60 px-4 py-2 text-sm text-teal-700 dark:border-teal-700/40 dark:bg-teal-950/40 dark:text-teal-300">
							Trusted by people who sweat heavily — you’re not alone
						</div>

						<div className="space-y-6 max-w-2xl">
							<h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl leading-tight">
								<span className="text-slate-600 dark:text-slate-400">Your log.</span>
								<br />
								Take control of your{" "}
								<span className="bg-gradient-to-r from-teal-600 to-cyan-500 bg-clip-text text-transparent dark:from-teal-400 dark:to-cyan-400">
									sweating
								</span>
							</h1>

							<p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
								About 1 in 20 people live with excessive sweating. If your hands, feet, underarms, or other areas sweat more than you’d like—even when you’re not hot or stressed—we’re here. Track your sweat patterns, assess severity, and get insights that actually help.
							</p>
						</div>

						<div className="flex flex-col sm:flex-row gap-4 pt-2">
							<Link href="/signup">
								<Button size="lg" className="gap-2 px-8 py-6 text-base shadow-lg shadow-teal-900/20 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600">
									Get started
									<ArrowRight className="h-4 w-4" />
								</Button>
							</Link>
							<Link href="/login">
								<Button
									size="lg"
									variant="outline"
									className="px-8 py-6 text-base border-teal-300 dark:border-teal-600 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/50"
								>
									I have an account
								</Button>
							</Link>
						</div>
					</div>
				</section>

				{/* About Hyperhidrosis - scroll target */}
				<section
					id="about-hyperhidrosis"
					className="scroll-mt-16 border-t border-teal-200/50 bg-white dark:border-teal-800/30 dark:bg-slate-900/50"
					aria-labelledby="about-hyperhidrosis-heading"
				>
					<div className="container py-16 sm:py-20">
						<div className="mx-auto max-w-2xl">
							<div className="mb-6 inline-flex items-center gap-2 rounded-full bg-teal-100 dark:bg-teal-900/40 px-3 py-1">
								<Droplets className="h-4 w-4 text-teal-600 dark:text-teal-400" aria-hidden />
								<span className="text-sm font-medium text-teal-700 dark:text-teal-300">What is hyperhidrosis?</span>
							</div>
							<h2 id="about-hyperhidrosis-heading" className="text-2xl font-bold text-slate-800 dark:text-slate-100 sm:text-3xl mb-4">
								Excessive sweating is real and manageable
							</h2>
							<p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base sm:text-lg">
								1 in 20 people experience <strong>hyperhidrosis</strong>, a medical condition that causes excessive sweating — far more than your body needs to cool down. If your hands, feet, underarms, face, or other areas sweat heavily even when you’re not hot, nervous, or exercising, you may have it. Sweat can feel embarrassing or isolating, but it’s a real condition with real treatments. HidroCare helps you track your sweat patterns, understand your triggers, and take steps toward better control.
							</p>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
