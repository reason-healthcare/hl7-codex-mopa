import type { Metadata } from "next";
import { OgcaShell } from "@ogca/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "OGCA: Payer Backend",
  description: "Oncology Guideline-Compliant Authorization \u2014 Payer Backend",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <OgcaShell service="Payer Backend">{children}</OgcaShell>
      </body>
    </html>
  );
}
