import type { Metadata } from "next";
import { ComparisonPendingPage } from "@/components/DemoSitePages";

export const metadata: Metadata = {
  title: "Comparison | FDE Demo",
  description: "Baseline and pack-guided comparison for the GL Exposure proxy experiment."
};

export default function ComparisonRoute() {
  return <ComparisonPendingPage />;
}
