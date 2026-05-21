import type { Metadata } from "next";
import { OgcaShell } from "@ogca/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "OGCA: CRD Service",
  description: "Oncology Guideline-Compliant Authorization \u2014 CRD Service",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <OgcaShell service="CRD Service">{children}</OgcaShell>
      </body>
    </html>
  );
}
