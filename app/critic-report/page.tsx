import type { Metadata } from "next";
import { CriticReportPendingPage } from "@/components/DemoSitePages";

export const metadata: Metadata = {
  title: "Critic Report | FDE Demo",
  description: "Completed design critique report for the Blueprint baseline."
};

export default function CriticReportRoute() {
  return <CriticReportPendingPage />;
}
