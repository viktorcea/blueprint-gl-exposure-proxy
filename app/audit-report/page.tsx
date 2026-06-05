import type { Metadata } from "next";
import { AuditReportPendingPage } from "@/components/DemoSitePages";

export const metadata: Metadata = {
  title: "Audit Report | FDE Demo",
  description: "Completed technical and system audit report for the Blueprint baseline."
};

export default function AuditReportRoute() {
  return <AuditReportPendingPage />;
}
