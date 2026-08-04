import type { Metadata } from "next";
import { MopaShell } from "@mopa/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "MOPA: PAS Service",
  description: "Oncology Guideline-Compliant Authorization \u2014 PAS Service",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MopaShell service="PAS Service">{children}</MopaShell>
      </body>
    </html>
  );
}
