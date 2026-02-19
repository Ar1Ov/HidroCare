"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const SUGGESTIONS = [
	"What triggers excessive sweating?",
	"Tips for managing sweat at work",
	"When should I see a doctor?",
	"Lifestyle changes that help",
];

interface ChatMessage {
	role: "user" | "assistant";
	content: string;
}

export function SupportPageContent() {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	function handleSuggestionClick(question: string) {
		setInput(question);
		textareaRef.current?.focus();
	}

	async function handleSend(e?: React.FormEvent) {
		e?.preventDefault();
		const text = input.trim();
		if (!text || isLoading) return;

		const userMessage: ChatMessage = { role: "user", content: text };
		setMessages((prev) => [...prev, userMessage]);
		setInput("");
		setIsLoading(true);

		try {
			const res = await fetch("/api/auth/ai", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message: text }),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Failed to get response");
			}

			setMessages((prev) => [
				...prev,
				{ role: "assistant", content: data.reply },
			]);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Something went wrong");
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<div className="flex flex-1 flex-col items-center py-8 md:py-12">
			<div className="flex h-full w-full max-w-2xl flex-col space-y-6">
				<div className="space-y-2 text-center">
					<h1 className="text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100 sm:text-4xl">
						AI Support
					</h1>
					<p className="mx-auto max-w-lg text-base text-muted-foreground">
						Ask questions, understand triggers, and explore options. This is
						educational support — not medical advice.
					</p>
				</div>

				<Card className="flex flex-1 flex-col overflow-hidden border-sky-200/60 bg-white/80 shadow-lg shadow-sky-100/50 backdrop-blur-sm dark:border-sky-800/40 dark:bg-slate-900/80 dark:shadow-sky-950/30">
					<CardHeader className="pb-3">
						<CardTitle className="text-lg text-sky-900 dark:text-sky-100">
							Quick questions
						</CardTitle>
						<CardDescription>
							Tap a suggestion to add it to the input, or type your own.
						</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-1 flex-col space-y-4">
						<div className="flex flex-wrap gap-2">
							{SUGGESTIONS.map((q) => (
								<button
									key={q}
									type="button"
									onClick={() => handleSuggestionClick(q)}
									disabled={isLoading}
									className="rounded-full border border-sky-200 bg-sky-50/80 px-4 py-2 text-sm text-sky-800 transition-colors hover:border-sky-300 hover:bg-sky-100 disabled:opacity-50 dark:border-sky-700/50 dark:bg-sky-900/30 dark:text-sky-200 dark:hover:border-sky-600 dark:hover:bg-sky-800/40"
								>
									{q}
								</button>
							))}
						</div>

						<div className="flex min-h-[200px] flex-1 flex-col overflow-hidden rounded-xl border border-sky-200/60 bg-sky-50/50 dark:border-sky-800/40 dark:bg-slate-800/50">
							{messages.length > 0 && (
								<div className="flex-1 space-y-4 overflow-y-auto p-4">
									{messages.map((msg, i) => (
										<div
											key={i}
											className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
										>
											<div
												className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
													msg.role === "user"
														? "bg-sky-600 text-white dark:bg-sky-500"
														: "bg-white text-foreground dark:bg-slate-700 dark:text-sky-100"
												}`}
											>
												<p className="whitespace-pre-wrap">{msg.content}</p>
											</div>
										</div>
									))}
									{isLoading && (
										<div className="flex justify-start">
											<div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 dark:bg-slate-700">
												<Loader2 className="h-4 w-4 animate-spin" />
												<span className="text-sm text-muted-foreground">
													Thinking...
												</span>
											</div>
										</div>
									)}
									<div ref={messagesEndRef} />
								</div>
							)}
							{messages.length === 0 && !isLoading && (
								<div className="flex flex-1 items-center justify-center p-4">
									<p className="text-sm text-muted-foreground">
										Ask anything about hyperhidrosis...
									</p>
								</div>
							)}
							<form onSubmit={handleSend} className="flex gap-2 p-4">
								<Textarea
									ref={textareaRef}
									value={input}
									onChange={(e) => setInput(e.target.value)}
									placeholder="Ask anything about hyperhidrosis..."
									className="min-h-[44px] max-h-32 resize-none border-sky-200 py-3 dark:border-sky-700/50 dark:bg-slate-900/50"
									disabled={isLoading}
									onKeyDown={(e) => {
										if (e.key === "Enter" && !e.shiftKey) {
											e.preventDefault();
											handleSend();
										}
									}}
								/>
								<Button
									type="submit"
									size="icon"
									className="h-[44px] w-12 shrink-0 rounded-xl bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
									disabled={isLoading || !input.trim()}
								>
									{isLoading ? (
										<Loader2 className="h-5 w-5 animate-spin" />
									) : (
										<Send className="h-5 w-5" />
									)}
								</Button>
							</form>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
