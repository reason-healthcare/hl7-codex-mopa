import type { Metadata } from "next";
import { OgcaShell } from "@ogca/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "OGCA: CDS SMART App",
  description: "Oncology Guideline-Compliant Authorization \u2014 CDS SMART App",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <OgcaShell service="CDS SMART App">{children}</OgcaShell>
      </body>
    </html>
  );
}
