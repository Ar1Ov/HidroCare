"use client";

import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const SUGGESTIONS = [
	"What triggers excessive sweating?",
	"Tips for managing sweat at work",
	"When should I see a doctor?",
	"Lifestyle changes that help",
];

export function SupportPageContent() {
	return (
		<div className="flex flex-1 flex-col items-center py-8 md:py-12">
			<div className="w-full max-w-2xl space-y-6">
				<div className="space-y-2 text-center">
					<h1 className="text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100 sm:text-4xl">
						AI Support
					</h1>
					<p className="mx-auto max-w-lg text-base text-muted-foreground">
						Ask questions, understand triggers, and explore options. This is
						educational support — not medical advice.
					</p>
				</div>

				<Card className="overflow-hidden border-sky-200/60 bg-white/80 shadow-lg shadow-sky-100/50 backdrop-blur-sm dark:border-sky-800/40 dark:bg-slate-900/80 dark:shadow-sky-950/30">
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
									className="rounded-full border border-sky-200 bg-sky-50/80 px-4 py-2 text-sm text-sky-800 transition-colors hover:border-sky-300 hover:bg-sky-100 dark:border-sky-700/50 dark:bg-sky-900/30 dark:text-sky-200 dark:hover:border-sky-600 dark:hover:bg-sky-800/40"
								>
									{q}
								</button>
							))}
						</div>

						<div className="rounded-xl border border-sky-200/60 bg-sky-50/50 p-4 dark:border-sky-800/40 dark:bg-slate-800/50">
							<p className="mb-3 text-sm text-muted-foreground">
								Coming next: chat UI, safe guidance, and saved summaries.
							</p>
							<div className="flex gap-2">
								<Textarea
									placeholder="Ask anything about hyperhidrosis..."
									className="min-h-[88px] resize-none border-sky-200 dark:border-sky-700/50 dark:bg-slate-900/50"
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
		</div>
	);
}
