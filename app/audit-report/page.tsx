import type { Metadata } from "next";
import { AuditReportPendingPage } from "@/components/DemoSitePages";

export const metadata: Metadata = {
  title: "Audit Report Pending | FDE Demo",
  description: "Pending technical and system audit report for the Blueprint baseline."
};

export default function AuditReportRoute() {
  return <AuditReportPendingPage />;
}
