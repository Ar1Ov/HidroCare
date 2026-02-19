import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight, MessageCircle } from "lucide-react";

export default function HomePage() {
	return (
		<div className="min-h-screen flex flex-col">
			<header className="border-b">
				<div className="container flex h-14 items-center justify-between">
					<div className="flex items-center gap-2 font-bold">
						<FileText className="h-5 w-5" />
						<span>Notes</span>
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

			<main className="flex-1 flex items-center justify-center">
				<div className="container flex flex-col items-center text-center gap-8">
					<div className="space-y-4 max-w-2xl">
						<h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
							Your log,
							<br />
							<span className="text-primary">Take control of hyperhidrosis</span>
						</h1>
						<p className="text-lg text-muted-foreground max-w-lg mx-auto">
						A personalized hyperhidrosis support platform. Track symptoms,
  assess severity, and receive intelligent recommendations
  to manage excessive sweating with confidence.
						</p>
					</div>

					<div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
						<Link href="/signup">
							<Button size="lg" className="gap-2">
								Get started
								<ArrowRight className="h-4 w-4" />
							</Button>
						</Link>
						<Link href="/login">
							<Button size="lg" variant="outline">
								I have an account
							</Button>
						</Link>
						<Link href="/ai-support">
							<Button size="lg" variant="secondary" className="gap-2">
								<MessageCircle className="h-4 w-4" />
								AI Support
							</Button>
						</Link>
					</div>
				</div>
			</main>
		</div>
	);
}
