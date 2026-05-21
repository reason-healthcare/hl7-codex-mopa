import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OGCA Reference Implementation",
  description: "Oncology Guideline-Compliant Authorization — Reference Implementation Hub",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
