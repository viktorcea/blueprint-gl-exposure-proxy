import type { Metadata } from "next";
import { DemoOverviewPage } from "@/components/DemoSitePages";

export const metadata: Metadata = {
  title: "FDE Demo | Blueprint GL Exposure Proxy",
  description: "Interim route overview for the Blueprint.js GL Exposure proxy experiment."
};

export default function Home() {
  return <DemoOverviewPage />;
}
