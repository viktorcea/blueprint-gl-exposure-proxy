import type { Metadata } from "next";
import { PackGuidedWorkbench } from "@/components/PackGuidedWorkbench";

export const metadata: Metadata = {
  title: "Pack Guided | GL Exposure Proxy",
  description: "UX pack-guided Blueprint.js revision for the synthetic GL Exposure review workbench."
};

export default function PackGuidedRoute() {
  return <PackGuidedWorkbench />;
}
