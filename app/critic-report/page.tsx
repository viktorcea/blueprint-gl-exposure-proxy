import type { Metadata } from "next";
import { CriticReportPendingPage } from "@/components/DemoSitePages";

export const metadata: Metadata = {
  title: "Critic Report Pending | FDE Demo",
  description: "Pending design critique report for the Blueprint baseline."
};

export default function CriticReportRoute() {
  return <CriticReportPendingPage />;
}
