"use client";

/**
 * Latest News & Science — hyperhidrosis-related articles
 *
 * Page outline:
 * 1. Hero: title + description
 * 2. Category filter: All | News | Science
 * 3. Article grid/list: ArticleCard per item
 *
 * Data: Replace the empty `articles` array with API/Supabase/static data.
 * Each article needs: id, title, excerpt, source, url, date, category.
 */

import { Newspaper, ExternalLink } from "lucide-react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type ArticleCategory = "news" | "science";

export interface Article {
	id: string;
	title: string;
	excerpt: string;
	source: string;
	url: string;
	date: string;
	category: ArticleCategory;
}

export function LatestNewsContent() {
	// Placeholder: empty for now. Replace with real data (API, Supabase, etc.)
	const articles: Article[] = [];

	return (
		<div className="flex flex-1 flex-col py-8 md:py-12">
			<div className="w-full max-w-3xl mx-auto space-y-6">
				<div className="space-y-2 text-center">
					<h1 className="text-3xl font-bold tracking-tight text-sky-900 dark:text-sky-100 sm:text-4xl">
						Latest News &amp; Science
					</h1>
					<p className="mx-auto max-w-lg text-base text-muted-foreground">
						Stay updated with news and research related to hyperhidrosis.
					</p>
				</div>

				{/* Category tabs — ready for filtering when data exists */}
				<div className="flex justify-center gap-2">
					<Button variant="secondary" size="sm" disabled>
						All
					</Button>
					<Button variant="ghost" size="sm" disabled>
						News
					</Button>
					<Button variant="ghost" size="sm" disabled>
						Science
					</Button>
				</div>

				{articles.length === 0 ? (
					<Card className="overflow-hidden border-sky-200/60 bg-white/80 shadow-lg shadow-sky-100/50 backdrop-blur-sm dark:border-sky-800/40 dark:bg-slate-900/80 dark:shadow-sky-950/30">
						<CardHeader className="pb-3">
							<EmptyState />
						</CardHeader>
					</Card>
				) : (
					<div className="space-y-4">
						{articles.map((article) => (
							<ArticleCard key={article.id} article={article} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}

function EmptyState() {
	return (
		<div className="flex flex-col items-center justify-center py-12 text-center">
			<Newspaper className="h-12 w-12 text-muted-foreground/50 mb-4" />
			<CardTitle className="text-lg text-sky-900 dark:text-sky-100">
				No articles yet
			</CardTitle>
			<CardDescription className="mt-1 max-w-sm">
				Articles and research papers will appear here once they are added.
			</CardDescription>
		</div>
	);
}

function ArticleCard({ article }: { article: Article }) {
	return (
		<Card className="overflow-hidden border-sky-200/60 bg-white/80 shadow-lg shadow-sky-100/50 backdrop-blur-sm transition-colors hover:border-sky-300 dark:border-sky-800/40 dark:bg-slate-900/80 dark:shadow-sky-950/30 dark:hover:border-sky-700">
			<CardHeader className="pb-2">
				<div className="flex items-start justify-between gap-2">
					<CardTitle className="text-base font-semibold leading-tight text-sky-900 dark:text-sky-100">
						{article.title}
					</CardTitle>
					<a
						href={article.url}
						target="_blank"
						rel="noopener noreferrer"
						className="shrink-0 text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
						aria-label="Open article"
					>
						<ExternalLink className="h-4 w-4" />
					</a>
				</div>
				<CardDescription>
					{article.source} · {article.date}
				</CardDescription>
			</CardHeader>
			<CardContent className="pt-0">
				<p className="text-sm text-muted-foreground line-clamp-2">
					{article.excerpt}
				</p>
			</CardContent>
		</Card>
	);
}
