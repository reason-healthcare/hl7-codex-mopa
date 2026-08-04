import type { Metadata } from "next";
import { MopaShell } from "@mopa/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "MOPA: Hub",
  description: "Oncology Guideline-Compliant Authorization \u2014 Hub",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MopaShell service="Hub">{children}</MopaShell>
      </body>
    </html>
  );
}
