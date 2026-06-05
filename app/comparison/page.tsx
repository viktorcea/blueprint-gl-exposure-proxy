import type { Metadata } from "next";
import { ComparisonPendingPage } from "@/components/DemoSitePages";

export const metadata: Metadata = {
  title: "Comparison Pending | FDE Demo",
  description: "Pending comparison for the GL Exposure proxy experiment."
};

export default function ComparisonRoute() {
  return <ComparisonPendingPage />;
}
