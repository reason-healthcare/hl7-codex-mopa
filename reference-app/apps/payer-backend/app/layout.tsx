import type { Metadata } from "next";
import { MopaShell } from "@mopa/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "MOPA: Payer Backend",
  description: "Oncology Guideline-Compliant Authorization \u2014 Payer Backend",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MopaShell service="Payer Backend">{children}</MopaShell>
      </body>
    </html>
  );
}
