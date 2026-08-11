import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/layout/site-footer";
import { ArrowRight, BookOpen, Bot, ClipboardList, Droplets, MapPin, NotebookPen } from "lucide-react";

export default function HomePage() {
	return (
		<div className="flex min-h-screen flex-col">
			<header className="sticky top-0 z-50 border-b border-teal-200/50 bg-[#fffdf7]/85 backdrop-blur-xl dark:border-teal-800/30 dark:bg-slate-950/75">
				<div className="flex h-14 w-full items-center justify-between px-2 sm:px-4">
					<div className="flex items-center gap-2 font-bold text-teal-800 dark:text-teal-200">
						<Image src="/hidrocare-logo.png" alt="" width={28} height={28} className="h-7 w-7 rounded-md object-contain" priority />
						<span>HidroCare</span>
					</div>
					<div className="hidden">
						<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-500" />
						Trusted by people who sweat heavily — you’re not alone
					</div>
					<nav className="flex items-center gap-1 sm:gap-2" aria-label="Main navigation">
						<a
							href="#about-hyperhidrosis"
							className="hidden items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-teal-700 transition-colors hover:bg-teal-100 hover:text-teal-900 sm:inline-flex dark:text-teal-300 dark:hover:bg-teal-900/50 dark:hover:text-teal-100"
						>
							About
						</a>
						<Link href="/survey">
							<Button variant="ghost">Survey</Button>
						</Link>
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
				<section className="relative flex min-h-[85vh] flex-col items-center justify-center overflow-hidden px-4 py-20 text-slate-800 dark:text-slate-100">
					<div className="absolute inset-0 -z-10">
						<div className="absolute left-1/2 top-[12%] h-[28rem] w-[42rem] max-w-[90vw] -translate-x-1/2 rounded-[45%_55%_58%_42%/55%_42%_58%_45%] bg-white/75 shadow-[0_30px_90px_-45px_rgba(13,148,136,0.5)] dark:bg-slate-900/45" />
					</div>

					<div className="container flex flex-col items-center text-center gap-8 sm:gap-10">
						<div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/90 px-4 py-2 text-sm font-bold text-teal-800 shadow-[0_8px_25px_-14px_rgba(13,148,136,0.7)] dark:border-teal-700/60 dark:bg-teal-950/70 dark:text-teal-200">
							<span className="h-2.5 w-2.5 rounded-[60%_40%_65%_35%] bg-teal-500" />
							Trusted by people who sweat heavily — you’re not alone
						</div>
						<div className="hidden">
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

						<div className="pt-2">
							<Link href="/survey">
								<Button size="lg" className="h-auto max-w-full gap-2 bg-teal-600 px-5 py-4 text-base shadow-lg shadow-teal-900/20 hover:bg-teal-700 sm:px-8 sm:py-6 dark:bg-teal-500 dark:hover:bg-teal-600">
									<ClipboardList className="h-5 w-5" />
									Participate in our anonymous hyperhidrosis survey
									<ArrowRight className="h-4 w-4" />
								</Button>
							</Link>
						</div>
					</div>
				</section>

				{/* Member features */}
				<section className="relative border-y border-teal-200/50 bg-white/45 dark:border-teal-800/30 dark:bg-slate-950/25">
					<div className="container py-16 sm:py-20">
						<div className="mx-auto mb-10 max-w-2xl text-center">
							<p className="text-sm font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">Inside HidroCare</p>
							<h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">Tools that help you understand your sweating</h2>
							<p className="mt-3 text-slate-600 dark:text-slate-300">Create a free account to track patterns, learn from reliable resources, and get support in one private place.</p>
						</div>
						<div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
							{[
								{ icon: NotebookPen, title: "Sweat log", description: "Record symptoms, triggers, severity, and notes to see patterns over time.", accent: "bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-200" },
								{ icon: Bot, title: "AI support chatbot", description: "Ask questions and explore practical support tailored to hyperhidrosis.", accent: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-200" },
								{ icon: MapPin, title: "Find a dermatologist", description: "Use a hyperhidrosis-focused clinician finder to search for care near you.", accent: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-200" },
								{ icon: BookOpen, title: "Research & literature", description: "Browse helpful literature and current information about excessive sweating.", accent: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200" },
							].map(({ icon: Icon, title, description, accent }) => (
								<div key={title} className="rounded-[2rem] border border-white/80 bg-white/85 p-6 shadow-[0_15px_35px_-24px_rgba(15,118,110,0.6)] transition duration-300 hover:-translate-y-1.5 hover:rotate-[0.3deg] hover:shadow-[0_22px_45px_-26px_rgba(15,118,110,0.7)] dark:border-white/10 dark:bg-slate-900/80">
									<div className={`mb-4 inline-flex rounded-2xl p-3 ${accent}`}><Icon className="h-6 w-6" /></div>
									<h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{description}</p>
								</div>
							))}
						</div>
						<div className="mt-8 text-center"><Link href="/signup"><Button className="gap-2 bg-teal-600 hover:bg-teal-700">Create your free account <ArrowRight className="h-4 w-4" /></Button></Link></div>
					</div>
				</section>

				{/* About Hyperhidrosis - scroll target */}
				<section
					id="about-hyperhidrosis"
					className="scroll-mt-16 bg-[#fffaf0]/55 dark:bg-slate-900/25"
					aria-labelledby="about-hyperhidrosis-heading"
				>
					<div className="container py-16 sm:py-20">
						<div className="mx-auto max-w-3xl rounded-[2rem] border border-amber-100/80 bg-white/75 p-7 shadow-[0_18px_45px_-30px_rgba(180,120,40,0.4)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/60 sm:p-10">
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
			<SiteFooter />
		</div>
	);
}
