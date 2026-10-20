import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BubbleBackground } from "@/components/layout/bubble-background";
import { SiteFooter } from "@/components/layout/site-footer";
import { ArrowRight, BookOpen, Bot, ClipboardList, Droplets, MapPin, NotebookPen } from "lucide-react";

export default function HomePage() {
	return (
		<div className="flex min-h-screen flex-col bg-[#f7faf9] dark:bg-[#111d2d] [&_button]:shadow-none [&_button]:hover:shadow-none [&_button]:hover:translate-y-0">
			<header className="sticky top-0 z-50 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
				<div className="flex h-14 w-full items-center justify-between px-2 sm:px-4">
					<div className="flex items-center gap-2 font-bold text-teal-800 dark:text-teal-200">
						<Image src="/hidrocare-logo.png" alt="" width={28} height={28} className="h-7 w-7 rounded-md object-contain" priority />
						<span>HidroCare</span>
                        <span className="hidden border-l border-slate-300 pl-3 text-xs font-normal text-slate-500 dark:border-slate-700 dark:text-slate-400 xl:inline">(&ldquo;The notes app for sweaty people&rdquo; and more!)</span>
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
				<section className="relative border-b border-teal-100 bg-white dark:border-slate-800 dark:bg-[#111d2d] flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 py-14 sm:py-20 text-slate-800 dark:text-slate-100">

					<div className="container flex flex-col items-center text-center gap-6 sm:gap-8">
						<div className="inline-flex items-center gap-2 text-sm font-medium text-teal-800 dark:text-teal-200">
							<span className="h-2.5 w-2.5 rounded-[60%_40%_65%_35%] bg-teal-500" />
							Sweat happens. You’re not alone.
						</div>

						<div className="w-full space-y-6 text-center">
							<h1 className="mx-auto text-4xl font-bold tracking-tight leading-tight text-slate-900 dark:text-slate-100 sm:text-5xl md:text-6xl">
                                Take control of your
                                <span className="block text-teal-700 dark:text-teal-300">sweating</span>
                            </h1>

							<p className="text-lg text-slate-600 dark:text-slate-200 max-w-xl mx-auto leading-relaxed">
								If your hands, feet, underarms, or other areas sweat more than you’d like—even when you’re not hot or stressed—we’re here. Track your sweat patterns, assess severity, and get insights that actually help.
							</p>
						</div>

                        <div className="flex w-full flex-col items-center gap-3">
                            <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
                                <Link href="/signup">
                                    <Button size="lg" className="min-h-11 w-full gap-2 bg-teal-600 px-6 text-base hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600">
                                        Start your sweat log
                                    </Button>
                                </Link>
                                <Link href="/survey">
                                    <Button size="lg" variant="outline" className="min-h-11 w-full gap-2 px-6 text-base">
                                        <ClipboardList className="h-4 w-4" /> Take the anonymous survey
                                    </Button>
                                </Link>
                            </div>
                        </div>
					</div>
				</section>

				{/* About Hyperhidrosis - scroll target */}
				<section
					id="about-hyperhidrosis"
					className="scroll-mt-16"
					aria-labelledby="about-hyperhidrosis-heading"
				>
					<BubbleBackground contained>
                    <div className="container py-16 sm:py-20">
						<div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-7 dark:border-slate-700/70 dark:bg-[#101d2f] sm:p-10">
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
				</BubbleBackground>
                </section>

				{/* Member features */}
				<section className="relative border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-[#111d2d]">
					<div className="container py-16 sm:py-20">
						<div className="mx-auto mb-10 max-w-2xl text-center">
							<p className="text-sm font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">Inside HidroCare</p>
							<h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">Tools that help you understand your sweating</h2>
							<p className="mt-3 text-slate-600 dark:text-slate-300">Create a free account to track patterns, learn from reliable resources, and get support in one private place.</p>
						</div>
						<div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
							{[
								{ icon: NotebookPen, title: "Sweat log", description: "Record symptoms, triggers, severity, and notes to see patterns over time.", accent: "bg-teal-100 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300" },
								{ icon: Bot, title: "AI support chatbot", description: "Ask questions and explore practical support tailored to hyperhidrosis.", accent: "bg-violet-100 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300" },
								{ icon: MapPin, title: "Find a dermatologist", description: "Use a hyperhidrosis-focused clinician finder to search for care near you.", accent: "bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300" },
								{ icon: BookOpen, title: "Research & literature", description: "Browse helpful literature and current information about excessive sweating.", accent: "bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300" },
							].map(({ icon: Icon, title, description, accent }) => (
								<div key={title} className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 transition-colors hover:border-teal-400 dark:border-slate-700/70 dark:bg-[#142235] dark:hover:border-teal-500/60">
									<div className={`mb-4 inline-flex rounded-full p-3 ${accent}`}><Icon className="h-6 w-6" /></div>
									<h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
									<p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{description}</p>
								</div>
							))}
						</div>
						<div className="mt-8 text-center"><Link href="/signup"><Button className="gap-2 bg-teal-600 hover:bg-teal-700">Create your free account <ArrowRight className="h-4 w-4" /></Button></Link></div>
					</div>
				</section>

			</main>
			<SiteFooter />
		</div>
	);
}
