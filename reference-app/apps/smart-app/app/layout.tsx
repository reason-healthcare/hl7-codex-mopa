import type { Metadata } from "next";
import { MopaShell } from "@mopa/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "MOPA: CDS SMART App",
  description: "Oncology Guideline-Compliant Authorization \u2014 CDS SMART App",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MopaShell service="CDS SMART App">{children}</MopaShell>
      </body>
    </html>
  );
}
