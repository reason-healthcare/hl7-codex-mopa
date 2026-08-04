import type { Metadata } from "next";
import { MopaShell } from "@mopa/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "MOPA: DTR Client",
  description: "Oncology Guideline-Compliant Authorization \u2014 DTR Client",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <MopaShell service="DTR Client">{children}</MopaShell>
      </body>
    </html>
  );
}
