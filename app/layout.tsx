import type { Metadata } from "next";
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/table/lib/css/table.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "GL Exposures",
  description: "Blueprint.js baseline proxy for a synthetic GL exposure review workbench."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
