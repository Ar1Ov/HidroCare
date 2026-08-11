import type { Metadata } from "next";
import { FindCareContent } from "@/components/find-care/find-care-content";

export const metadata: Metadata = {
  title: "Find Care | HidroCare",
  description: "Search public CMS NPI Registry dermatologist records and access the IHhS Clinician Finder.",
};

export default function FindCarePage() {
  return <FindCareContent />;
}
