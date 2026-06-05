import type { Metadata } from "next";
import { GlExposureWorkbench } from "@/components/GlExposureWorkbench";

export const metadata: Metadata = {
  title: "Blueprint Base | GL Exposure Proxy",
  description: "Fair Blueprint.js baseline for the synthetic GL Exposure review workbench."
};

export default function BlueprintBaseRoute() {
  return <GlExposureWorkbench />;
}
