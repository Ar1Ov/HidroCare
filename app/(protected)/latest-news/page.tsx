import type { Metadata } from "next";
import { LatestNewsContent } from "@/components/latest-news/latest-news-content";

export const metadata: Metadata = {
	title: "Latest News & Science | HidroCare",
	description:
		"Stay updated with news and science articles related to hyperhidrosis — treatment research, lifestyle tips, and community updates.",
};

export default function LatestNewsPage() {
	return <LatestNewsContent />;
}
