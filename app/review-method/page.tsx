import type { Metadata } from "next";
import { ReviewMethodPage } from "@/components/DemoSitePages";

export const metadata: Metadata = {
  title: "Review Method | FDE Demo",
  description: "Design critique and technical audit gates for the GL Exposure proxy experiment."
};

export default function ReviewMethodRoute() {
  return <ReviewMethodPage />;
}
