import type { Metadata } from "next";
import { OgcaShell } from "@ogca/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "OGCA: PAS Service",
  description: "Oncology Guideline-Compliant Authorization \u2014 PAS Service",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <OgcaShell service="PAS Service">{children}</OgcaShell>
      </body>
    </html>
  );
}
