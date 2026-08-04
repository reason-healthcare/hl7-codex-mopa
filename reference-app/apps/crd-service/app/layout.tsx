import type { Metadata } from "next";
import { MopaShell } from "@mopa/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "MOPA: CRD Service",
  description: "Oncology Guideline-Compliant Authorization \u2014 CRD Service",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MopaShell service="CRD Service">{children}</MopaShell>
      </body>
    </html>
  );
}
