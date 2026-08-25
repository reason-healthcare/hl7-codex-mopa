import type { Metadata } from "next";
import { MopaShell } from "@mopa/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "MOPA: EHR",
  description: "Oncology Guideline-Compliant Authorization — EHR",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MopaShell service="EHR" branded>{children}</MopaShell>
      </body>
    </html>
  );
}
