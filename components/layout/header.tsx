"use client";

import Link from "next/link";
import Image from "next/image";
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
import { BookOpen, ClipboardList, MapPin, Menu, MessageCircle, Newspaper, User } from "lucide-react";

interface HeaderProps {
	userEmail?: string;
}

export function Header({ userEmail }: HeaderProps) {
	const pathname = usePathname();
	const avatarLetter = userEmail?.charAt(0).toUpperCase() || "U";

	return (
		<header className="sticky top-0 z-50 w-full border-b border-teal-200/50 bg-[#fffdf7]/80 backdrop-blur-xl dark:border-teal-800/30 dark:bg-slate-950/70 supports-[backdrop-filter]:bg-[#fffdf7]/75 dark:supports-[backdrop-filter]:bg-slate-950/65">
			<div className="flex h-14 w-full items-center px-2 sm:px-4">
				<Link
					href="/dashboard"
					className="flex shrink-0 items-center gap-2 font-bold text-teal-800 dark:text-teal-200"
				>
					<Image src="/hidrocare-logo.png" alt="" width={28} height={28} className="h-7 w-7 rounded-md object-contain" priority />
					<span>HidroCare</span>
				</Link>
				<div className="ml-auto flex items-center gap-1">
				<nav className="hidden min-w-0 items-center gap-1 xl:flex" aria-label="Main navigation">
					<Link href="/survey">
						<Button
							variant={pathname === "/survey" ? "secondary" : "ghost"}
							size="sm"
							className="gap-2 text-teal-700 dark:text-teal-300"
						>
							<ClipboardList className="h-4 w-4" />
							<span>Survey</span>
						</Button>
					</Link>
					<Link href="/about">
						<Button
						variant={pathname === "/about" ? "secondary" : "ghost"}
						size="sm"
						className="gap-2 text-teal-700 dark:text-teal-300"
					>
						<BookOpen className="h-4 w-4" />
						<span>Understanding Hyperhidrosis</span>
						</Button>
					</Link>
					<Link href="/latest-news">
						<Button
							variant={pathname === "/latest-news" ? "secondary" : "ghost"}
							size="sm"
							className="gap-2 text-teal-700 dark:text-teal-300"
						>
							<Newspaper className="h-4 w-4" />
							<span>Latest News</span>
						</Button>
					</Link>
					<Link href="/ai-support">
						<Button
							variant={pathname === "/ai-support" ? "secondary" : "ghost"}
							size="sm"
							className="gap-2 text-teal-700 dark:text-teal-300"
						>
							<MessageCircle className="h-4 w-4" />
							<span>AI Chatbot</span>
						</Button>
					</Link>
					<Link href="/find-care">
						<Button
							variant={pathname === "/find-care" ? "secondary" : "ghost"}
							size="sm"
							className="gap-2 text-teal-700 dark:text-teal-300"
						>
							<MapPin className="h-4 w-4" />
							<span>Find a Dermatologist</span>
						</Button>
					</Link>
				</nav>

				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="sm" className="gap-2 border-teal-200 bg-white/70 text-teal-800 xl:hidden dark:border-teal-800 dark:bg-slate-900/70 dark:text-teal-200" aria-label="Open navigation menu">
							<Menu className="h-4 w-4" /> Menu
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-64 rounded-2xl p-2" align="end">
						<DropdownMenuItem asChild><Link href="/survey" className="flex gap-3 rounded-xl py-2.5"><ClipboardList className="h-4 w-4 text-teal-600" /> Survey</Link></DropdownMenuItem>
						<DropdownMenuItem asChild><Link href="/about" className="flex gap-3 rounded-xl py-2.5"><BookOpen className="h-4 w-4 text-teal-600" /> Understanding Hyperhidrosis</Link></DropdownMenuItem>
						<DropdownMenuItem asChild><Link href="/latest-news" className="flex gap-3 rounded-xl py-2.5"><Newspaper className="h-4 w-4 text-teal-600" /> Latest News</Link></DropdownMenuItem>
						<DropdownMenuItem asChild><Link href="/ai-support" className="flex gap-3 rounded-xl py-2.5"><MessageCircle className="h-4 w-4 text-teal-600" /> AI Chatbot</Link></DropdownMenuItem>
						<DropdownMenuItem asChild><Link href="/find-care" className="flex gap-3 rounded-xl py-2.5"><MapPin className="h-4 w-4 text-teal-600" /> Find a Dermatologist</Link></DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

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
				</div>
			</div>
		</header>
	);
}
