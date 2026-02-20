"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogoutButton } from "@/components/auth/logout-button";
import { BookOpen, FileText, MessageCircle, Newspaper, User } from "lucide-react";

interface HeaderProps {
	userEmail?: string;
}

export function Header({ userEmail }: HeaderProps) {
	const pathname = usePathname();
	const avatarLetter = userEmail?.charAt(0).toUpperCase() || "U";

	return (
		<header className="sticky top-0 z-50 w-full border-b border-sky-200/50 bg-white/60 backdrop-blur-md dark:border-sky-800/30 dark:bg-slate-900/60 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-900/60">
			<div className="container flex h-14 items-center">
				<Link
					href="/dashboard"
					className="flex items-center gap-2 font-bold text-sky-800 dark:text-sky-200"
				>
					<FileText className="h-5 w-5" />
					<span>HidroCare</span>
				</Link>
				<nav className="ml-auto flex items-center gap-2 sm:gap-4">
					<Link href="/about">
						<Button
						variant={pathname === "/about" ? "secondary" : "ghost"}
						size="sm"
						className="gap-2 text-sky-700 dark:text-sky-300"
					>
						<BookOpen className="h-4 w-4" />
						<span className="hidden sm:inline">About</span>
						</Button>
					</Link>
					<Link href="/latest-news">
						<Button
							variant={pathname === "/latest-news" ? "secondary" : "ghost"}
							size="sm"
							className="gap-2 text-sky-700 dark:text-sky-300"
						>
							<Newspaper className="h-4 w-4" />
							<span className="hidden sm:inline">Latest News</span>
						</Button>
					</Link>
					<Link href="/ai-support">
						<Button
							variant={pathname === "/ai-support" ? "secondary" : "ghost"}
							size="sm"
							className="gap-2 text-sky-700 dark:text-sky-300"
						>
							<MessageCircle className="h-4 w-4" />
							<span className="hidden sm:inline">AI Support</span>
						</Button>
					</Link>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="relative h-8 w-8 rounded-full">
								<Avatar className="h-8 w-8">
									<AvatarFallback>{avatarLetter}</AvatarFallback>
								</Avatar>
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className="w-56" align="end" forceMount>
							<div className="flex flex-col gap-2 px-2 py-1.5">
								<div className="flex items-center gap-2">
									<User className="h-4 w-4" />
									<span className="font-medium text-sm">Account</span>
								</div>
								<p className="text-xs text-muted-foreground">{userEmail}</p>
							</div>
							<DropdownMenuSeparator />
							<DropdownMenuItem asChild>
								<LogoutButton />
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</nav>
			</div>
		</header>
	);
}
